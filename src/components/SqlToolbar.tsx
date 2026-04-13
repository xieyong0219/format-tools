import type { ReactNode } from 'react'
import { ActionButton } from './ActionButton'

interface SqlToolbarProps {
  historyOpen: boolean
  onFormat: () => void
  onCompress: () => void
  onUppercase: () => void
  onLowercase: () => void
  onCopy: () => void
  onClear: () => void
  onToggleHistory: () => void
}

function SqlIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M3.5 5.5h13M6 10h8M7.5 14.5h5" />
      <path d="M14.5 3.5 17 6l-2.5 2.5" />
    </svg>
  )
}

function CompressIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M3 7h14M3 13h14M6 4l-3 3 3 3M14 10l3 3-3 3" />
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

function UppercaseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4.5 15 8 5l3.5 10M5.8 11.5h4.4" />
      <path d="M12.5 7.5h3M14 7.5v7M12.5 14.5h3" />
    </svg>
  )
}

function LowercaseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4.5 12.5a2.5 2.5 0 1 1 5 0V15" />
      <path d="M11.5 7.5h3M11.5 11h3" />
      <path d="M15 5.5v9" />
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

function HistoryIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4.5 10a5.5 5.5 0 1 0 1.5-3.79" />
      <path d="M4 4.5v3h3" />
      <path d="M10 6.5v4l2.5 1.5" />
    </svg>
  )
}

function UtilityButton({
  label,
  icon,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`pixel-button inline-flex h-[48px] w-full min-w-0 select-none items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] sm:h-[50px] sm:min-w-[124px] sm:px-3.5 sm:text-[13px] ${
        active ? 'pixel-button-active' : ''
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

export function SqlToolbar({
  historyOpen,
  onFormat,
  onCompress,
  onUppercase,
  onLowercase,
  onCopy,
  onClear,
  onToggleHistory,
}: SqlToolbarProps) {
  return (
    <section className="pixel-strip px-3 py-3 sm:px-4 sm:py-3.5 lg:px-6">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="pixel-chip inline-flex w-fit items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-slate-600 dark:text-zinc-300">
            <SqlIcon />
            <span>标准 SQL</span>
          </div>

          <div className="hidden min-w-0 lg:flex lg:items-center">
            <span className="text-[12px] tracking-[0.06em] text-slate-500 dark:text-zinc-400">
              快捷键: Ctrl+Enter / Ctrl+Shift+C / Ctrl+L
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 2xl:max-w-[720px] 2xl:items-end">
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2.5">
            <ActionButton label="格式化" icon={<SqlIcon />} onClick={onFormat} variant="primary" />
            <ActionButton label="压缩" icon={<CompressIcon />} onClick={onCompress} />
            <ActionButton label="转大写" icon={<UppercaseIcon />} onClick={onUppercase} />
            <ActionButton label="转小写" icon={<LowercaseIcon />} onClick={onLowercase} />
            <ActionButton label="复制结果" icon={<CopyIcon />} onClick={onCopy} />
            <ActionButton label="清空" icon={<ClearIcon />} onClick={onClear} variant="ghost" />
          </div>

          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2.5">
            <UtilityButton label="历史记录" icon={<HistoryIcon />} onClick={onToggleHistory} active={historyOpen} />
          </div>
        </div>
      </div>
    </section>
  )
}
