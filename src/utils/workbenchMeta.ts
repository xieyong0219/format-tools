import type { WorkbenchId } from '../types'

export interface WorkbenchMeta {
  label: string
  detail: string
  description: string
  dialogTitle: string
  dialogDescription: string
  highlights: string[]
}

export const workbenchMetaMap: Record<WorkbenchId, WorkbenchMeta> = {
  formatter: {
    label: '格式化',
    detail: 'JSON / XML 处理',
    description: '把原始 JSON / XML 放进独立工作台里，完成格式化、压缩、复制、导出与输出放大查看。',
    dialogTitle: '格式化工作台',
    dialogDescription: '',
    highlights: ['双栏输入与输出', '支持压缩 / 格式化', '导入、导出与输出放大查看'],
  },
  compare: {
    label: '代码比对',
    detail: '双栏差异查看',
    description: '把左右两份内容放进独立对比工作台里，按 JSON、XML 或文本模式查看差异。',
    dialogTitle: '代码比对工作台',
    dialogDescription: '',
    highlights: ['Monaco 差异编辑器', '左右 / 内联视图', '粘贴、导入与差异统计'],
  },
  cron: {
    label: 'Cron 表达式',
    detail: '生成与反解析',
    description: '把 Cron 生成、反解析和未来执行预览放进单独工作台里，避免首页被长表单继续挤压。',
    dialogTitle: 'Cron 表达式工作台',
    dialogDescription: '',
    highlights: ['可视化生成', '表达式反解析', '未来 5 次执行时间预览'],
  },
}
