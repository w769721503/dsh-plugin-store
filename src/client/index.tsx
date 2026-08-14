import { StoreTab } from './StoreTab'
import css from './store.css'

const NS = 'settings.pluginStore'

const zh = {
  tab: '插件商店',
  loading: '正在加载插件商店…',
  error: '暂时无法加载插件商店。',
  retry: '重试',
  search: '搜索名称、简介、标签、作者…',
  sort: '排序',
  category: '分类',
  allCategories: '全部分类',
  allTags: '全部类型',
  indexed: '已收录',
  total: '个插件',
  indexedCount: '已收录',
  viewDetails: '查看详情',
  install: '安装',
  installing: '安装中…',
  installed: '已安装',
  restartHint: '重启后生效',
  installFailed: '安装失败',
  empty: '暂无插件。',
  emptySearch: '没有匹配的插件。',
  refresh: '刷新',
  perPage: '每页',
  prev: '上一页',
  next: '下一页',
}

const en = {
  tab: 'Plugin store',
  loading: 'Loading the plugin store…',
  error: 'The plugin store is temporarily unavailable.',
  retry: 'Retry',
  search: 'Search name, description, tag, author…',
  sort: 'Sort',
  category: 'Category',
  allCategories: 'All categories',
  allTags: 'All types',
  indexed: 'Indexed',
  total: 'plugins',
  indexedCount: 'indexed',
  viewDetails: 'Details',
  install: 'Install',
  installing: 'Installing…',
  installed: 'Installed',
  restartHint: 'restart to apply',
  installFailed: 'Install failed',
  empty: 'No plugins available.',
  emptySearch: 'No matching plugins.',
  refresh: 'Refresh',
  perPage: 'Per page',
  prev: 'Prev',
  next: 'Next',
}

interface Ctx {
  slots: {
    inject(slot: string, cb: () => void): void
    register(options: Record<string, unknown>, component: unknown): unknown
  }
  locale: {
    register(ns: string, dict: Record<string, unknown>): () => void
    bind(ns: string): (key: string) => string
  }
  effect(disposer: () => () => void, label?: string): void
}

export const inject = ['slots', 'locale']

export function apply(ctx: Ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'plugin-store: dictionaries')

  const t = ctx.locale.bind(NS)

  // Inject the tab's stylesheet, and remove it when the plugin stops.
  ctx.effect(() => injectCss(), 'plugin-store: css')

  ctx.slots.inject('settings.plugins.tab', () =>
    ctx.slots.register(
      {
        name: 'settings.plugins.tab',
        id: 'store',
        order: 5,
        label: () => t('tab'),
        locale: NS,
        inject: () => ({}),
      },
      StoreTab,
    ),
  )
}

function injectCss(): () => void {
  if (typeof document === 'undefined') return () => {}
  const id = 'dsh-plugin-store-css'
  if (document.getElementById(id)) return () => {}
  const el = document.createElement('style')
  el.id = id
  el.dataset.plugin = 'dsh-plugin-store'
  el.textContent = css
  document.head.appendChild(el)
  return () => el.remove()
}
