import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, SORTS, TAGS } from '../taxonomy'
import type { CategoryId, SortId, TagId } from '../taxonomy'

interface StoreEntry {
  full_name: string
  owner: string
  name: string
  description: string
  stars: number
  created_at: string
  updated_at: string
  pushed_at: string
  language: string | null
  license: string | null
  homepage: string | null
  html_url: string
  topics: string[]
  fork: boolean
  archived: boolean
  category: CategoryId
  tags: TagId[]
  primaryTag: TagId
  indexed: boolean
}

interface CatalogResponse {
  ok: boolean
  total: number
  fetched: number
  partial?: boolean
  entries: StoreEntry[]
  error?: { message: string }
}

type CategoryFilter = 'all' | 'installed' | CategoryId
type TagFilter = 'all' | 'indexed' | TagId
type InstallPhase = 'installing' | 'installed' | 'error' | 'uninstalling'

const PAGE_SIZES = [10, 30, 50]

const TAG_LABEL: Record<string, string> = Object.fromEntries(TAGS.map((t) => [t.id, t.zh]))
const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.zh]))

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function searchText(entry: StoreEntry): string {
  return [
    entry.full_name,
    entry.owner,
    entry.name,
    entry.description,
    ...entry.topics,
    TAG_LABEL[entry.primaryTag] ?? '',
    CATEGORY_LABEL[entry.category] ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

function matchesSpec(specs: string[], fullName: string): boolean {
  const needle = fullName.toLowerCase()
  return specs.some((s) => s.toLowerCase().includes(needle))
}

function extractOwnerRepo(spec: string): string | null {
  const git = spec.match(/(?:github\.com[\/:]|^github:)([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:#|$)/i)
  if (git) return `${git[1]}/${git[2]}`
  if (/^[\w.-]+\/[\w.-]+$/.test(spec)) return spec
  return null
}

function parseSpec(input: string): string | null {
  let s = input.trim()
  if (!s) return null
  // If it's a full command (dsh plugin add … / pnpm add …), take the spec after "add".
  const cmd = s.match(/(?:^|\s)add\s+(.+)$/)
  if (cmd) s = cmd[1].trim()
  s = s.replace(/^['"]|['"]$/g, '')
  if (!s) return null
  if (/^[\w.-]+\/[\w.-]+$/.test(s)) return `github:${s}`
  const url = s.match(/^(?:https?:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?(?:#(.*))?$/i)
  if (url) return `github:${url[1]}${url[2] ? '#' + url[2] : ''}`
  return s
}

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  // Always 7 slots so the pagination bar never shifts when paging.
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '…', total]
  }
  if (current >= total - 3) {
    return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export function StoreTab({ t }: { t: (key: string) => string }) {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [tag, setTag] = useState<TagFilter>('all')
  const [sort, setSort] = useState<SortId>('stars')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [jump, setJump] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [installedSpecs, setInstalledSpecs] = useState<string[]>([])
  const [installing, setInstalling] = useState<Record<string, InstallPhase>>({})
  const [installErrors, setInstallErrors] = useState<Record<string, string>>({})
  const [installMeta, setInstallMeta] = useState<Record<string, { pushedAt: string; installedAt: number }>>({})

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null
    setLoading(true)
    setError(null)

    const load = (refresh: boolean) => {
      const url = refresh ? '/plugin-store/catalog?refresh=1' : '/plugin-store/catalog'
      Promise.all([
        fetch(url).then((r) => r.json()),
        fetch('/plugin-store/installed').then((r) => r.json()),
        fetch('/plugin-store/install-meta').then((r) => r.json()),
      ]).then(
        ([c, i, m]) => {
          if (!alive) return
          if (!c || c.ok !== true) throw new Error(c?.error?.message || 'catalog load failed')
          setCatalog(c)
          const deps = i && i.dependencies && typeof i.dependencies === 'object' ? Object.values(i.dependencies) : []
          setInstalledSpecs(deps.filter((s): s is string => typeof s === 'string'))
          setInstallMeta(m && m.meta && typeof m.meta === 'object' ? m.meta : {})
          setLoading(false)
          const stillPartial =
            c.partial === true ||
            (typeof c.fetched === 'number' && typeof c.total === 'number' && c.fetched > 0 && c.fetched < c.total)
          if (stillPartial) {
            timer = setTimeout(() => load(false), 8000)
          }
        },
        (e) => {
          if (!alive) return
          setError(e instanceof Error ? e.message : String(e))
          setLoading(false)
        },
      )
    }

    load(refreshKey > 0)
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [refreshKey])

  const isInstalled = (entry: StoreEntry): boolean =>
    installing[entry.full_name] === 'installed' || matchesSpec(installedSpecs, entry.full_name)

  const hasUpdate = (entry: StoreEntry): boolean => {
    if (!isInstalled(entry)) return false
    const meta = installMeta[entry.full_name]
    if (!meta || !meta.pushedAt) return false
    return (entry.pushed_at || '') > meta.pushedAt
  }

  const facetCounts = useMemo(() => {
    const entries = catalog?.entries ?? []
    const byTag: Record<string, number> = {}
    let indexed = 0
    for (const e of entries) {
      if (e.indexed) indexed++
      const key = e.primaryTag
      byTag[key] = (byTag[key] ?? 0) + 1
    }
    return { byTag, indexed, total: entries.length }
  }, [catalog])

  const filtered = useMemo(() => {
    const entries = catalog?.entries ?? []
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (q && !searchText(e).includes(q)) return false
      if (category === 'installed') return installing[e.full_name] === 'installed' || matchesSpec(installedSpecs, e.full_name)
      if (category !== 'all' && e.category !== category) return false
      if (tag === 'indexed') return e.indexed
      if (tag !== 'all' && e.primaryTag !== tag && !e.tags.includes(tag)) return false
      return true
    })
  }, [catalog, query, category, tag, installedSpecs, installing])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sort) {
      case 'recent':
        list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        break
      case 'updated':
        list.sort((a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''))
        break
      case 'name':
        list.sort((a, b) => a.full_name.localeCompare(b.full_name))
        break
      default:
        list.sort((a, b) => b.stars - a.stars)
    }
    return list
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageEntries = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 6000)
  }

  const doInstall = (spec: string): Promise<void> => {
    const key = extractOwnerRepo(spec) ?? spec
    setInstalling((prev) => ({ ...prev, [key]: 'installing' }))
    setInstallErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    return fetch('/plugin-store/install', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ spec }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok) {
          setInstalling((prev) => ({ ...prev, [key]: 'installed' }))
          setInstalledSpecs((prev) => [...prev, spec])
          fetch('/plugin-store/install-meta')
            .then((r) => r.json())
            .then((m) => setInstallMeta(m && m.meta && typeof m.meta === 'object' ? m.meta : {}))
          showNotice('success', res.log || `${spec} ${t('installSuccess')}`)
        } else {
          setInstalling((prev) => ({ ...prev, [key]: 'error' }))
          const msg = res?.log || res?.error?.message || t('installFailed')
          setInstallErrors((prev) => ({ ...prev, [key]: msg }))
          showNotice('error', `${spec}: ${msg}`)
        }
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e)
        setInstalling((prev) => ({ ...prev, [key]: 'error' }))
        setInstallErrors((prev) => ({ ...prev, [key]: msg }))
        showNotice('error', `${spec}: ${msg}`)
      })
  }

  const doUninstall = (fullName: string) => {
    setInstalling((prev) => ({ ...prev, [fullName]: 'uninstalling' }))
    fetch('/plugin-store/uninstall', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ full_name: fullName }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok) {
          setInstalling((prev) => {
            const next = { ...prev }
            delete next[fullName]
            return next
          })
          setInstalledSpecs((prev) => prev.filter((s) => !s.toLowerCase().includes(fullName.toLowerCase())))
          showNotice('success', res.log || t('uninstallSuccess'))
        } else {
          setInstalling((prev) => {
            const next = { ...prev }
            delete next[fullName]
            return next
          })
          showNotice('error', res?.log || res?.error?.message || t('uninstallFailed'))
        }
      })
      .catch((e) => {
        setInstalling((prev) => {
          const next = { ...prev }
          delete next[fullName]
          return next
        })
        showNotice('error', e instanceof Error ? e.message : String(e))
      })
  }

  const updatableCount = (catalog?.entries ?? []).filter((e) => isInstalled(e) && hasUpdate(e)).length

  const updateAll = async () => {
    const targets = (catalog?.entries ?? []).filter((e) => isInstalled(e) && hasUpdate(e))
    if (targets.length === 0) {
      showNotice('success', '全部已是最新')
      return
    }
    for (const e of targets) {
      await doInstall(`github:${e.full_name}`)
    }
    showNotice('success', `已更新 ${targets.length} 个插件，重启后生效`)
  }

  const submitManual = () => {
    const spec = parseSpec(manualUrl)
    if (!spec) {
      showNotice('error', t('invalidUrl'))
      return
    }
    setShowManual(false)
    setManualUrl('')
    doInstall(spec)
  }

  const resetPage = () => setPage(1)

  const jumpTo = () => {
    const n = Number(jump)
    if (Number.isInteger(n) && n >= 1 && n <= totalPages) {
      setPage(n)
      setJump('')
    }
  }

  const total = catalog?.total ?? 0
  const fetched = catalog?.fetched ?? 0
  const partial = catalog?.partial === true

  return (
    <div className="ps-root" aria-busy={loading}>
      {loading ? <p className="ps-status">{t('loading')}</p> : null}

      {error ? (
        <div className="ps-failure">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setRefreshKey((k) => k + 1)}>
            {t('retry')}
          </button>
        </div>
      ) : null}

      {catalog ? (
        <>
          {notice ? (
            <div className="ps-notice" data-type={notice.type} role="status">
              <span>{notice.text}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label={t('close')}>
                ×
              </button>
            </div>
          ) : null}

          <div className="ps-heading">
            <h3>
              {total} {t('total')}
            </h3>
            <span>
              {t('indexedCount')} {facetCounts.indexed}
              {fetched > 0 && fetched < total ? ` · 已加载 ${fetched}${partial ? '（限流，部分）' : ''}` : ''}
            </span>
            <div className="ps-heading-actions">
              {category === 'installed' ? (
                <button type="button" className="ps-update-all" onClick={updateAll} disabled={updatableCount === 0}>
                  {t('updateAll')}（{updatableCount}）
                </button>
              ) : null}
              <button type="button" className="ps-manual" onClick={() => setShowManual(true)}>
                {t('manualInstall')}
              </button>
              <button type="button" className="ps-refresh" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
                {t('refresh')}
              </button>
            </div>
          </div>

          <div className="ps-toolbar">
            <label className="ps-search">
              <input
                type="search"
                value={query}
                placeholder={t('search')}
                aria-label={t('search')}
                onChange={(e) => {
                  setQuery(e.currentTarget.value)
                  resetPage()
                }}
              />
            </label>
            <label className="ps-select">
              <span className="ps-select-label">{t('category')}</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.currentTarget.value as CategoryFilter)
                  resetPage()
                }}
                aria-label={t('category')}
              >
                <option value="all">{t('allCategories')}</option>
                <option value="installed">{t('installedFilter')}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.zh}
                  </option>
                ))}
              </select>
            </label>
            <label className="ps-select">
              <span className="ps-select-label">{t('sort')}</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.currentTarget.value as SortId)
                  resetPage()
                }}
                aria-label={t('sort')}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.zh}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ps-tags" role="toolbar" aria-label={t('allTags')}>
            <button
              type="button"
              className="ps-chip"
              data-active={tag === 'all'}
              onClick={() => {
                setTag('all')
                resetPage()
              }}
            >
              {t('allTags')}
              <span className="ps-chip-count">{facetCounts.total}</span>
            </button>
            <button
              type="button"
              className="ps-chip"
              data-active={tag === 'indexed'}
              onClick={() => {
                setTag('indexed')
                resetPage()
              }}
            >
              {t('indexed')}
              <span className="ps-chip-count">{facetCounts.indexed}</span>
            </button>
            {TAGS.map((tg) => (
              <button
                key={tg.id}
                type="button"
                className="ps-chip"
                data-active={tag === tg.id}
                onClick={() => {
                  setTag(tg.id as TagId)
                  resetPage()
                }}
              >
                {tg.zh}
                <span className="ps-chip-count">{facetCounts.byTag[tg.id] ?? 0}</span>
              </button>
            ))}
          </div>

          {category === 'installed' && partial ? (
            <p className="ps-status">正在加载全部插件，已安装列表将自动补全…</p>
          ) : null}

          {facetCounts.total === 0 ? <p className="ps-status">{t('empty')}</p> : null}
          {facetCounts.total > 0 && sorted.length === 0 ? <p className="ps-status">{t('emptySearch')}</p> : null}

          {pageEntries.length > 0 ? (
            <ul className="ps-cards">
              {pageEntries.map((entry) => {
                const phase = installing[entry.full_name]
                const installedNow = isInstalled(entry)
                const hasUpd = hasUpdate(entry)
                return (
                  <li key={entry.full_name} className="ps-card">
                    <div className="ps-card-top">
                      <div className="ps-card-badges">
                        <span className="ps-badge">{TAG_LABEL[entry.primaryTag] ?? entry.primaryTag}</span>
                        {installedNow ? (
                          hasUpd ? (
                            <span className="ps-status-badge" data-type="update">
                              {t('hasUpdate')}
                            </span>
                          ) : (
                            <span className="ps-status-badge" data-type="latest">
                              {t('latestVersion')}
                            </span>
                          )
                        ) : null}
                      </div>
                      <span className="ps-stars">★ {entry.stars.toLocaleString()}</span>
                    </div>
                    <div className="ps-name" title={entry.full_name}>
                      {entry.full_name}
                    </div>
                    {entry.description ? <p className="ps-desc">{entry.description}</p> : null}
                    <div className="ps-meta">
                      {entry.language ? <span>{entry.language}</span> : null}
                      {entry.license ? <span>{entry.license}</span> : null}
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                    <div className="ps-actions">
                      <a className="ps-details" href={entry.html_url} target="_blank" rel="noreferrer">
                        {t('viewDetails')}
                      </a>
                      <button
                        type="button"
                        className="ps-install"
                        data-state={phase === 'error' ? 'error' : installedNow ? 'installed' : 'idle'}
                        disabled={phase === 'installing' || phase === 'uninstalling'}
                        onClick={() => (installedNow && !hasUpd ? doUninstall(entry.full_name) : doInstall(`github:${entry.full_name}`))}
                      >
                        {phase === 'installing'
                          ? t('installing')
                          : phase === 'uninstalling'
                            ? t('uninstalling')
                            : hasUpd
                              ? t('update')
                              : installedNow
                                ? t('uninstall')
                                : t('install')}
                      </button>
                    </div>
                    {phase === 'error' && installErrors[entry.full_name] ? (
                      <p className="ps-install-error">{installErrors[entry.full_name]}</p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}

          {sorted.length > 0 ? (
            <div className="ps-pagination">
              <label className="ps-select">
                <span className="ps-select-label">{t('perPage')}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.currentTarget.value))
                    resetPage()
                  }}
                  aria-label={t('perPage')}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="ps-pagination-center">
              <button
                type="button"
                className="ps-pager ps-icon"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                title={t('prev')}
                aria-label={t('prev')}
              >
                ‹
              </button>
              <div className="ps-pages">
                {pageList(currentPage, totalPages).map((p, idx) =>
                  p === '…' ? (
                    <span key={`e${idx}`} className="ps-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className="ps-pagenum"
                      data-active={p === currentPage}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                className="ps-pager ps-icon"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                title={t('next')}
                aria-label={t('next')}
              >
                ›
              </button>
              </div>
              <label className="ps-jump">
                <span className="ps-select-label">{t('jumpTo')}</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jump}
                  onChange={(e) => setJump(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') jumpTo()
                  }}
                />
                <button type="button" className="ps-pager ps-icon" onClick={jumpTo} title={t('go')} aria-label={t('go')}>
                  ↵
                </button>
              </label>
            </div>
          ) : null}
        </>
      ) : null}

      {showManual ? (
        <div className="ps-modal-backdrop" onClick={() => setShowManual(false)}>
          <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{t('manualInstall')}</h4>
            <p className="ps-modal-hint">{t('manualHint')}</p>
            <input
              type="text"
              value={manualUrl}
              placeholder="dsh plugin add github:owner/repo 或 @scope/pkg"
              onChange={(e) => setManualUrl(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitManual()
              }}
              autoFocus
            />
            <div className="ps-modal-actions">
              <button type="button" className="ps-install" onClick={submitManual}>
                {t('install')}
              </button>
              <button type="button" className="ps-details" onClick={() => setShowManual(false)}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
