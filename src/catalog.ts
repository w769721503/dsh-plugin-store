// Fetches and normalizes the plugin catalog from the GitHub Search API for
// the `dsh-plugin` topic. Results are reduced to the leaf fields the store UI
// needs (no live objects cross the JSON boundary).

import { classify, type Classification } from './categories'

export interface PluginEntry extends Classification {
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
}

const GITHUB_API = 'https://api.github.com/search/repositories'
const QUERY = 'topic:dsh-plugin'
const PER_PAGE = 100
const MAX_PAGES = 10 // GitHub caps search results at 1000.

export interface CatalogResult {
  total: number
  entries: PluginEntry[]
}

export async function fetchCatalog(token?: string): Promise<CatalogResult> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dsh-plugin-store',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const entries: PluginEntry[] = []
  let total = 0

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${GITHUB_API}?q=${encodeURIComponent(QUERY)}&sort=stars&order=desc&per_page=${PER_PAGE}&page=${page}`
    const res = await fetch(url, { headers })
    if (res.status === 403 || res.status === 429) {
      throw new Error('GitHub API rate limit reached. Add a GITHUB_TOKEN to raise the limit, or retry later.')
    }
    if (!res.ok) throw new Error(`GitHub API request failed (HTTP ${res.status})`)

    const data = (await res.json()) as {
      total_count?: number
      items?: unknown[]
    }
    total = typeof data.total_count === 'number' ? data.total_count : total

    const items = Array.isArray(data.items) ? data.items : []
    if (items.length === 0) break
    for (const item of items) entries.push(normalize(item))
    if (entries.length >= 1000 || items.length < PER_PAGE) break
  }

  return { total, entries }
}

function normalize(item: any): PluginEntry {
  const fullName: string = item.full_name ?? ''
  const owner: string = item.owner?.login ?? ''
  const name: string = item.name ?? ''
  const description: string = item.description ?? ''
  const topics: string[] = Array.isArray(item.topics) ? item.topics : []

  const cls = classify({ topics, language: item.language ?? null, name, description, fullName })

  return {
    full_name: fullName,
    owner,
    name,
    description,
    stars: typeof item.stargazers_count === 'number' ? item.stargazers_count : 0,
    created_at: item.created_at ?? '',
    updated_at: item.updated_at ?? '',
    pushed_at: item.pushed_at ?? '',
    language: item.language ?? null,
    license: item.license?.spdx_id ?? null,
    homepage: item.homepage ?? null,
    html_url: item.html_url ?? `https://github.com/${fullName}`,
    topics,
    fork: item.fork === true,
    archived: item.archived === true,
    ...cls,
  }
}
