// Installs / uninstalls / updates plugins in the running DSH profile:
// pre-check whether a repo is an installable DSH bundle, run `pnpm add` /
// `pnpm remove` in the profile directory, then reconcile `dsh.profile.bundles`.
// Activation still requires a DSH restart.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
function isBundle(dep: string, profile: string): boolean {
  try {
    const manifestPath = join(profileDir(profile), 'node_modules', dep, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return manifest.dsh?.bundle?.patch !== undefined
  } catch {
    return false
  }
}

/** Add new bundle deps and drop bundles whose dependency was removed. */
function reconcile(profile: string): void {
  const pkgPath = join(profileDir(profile), 'package.json')
  if (!existsSync(pkgPath)) return
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const deps = Object.keys(pkg.dependencies ?? {})
  const depSet = new Set(deps)
  const bundles: string[] = pkg.dsh?.profile?.bundles ?? []
  let changed = false

  for (const dep of deps) {
    if (isBundle(dep, profile) && !bundles.includes(dep)) {
      bundles.push(dep)
      changed = true
    }
  }

  const filtered = bundles.filter((b) => depSet.has(b))
  if (filtered.length !== bundles.length) {
    bundles.length = 0
    bundles.push(...filtered)
    changed = true
  }

  if (changed) {
    pkg.dsh = {
      ...pkg.dsh,
      profile: { ...(pkg.dsh?.profile ?? {}), bundles },
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
}

export interface InstallMeta {
  [fullName: string]: { pushedAt: string; installedAt: number }
}

function metaFile(): string {
  return join(dshHome(), 'plugin-store-installed.json')
}

export function readInstallMeta(): InstallMeta {
  try {
    if (!existsSync(metaFile())) return {}
    const parsed = JSON.parse(readFileSync(metaFile(), 'utf8'))
    return typeof parsed === 'object' && parsed !== null ? (parsed as InstallMeta) : {}
  } catch {
    return {}
  }
}

function writeInstallMeta(meta: InstallMeta): void {
  try {
    writeFileSync(metaFile(), JSON.stringify(meta))
  } catch {
    // best-effort; update detection metadata is an optimization
  }
}

export function recordInstall(fullName: string, pushedAt: string): void {
  const meta = readInstallMeta()
  meta[fullName] = { pushedAt, installedAt: Date.now() }
  writeInstallMeta(meta)
}

export function recordUninstall(fullName: string): void {
  const meta = readInstallMeta()
  delete meta[fullName]
  writeInstallMeta(meta)
}

interface RepoInspection {
  isBundle: boolean
  packageName: string | null
  reason: string | null
}

/** Read the repo's package.json from GitHub and decide whether it is a DSH bundle. */
async function inspectRepo(fullName: string, token: string): Promise<RepoInspection> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dsh-plugin-store',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`https://api.github.com/repos/${fullName}/contents/package.json`, { headers })
  if (res.status === 404) {
    return { isBundle: false, packageName: null, reason: '该仓库没有 package.json，不是可安装的 DSH 插件。' }
  }
  if (!res.ok) {
    return { isBundle: false, packageName: null, reason: `读取 package.json 失败（HTTP ${res.status}）。` }
  }

  const data = (await res.json()) as { content?: string }
  let pkg: { name?: unknown; dsh?: { bundle?: { patch?: unknown } } } = {}
  try {
    pkg = JSON.parse(Buffer.from(data.content ?? '', 'base64').toString('utf8'))
  } catch {
    return { isBundle: false, packageName: null, reason: 'package.json 解析失败。' }
  }

  const bundle = pkg.dsh?.bundle?.patch !== undefined
  return {
    isBundle: bundle,
    packageName: typeof pkg.name === 'string' ? pkg.name : null,
    reason: bundle ? null : '该仓库未声明 dsh.bundle.patch，不是可安装的 DSH 插件。',
  }
}

/** Fetch the repo's latest push time, used as the baseline for update detection. */
async function fetchRepoPushedAt(fullName: string, token: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dsh-plugin-store',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, { headers })
    if (!res.ok) return ''
    const data = (await res.json()) as { pushed_at?: string }
    return typeof data.pushed_at === 'string' ? data.pushed_at : ''
  } catch {
    return ''
  }
}

export interface InstallResult {
  ok: boolean
  code: number | null
  log: string
}

const INSTALL_TIMEOUT_MS = 10 * 60 * 1000

function pnpmRun(args: string[], profile: string, onLog?: (line: string) => void): Promise<{ code: number | null; log: string }> {
  return new Promise((resolve) => {
    const cwd = profileDir(profile)
    // `shell: true` on Windows resolves the pnpm.cmd shim (cmd.exe).
    const child = spawn('pnpm', args, {
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
      log += '\n[操作超时]'
      child.kill()
    }, INSTALL_TIMEOUT_MS)

    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ code: null, log: String(err) })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, log })
    })
  })
}

