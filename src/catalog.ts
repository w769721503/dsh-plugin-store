// Fetches the plugin catalog from the GitHub Search API for the `dsh-plugin`
// topic. The Search API caps a single query at 1000 results, so we shard the
// topic by disjoint `stars:` ranges (each well under the cap) and merge them,
// which lets the store load every repository in the topic. Results are reduced
// to the leaf fields the store UI needs.

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
const MAX_PAGES = 10 // per shard; each shard is kept under the 1000-result cap

// Disjoint star ranges whose union covers every repository. Chosen so the
// long low-star tail (stars 0/1/2 are the largest shards) stays under 1000.
const STAR_RANGES = ['>=10', '5..9', '3..4', '2', '1', '0']

export interface CatalogResult {
  total: number
  entries: PluginEntry[]
  partial: boolean
}

interface ShardResult {
  total: number
  entries: PluginEntry[]
  partial: boolean
}

async function fetchShard(range: string, headers: Record<string, string>): Promise<ShardResult> {
  const q = `${QUERY} stars:${range}`
  const entries: PluginEntry[] = []
  let total = 0
  let partial = false

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${GITHUB_API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${PER_PAGE}&page=${page}`
    const res = await fetch(url, { headers })
    if (res.status === 403 || res.status === 429) {
      partial = true
      break
    }
    if (!res.ok) throw new Error(`GitHub API request failed (HTTP ${res.status})`)

    const data = (await res.json()) as { total_count?: number; items?: unknown[] }
    if (page === 1) total = typeof data.total_count === 'number' ? data.total_count : 0
    const items = Array.isArray(data.items) ? data.items : []
    for (const item of items) entries.push(normalize(item))
    if (items.length < PER_PAGE) break
  }

  return { total, entries, partial }
}

export async function fetchCatalog(token?: string): Promise<CatalogResult> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dsh-plugin-store',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const seen = new Set<string>()
  const entries: PluginEntry[] = []
  let total = 0
  let partial = false

  for (const range of STAR_RANGES) {
    const shard = await fetchShard(range, headers)
    total += shard.total
    if (shard.partial) partial = true
    for (const entry of shard.entries) {
      if (!seen.has(entry.full_name)) {
        seen.add(entry.full_name)
        entries.push(entry)
      }
    }
    if (shard.partial) break // rate limited; further shards would fail too
  }

  return { total, entries, partial }
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
