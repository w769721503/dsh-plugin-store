// Host half of dsh-plugin-store: registers the /plugin-store/* HTTP routes the
// browser client fetches for the catalog and one-click install. A real plugin
// package is trusted code, so it uses node:child_process / node:fs directly
// (not the sandboxed subprocess service).

import type { IncomingMessage, ServerResponse } from 'node:http'
import { fetchCatalog } from './catalog'
import { readInstalled, runInstall } from './install'

const CACHE_TTL_MS = 10 * 60 * 1000

export const name = 'dsh-plugin-store'
export const inject = ['webServer']

interface Ctx {
  webServer: {
    register(route: { kind: string; path: string; handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void> }): () => void
  }
  effect(disposer: () => () => void, label?: string): void
  logger?: { warn(msg: unknown): void; error(msg: unknown): void }
}

export function apply(ctx: Ctx) {
  const token = process.env.GITHUB_TOKEN || process.env.DSH_PLUGIN_STORE_TOKEN || ''
  const profile = process.env.DSH_PLUGIN_STORE_PROFILE || 'web'

  let cache: { at: number; total: number; entries: unknown[]; partial: boolean } | null = null

  async function catalog(force: boolean) {
    if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache
    const { total, entries, partial } = await fetchCatalog(token)
    cache = { at: Date.now(), total, entries, partial }
    return cache
  }

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: '/plugin-store',
        handler: async (req, res) => {
          const url = new URL(req.url ?? '/', 'http://x')
          const pathname = url.pathname
          try {
            if (pathname === '/plugin-store/catalog' && (req.method === 'GET' || req.method === 'HEAD')) {
              const force = url.searchParams.get('refresh') === '1'
              const data = await catalog(force)
              sendJson(res, 200, {
                ok: true,
                total: data.total,
                fetched: data.entries.length,
                partial: data.partial,
                entries: data.entries,
              })
              return
            }

            if (pathname === '/plugin-store/installed' && req.method === 'GET') {
              sendJson(res, 200, { ok: true, ...readInstalled(profile) })
              return
            }

            if (pathname === '/plugin-store/install' && req.method === 'POST') {
              const body = (await readJson(req)) as { full_name?: unknown }
              const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : ''
              if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
                sendJson(res, 400, { ok: false, error: { code: 'bad_full_name', message: 'Invalid repository name.' } })
                return
              }
              const result = await runInstall(fullName, profile, token)
              sendJson(res, result.ok ? 200 : 500, {
                ok: result.ok,
                full_name: fullName,
                code: result.code,
                log: result.log.slice(-4000),
              })
              return
            }

            sendJson(res, 404, { ok: false, error: { code: 'not_found', message: 'Unknown route.' } })
          } catch (err) {
            ctx.logger?.error(err)
            sendJson(res, 500, {
              ok: false,
              error: { code: 'internal', message: err instanceof Error ? err.message : String(err) },
            })
          }
        },
      }),
    'plugin-store: routes',
  )
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(body)
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      body += chunk
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large.'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}