/** Map a repository `owner/repo` back to its installed dependency key. */
function findDependencyKey(fullName: string, profile: string): string | null {
  const deps = readInstalled(profile).dependencies
  const needle = fullName.toLowerCase()
  const short = fullName.split('/')[1]?.toLowerCase() ?? ''
  for (const [key, value] of Object.entries(deps)) {
    if (typeof value === 'string' && value.toLowerCase().includes(needle)) return key
    if (key.toLowerCase() === short) return key
  }
  return null
}

export async function runInstall(
  fullName: string,
  profile = 'web',
  token = '',
  onLog?: (line: string) => void,
): Promise<InstallResult> {
  // 1. Pre-check: is the repo an installable DSH bundle?
  try {
    const info = await inspectRepo(fullName, token)
    if (!info.isBundle) {
      return { ok: false, code: null, log: info.reason ?? '该仓库不是可安装的 DSH 插件。' }
    }
  } catch {
    // Pre-check failed (network / rate limit) — proceed and let pnpm decide.
  }

  // 2. Is this an update of an already-installed plugin? Record the baseline push time.
  const isUpdate = findDependencyKey(fullName, profile) !== null
  let pushedAt = ''
  try {
    pushedAt = await fetchRepoPushedAt(fullName, token)
  } catch {
    pushedAt = ''
  }

  // 3. pnpm add (updates in place when already installed).
  const result = await pnpmRun(['add', `github:${fullName}`], profile, onLog)
  if (result.code !== 0) {
    return { ok: false, code: result.code, log: result.log.slice(-4000) || '安装失败（pnpm 退出码非 0）。' }
  }

  // 4. Reconcile the profile bundle list.
  try {
    reconcile(profile)
  } catch (err) {
    return {
      ok: false,
      code: 0,
      log: `安装完成但写入 bundle 失败：${err instanceof Error ? err.message : String(err)}`,
    }
  }

  // 5. Confirm the package is a bundle.
  const key = findDependencyKey(fullName, profile)
  const after = readInstalled(profile).bundles
  if (key === null || !after.includes(key)) {
    return { ok: false, code: 0, log: '已作为普通依赖安装，但未声明 dsh.bundle —— 该仓库不是 DSH 插件。' }
  }

  recordInstall(fullName, pushedAt)
  return { ok: true, code: 0, log: isUpdate ? '更新成功，重启 DSH 后生效。' : '安装成功，重启 DSH 后生效。' }
}

export async function runUninstall(
  fullName: string,
  profile = 'web',
): Promise<InstallResult> {
  const key = findDependencyKey(fullName, profile)
  if (!key) {
    return { ok: false, code: null, log: '未找到已安装的对应插件。' }
  }

  // Uninstall locally without pnpm: `pnpm remove` re-resolves git deps over
  // the network and can hang. Editing package.json + dropping the bundle is
  // enough for the runtime; the lockfile is reconciled on the next install.
  try {
    const pkgPath = join(profileDir(profile), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    if (pkg.dependencies && typeof pkg.dependencies === 'object') {
      delete pkg.dependencies[key]
    }
    if (pkg.dsh?.profile?.bundles && Array.isArray(pkg.dsh.profile.bundles)) {
      pkg.dsh.profile.bundles = pkg.dsh.profile.bundles.filter((b: string) => b !== key)
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  } catch (err) {
    return { ok: false, code: null, log: `卸载失败：${err instanceof Error ? err.message : String(err)}` }
  }

  // Best-effort remove the installed directory.
  try {
    rmSync(join(profileDir(profile), 'node_modules', key), { recursive: true, force: true })
  } catch {
    // ignore — an orphaned directory is harmless
  }

  recordUninstall(fullName)
  return { ok: true, code: 0, log: '卸载成功，重启 DSH 后生效。' }
}
