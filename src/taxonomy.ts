// Shared taxonomy for the plugin store. Consumed by the Host half for
// classifying entries and by the Client half for rendering filter labels.

export type CategoryId =
  | 'ui'
  | 'notify'
  | 'workflow'
  | 'dev'
  | 'knowledge'
  | 'other'

export type TagId =
  | 'ui-ux'
  | 'desktop'
  | 'tui'
  | 'input'
  | 'browser'
  | 'memory'
  | 'messages'
  | 'vision'
  | 'model'
  | 'cost'
  | 'data'
  | 'testing'
  | 'security'
  | 'agent'
  | 'engineering'
  | 'research'
  | 'fun'

export interface LabeledDef {
  id: string
  zh: string
  en: string
}

export const CATEGORIES: LabeledDef[] = [
  { id: 'ui', zh: '界面增强', en: 'UI enhancement' },
  { id: 'notify', zh: '通知', en: 'Notifications' },
  { id: 'workflow', zh: '工作流自动化', en: 'Workflow automation' },
  { id: 'dev', zh: '开发辅助', en: 'Developer tools' },
  { id: 'knowledge', zh: '知识学习', en: 'Knowledge & learning' },
  { id: 'other', zh: '其他工具', en: 'Other tools' },
]

export const TAGS: LabeledDef[] = [
  { id: 'ui-ux', zh: '界面与体验', en: 'UI & experience' },
  { id: 'desktop', zh: '桌面客户端', en: 'Desktop client' },
  { id: 'tui', zh: '终端与TUI', en: 'Terminal & TUI' },
  { id: 'input', zh: '输入与提示词', en: 'Input & prompts' },
  { id: 'browser', zh: '浏览器与远程', en: 'Browser & remote' },
  { id: 'memory', zh: '记忆与上下文', en: 'Memory & context' },
  { id: 'messages', zh: '消息与通知', en: 'Messages & notifications' },
  { id: 'vision', zh: '视觉与图像', en: 'Vision & image' },
  { id: 'model', zh: '模型与推理', en: 'Model & inference' },
  { id: 'cost', zh: '成本与用量', en: 'Cost & usage' },
  { id: 'data', zh: '数据与可视化', en: 'Data & visualization' },
  { id: 'testing', zh: '测试与诊断', en: 'Testing & diagnostics' },
  { id: 'security', zh: '安全与隐私', en: 'Security & privacy' },
  { id: 'agent', zh: 'Agent与自动化', en: 'Agent & automation' },
  { id: 'engineering', zh: '开发与工程', en: 'Engineering' },
  { id: 'research', zh: '研究与知识', en: 'Research & knowledge' },
  { id: 'fun', zh: '趣味与娱乐', en: 'Fun & entertainment' },
]

export type SortId = 'stars' | 'recent' | 'updated' | 'name'

export const SORTS: LabeledDef[] = [
  { id: 'stars', zh: 'GitHub Stars', en: 'GitHub Stars' },
  { id: 'recent', zh: '最近添加', en: 'Recently added' },
  { id: 'updated', zh: '最近更新', en: 'Recently updated' },
  { id: 'name', zh: '名称', en: 'Name' },
]
