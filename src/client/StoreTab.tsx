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
  entries: StoreEntry[]
  error?: { message: string }
}

type CategoryFilter = 'all' | CategoryId
type TagFilter = 'all' | 'indexed' | TagId
type InstallPhase = 'installing' | 'installed' | 'error'

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

export function StoreTab({ t }: { t: (key: string) => string }) {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [tag, setTag] = useState<TagFilter>('all')
  const [sort, setSort] = useState<SortId>('stars')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [installedSpecs, setInstalledSpecs] = useState<string[]>([])
  const [installing, setInstalling] = useState<Record<string, InstallPhase>>({})
  const [installErrors, setInstallErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    const url = refreshKey > 0 ? '/plugin-store/catalog?refresh=1' : '/plugin-store/catalog'
    Promise.all([
      fetch(url).then((r) => r.json()),
      fetch('/plugin-store/installed').then((r) => r.json()),
    ]).then(
      ([c, i]) => {
        if (!alive) return
        if (!c || c.ok !== true) throw new Error(c?.error?.message || 'catalog load failed')
        setCatalog(c)
        const deps = i && i.dependencies && typeof i.dependencies === 'object' ? Object.values(i.dependencies) : []
        setInstalledSpecs(deps.filter((s): s is string => typeof s === 'string'))
        setLoading(false)
      },
      (e) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      },
    )
    return () => {
      alive = false
    }
  }, [refreshKey])

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
      if (category !== 'all' && e.category !== category) return false
      if (tag === 'indexed') return e.indexed
      if (tag !== 'all' && e.primaryTag !== tag && !e.tags.includes(tag)) return false
      return true
    })
  }, [catalog, query, category, tag])

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

  const isInstalled = (entry: StoreEntry): boolean => {
    if (installing[entry.full_name] === 'installed') return true
    const needle = entry.full_name.toLowerCase()
    return installedSpecs.some((s) => s.toLowerCase().includes(needle))
  }

  const install = (entry: StoreEntry) => {
    setInstalling((prev) => ({ ...prev, [entry.full_name]: 'installing' }))
    setInstallErrors((prev) => {
      const next = { ...prev }
      delete next[entry.full_name]
      return next
    })
    fetch('/plugin-store/install', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ full_name: entry.full_name }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok) {
          setInstalling((prev) => ({ ...prev, [entry.full_name]: 'installed' }))
          setInstalledSpecs((prev) => [...prev, entry.full_name])
        } else {
          setInstalling((prev) => ({ ...prev, [entry.full_name]: 'error' }))
          setInstallErrors((prev) => ({
            ...prev,
            [entry.full_name]: res?.error?.message || res?.log?.trim() || t('installFailed'),
          }))
        }
      })
      .catch((e) => {
        setInstalling((prev) => ({ ...prev, [entry.full_name]: 'error' }))
        setInstallErrors((prev) => ({ ...prev, [entry.full_name]: e instanceof Error ? e.message : String(e) }))
      })
  }

  const resetPage = () => setPage(1)

  const total = catalog?.total ?? 0
  const fetched = catalog?.fetched ?? 0

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
          <div className="ps-heading">
            <h3>
              {total} {t('total')}
            </h3>
            <span>
              {t('indexedCount')} {facetCounts.indexed}
              {fetched > 0 && fetched < total ? ` · 已加载 ${fetched}` : ''}
            </span>
            <button type="button" className="ps-refresh" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
              {t('refresh')}
            </button>
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

          {facetCounts.total === 0 ? <p className="ps-status">{t('empty')}</p> : null}
          {facetCounts.total > 0 && sorted.length === 0 ? <p className="ps-status">{t('emptySearch')}</p> : null}

          {pageEntries.length > 0 ? (
            <ul className="ps-cards">
              {pageEntries.map((entry) => {
                const phase = installing[entry.full_name]
                const installedNow = isInstalled(entry)
                return (
                  <li key={entry.full_name} className="ps-card">
                    <div className="ps-card-top">
                      <span className="ps-badge">{TAG_LABEL[entry.primaryTag] ?? entry.primaryTag}</span>
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
                        disabled={phase === 'installing' || installedNow}
                        onClick={() => install(entry)}
                      >
                        {phase === 'installing'
                          ? t('installing')
                          : installedNow
                            ? `${t('installed')} · ${t('restartHint')}`
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
              <span className="ps-pageinfo">
                {currentPage} / {totalPages}
              </span>
              <button type="button" className="ps-pager" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                {t('prev')}
              </button>
              <button
                type="button"
                className="ps-pager"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                {t('next')}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
