import { ActionButton } from './ActionButton'

interface CronToolbarProps {
  onCopyExpression: () => void
  onParse: () => void
  onImportClipboard: () => void
  onClear: () => void
}

function ParseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4 5.5h12M4 10h7M4 14.5h12" />
      <path d="m12.5 8 3 2-3 2" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <rect x="6" y="6" width="10" height="10" rx="2" />
      <path d="M4 12H3.5A1.5 1.5 0 0 1 2 10.5v-7A1.5 1.5 0 0 1 3.5 2h7A1.5 1.5 0 0 1 12 3.5V4" />
    </svg>
  )
}

function PasteIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M7 4.5h6M8 2.5h4a1 1 0 0 1 1 1v1H7v-1a1 1 0 0 1 1-1Z" />
      <path d="M5 5.5h10a1.5 1.5 0 0 1 1.5 1.5v8A2.5 2.5 0 0 1 14 17.5H6A2.5 2.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z" />
      <path d="m10 9 0 5M7.5 11.5 10 14l2.5-2.5" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  )
}

export function CronToolbar({ onCopyExpression, onParse, onImportClipboard, onClear }: CronToolbarProps) {
  return (
    <section className="pixel-strip px-3 py-3 sm:px-4 sm:py-3.5 lg:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="pixel-chip px-3 py-1.5 text-[11px] text-slate-600 dark:text-zinc-300">标准 5 段</span>
          <span className="pixel-chip px-3 py-1.5 text-[11px] text-slate-600 dark:text-zinc-300">分 时 日 月 周</span>
        </div>

        <div className="grid w-full gap-2.5 sm:grid-cols-2 xl:max-w-[620px] xl:grid-cols-4">
          <ActionButton label="反解析" icon={<ParseIcon />} onClick={onParse} variant="primary" />
          <ActionButton label="复制表达式" icon={<CopyIcon />} onClick={onCopyExpression} />
          <ActionButton label="导入剪贴板" icon={<PasteIcon />} onClick={onImportClipboard} />
          <ActionButton label="清空" icon={<ClearIcon />} onClick={onClear} variant="ghost" />
        </div>
      </div>
    </section>
  )
}
