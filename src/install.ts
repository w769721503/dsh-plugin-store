// Installs a plugin into the running DSH profile by running `pnpm add` in the
// profile directory and then reconciling `dsh.profile.bundles`, mirroring the
// `dsh plugin add` flow (a bundle = a dependency that declares
// `dsh.bundle.patch`). Activation still requires a DSH restart.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function dshHome(): string {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

export function profileDir(profile: string): string {
  return join(dshHome(), 'profiles', profile)
}

export interface InstalledInfo {
  dependencies: Record<string, string>
  bundles: string[]
}

export function readInstalled(profile = 'web'): InstalledInfo {
  const pkgPath = join(profileDir(profile), 'package.json')
  if (!existsSync(pkgPath)) return { dependencies: {}, bundles: [] }
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    return {
      dependencies: (pkg.dependencies as Record<string, string>) ?? {},
      bundles: (pkg.dsh?.profile?.bundles as string[]) ?? [],
    }
  } catch {
    return { dependencies: {}, bundles: [] }
  }
}

/** Whether an installed dependency declares `dsh.bundle.patch` (i.e. is a bundle). */
function isBundle(dep: string): boolean {
  try {
    const manifestPath = join(dshHome(), 'profiles', 'node_modules', dep, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return manifest.dsh?.bundle?.patch !== undefined
  } catch {
    return false
  }
}

function reconcile(profile: string): void {
  const pkgPath = join(profileDir(profile), 'package.json')
  if (!existsSync(pkgPath)) return
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const deps = Object.keys(pkg.dependencies ?? {})
  const bundles: string[] = pkg.dsh?.profile?.bundles ?? []
  let changed = false

  for (const dep of deps) {
    if (isBundle(dep) && !bundles.includes(dep)) {
      bundles.push(dep)
      changed = true
    }
  }

  if (changed) {
    pkg.dsh = {
      ...pkg.dsh,
      profile: { ...(pkg.dsh?.profile ?? {}), bundles },
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
}

export interface InstallResult {
  ok: boolean
  code: number | null
  log: string
}

const INSTALL_TIMEOUT_MS = 10 * 60 * 1000

export function runInstall(
  fullName: string,
  profile = 'web',
  onLog?: (line: string) => void,
): Promise<InstallResult> {
  return new Promise((resolve) => {
    const spec = `github:${fullName}`
    const cwd = profileDir(profile)
    // `shell: true` on Windows resolves the pnpm.cmd shim (cmd.exe), matching
    // how `dsh plugin` forwards to pnpm.
    const child = spawn('pnpm', ['add', spec], {
      cwd,
      env: process.env,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let log = ''
    const drain = (chunk: Buffer | string) => {
      const text = chunk.toString()
      log += text
      onLog?.(text)
    }
    child.stdout?.on('data', drain)
    child.stderr?.on('data', drain)

    const timer = setTimeout(() => {
      log += '\n[timed out after 10 minutes]'
      child.kill()
    }, INSTALL_TIMEOUT_MS)

    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ ok: false, code: null, log: String(err) })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) {
        try {
          reconcile(profile)
        } catch (err) {
          log += `\n[reconcile failed: ${err instanceof Error ? err.message : String(err)}]`
        }
      }
      resolve({ ok: code === 0, code, log })
    })
  })
}
