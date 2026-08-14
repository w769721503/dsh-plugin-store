// Derives the store's functional category and type tags from a repository's
// GitHub topics + name + description. The keyword tables are heuristic and
// intentionally easy to tune.

import type { CategoryId, TagId } from './taxonomy'

interface Rule {
  id: TagId | CategoryId
  pattern: RegExp
}

// Ordered by specificity: earlier rules win for the primary tag.
const TAG_RULES: Rule[] = [
  { id: 'vision', pattern: /vision|image|ocr|screenshot|multimodal|ui-restoration|computer-vision|grounding|pixel-diff|\bvideo\b/ },
  { id: 'tui', pattern: /\btui\b|terminal|cli\b|\bink\b|xterm|console|status-line|statusline/ },
  { id: 'desktop', pattern: /desktop|electron|wails|tauri|native-app|desktop-app|macos|windows-app/ },
  { id: 'memory', pattern: /memory|rag|context|knowledge-graph|persistent-memory|\bkb\b|knowledge-base|recall|storage|session-persistence/ },
  { id: 'messages', pattern: /notification|notify|message|chat|history|export|feedback|working-activity|alert|remind/ },
  { id: 'model', pattern: /\bllm\b|model|inference|provider|deepseek|reasoning|openai|anthropic|gemini|fallback|retry|kimi/ },
  { id: 'cost', pattern: /cost|token|usage|billing|budget|\btps\b|balance|meter|statistics|estimate/ },
  { id: 'data', pattern: /\bdata\b|database|sqlite|\bsql\b|\bjson\b|csv|visualization|query|search|fuse|elastic|encoding|hash|zotero/ },
  { id: 'testing', pattern: /test|debug|diagnostic|lint|review|quality|checkup|verify|falsify|adjudicator/ },
  { id: 'security', pattern: /security|privacy|auth|sandbox|permission|encrypt|guard|anti-ads|self-control/ },
  { id: 'agent', pattern: /agent|mcp|automation|workflow|subagent|collaboration|mesh|\ba2a\b|orchestrat/ },
  { id: 'browser', pattern: /browser|remote|chrome|playwright|puppeteer|extension|deeplink|web-bridge|webview/ },
  { id: 'input', pattern: /prompt|input|composer|slash|mention|trigger|template|suggest/ },
  { id: 'research', pattern: /skill|research|paper|study|academic|education|learning|knowledge|document|reading|superpowers/ },
  { id: 'fun', pattern: /game|fun|pet|music|entertainment|meme|whale|mini-game|puzzle|trolling/ },
  { id: 'engineering', pattern: /\bdev\b|code|coding|typescript|sdk|git|tooling|\bapi\b|library|inspect|compiler|artifact/ },
  { id: 'ui-ux', pattern: /skin|theme|sidebar|layout|interface|design|panel|\bcss\b|web-ui|webui|ui-restoration|dnd|drag-and-drop|beautif/ },
]

const CATEGORY_RULES: Rule[] = [
  { id: 'notify', pattern: /notification|notify|message|status|alert|remind|feedback|working-activity/ },
  { id: 'workflow', pattern: /workflow|automation|agent|mcp|orchestrat|mesh|\ba2a\b|subagent|pipeline|schedule|collaboration/ },
  { id: 'knowledge', pattern: /skill|research|paper|study|knowledge|learning|education|academic|document|reading|memory|rag|superpowers/ },
  { id: 'dev', pattern: /\bdev\b|code|typescript|sdk|git|tooling|test|debug|lint|cli|terminal|\btui\b|\bapi\b|database|json|compiler|inspect/ },
  { id: 'ui', pattern: /skin|theme|sidebar|layout|interface|design|panel|web-ui|webui|\bcss\b|ui-restoration|desktop|electron|drag-and-drop/ },
  { id: 'other', pattern: /[\s\S]/ },
]

const CATEGORY_DEFAULT_TAG: Record<CategoryId, TagId> = {
  ui: 'ui-ux',
  notify: 'messages',
  workflow: 'agent',
  dev: 'engineering',
  knowledge: 'research',
  other: 'engineering',
}

export interface Classification {
  category: CategoryId
  tags: TagId[]
  primaryTag: TagId
  indexed: boolean
}

export interface ClassifyInput {
  topics: string[]
  language: string | null
  name: string
  description: string
  fullName: string
}

export function classify(input: ClassifyInput): Classification {
  const haystack = [
    ...(input.topics ?? []),
    input.name ?? '',
    input.description ?? '',
    input.fullName ?? '',
  ]
    .join(' ')
    .toLowerCase()

  const tags: TagId[] = []
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(haystack)) tags.push(rule.id as TagId)
  }

  const category = (CATEGORY_RULES.find((r) => r.pattern.test(haystack))?.id ?? 'other') as CategoryId
  const primaryTag = tags[0] ?? CATEGORY_DEFAULT_TAG[category]

  const topics = (input.topics ?? []).map((t) => t.toLowerCase())
  const indexed =
    topics.includes('dsh') ||
    topics.includes('deepseek-harness') ||
    /^dsh[-_]/.test(input.name ?? '') ||
    /deepseek[- ]harness|dsh[- ]?plugin|dsh[- ]?插件/i.test((input.description ?? '') + ' ' + (input.name ?? ''))

  return { category, tags, primaryTag, indexed }
}
