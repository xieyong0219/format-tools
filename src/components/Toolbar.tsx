import type { ReactNode } from 'react'
import type { FormatterMode } from '../types'
import { ActionButton } from './ActionButton'

interface ToolbarProps {
  mode: FormatterMode
  linkedScrollEnabled: boolean
  historyOpen: boolean
  onModeChange: (mode: FormatterMode) => void
  onFormat: () => void
  onCompress: () => void
  onCopy: () => void
  onClear: () => void
  onImportClipboard: () => void
  onImportFile: () => void
  onExportFile: () => void
  onToggleLinkedScroll: () => void
  onToggleHistory: () => void
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M10 2.5 11.9 8l5.6 1.9-5.6 1.9L10 17.5l-1.9-5.7-5.6-1.9L8.1 8 10 2.5Z" />
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

function FileImportIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M6 3.5h5l3 3V16a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 4 16V5A1.5 1.5 0 0 1 5.5 3.5H6Z" />
      <path d="M11 3.5V7h3.5" />
      <path d="m10 9.5 0 5M7.5 12 10 9.5l2.5 2.5" />
    </svg>
  )
}

function FileExportIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M6 3.5h5l3 3V16a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 4 16V5A1.5 1.5 0 0 1 5.5 3.5H6Z" />
      <path d="M11 3.5V7h3.5" />
      <path d="m10 14.5 0-5M7.5 12 10 14.5l2.5-2.5" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M8 7.5h4M6.5 12.5h7" />
      <path d="M5.5 5.5h1A2.5 2.5 0 0 1 9 8v0A2.5 2.5 0 0 1 6.5 10.5h-1A2.5 2.5 0 0 1 3 8v0a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M13.5 9.5h1A2.5 2.5 0 0 1 17 12v0a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 11 12v0a2.5 2.5 0 0 1 2.5-2.5Z" />
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

export function Toolbar({
  mode,
  linkedScrollEnabled,
  historyOpen,
  onModeChange,
  onFormat,
  onCompress,
  onCopy,
  onClear,
  onImportClipboard,
  onImportFile,
  onExportFile,
  onToggleLinkedScroll,
  onToggleHistory,
}: ToolbarProps) {
  return (
    <section className="pixel-strip px-3 py-3 sm:px-4 sm:py-3.5 lg:px-6">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="pixel-segment-wrap inline-flex w-fit p-1">
            <button
              type="button"
              onClick={() => onModeChange('json')}
              className={`pixel-segment-button px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] ${
                mode === 'json'
                  ? 'pixel-segment-active'
                  : 'text-slate-500 hover:text-slate-900 active:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:bg-zinc-800'
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => onModeChange('xml')}
              className={`pixel-segment-button px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] ${
                mode === 'xml'
                  ? 'pixel-segment-active'
                  : 'text-slate-500 hover:text-slate-900 active:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:bg-zinc-800'
              }`}
            >
              XML
            </button>
          </div>

          <div className="hidden min-w-0 lg:flex lg:items-center">
            <span className="text-[12px] tracking-[0.06em] text-slate-500 dark:text-zinc-400">
              快捷键: Ctrl+Enter / Ctrl+Shift+C / Ctrl+L
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 2xl:max-w-[720px] 2xl:items-end">
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2.5">
            <ActionButton label="格式化" icon={<SparkIcon />} onClick={onFormat} variant="primary" />
            <ActionButton label="压缩" icon={<CompressIcon />} onClick={onCompress} />
            <ActionButton label="复制结果" icon={<CopyIcon />} onClick={onCopy} />
            <ActionButton label="清空" icon={<ClearIcon />} onClick={onClear} variant="ghost" />
          </div>

          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2.5">
            <UtilityButton label="导入文件" icon={<FileImportIcon />} onClick={onImportFile} />
            <UtilityButton label="导出结果" icon={<FileExportIcon />} onClick={onExportFile} />
            <UtilityButton label="导入剪贴板" icon={<PasteIcon />} onClick={onImportClipboard} />
            <UtilityButton
              label="联动滚动"
              icon={<LinkIcon />}
              onClick={onToggleLinkedScroll}
              active={linkedScrollEnabled}
            />
            <UtilityButton
              label="历史记录"
              icon={<HistoryIcon />}
              onClick={onToggleHistory}
              active={historyOpen}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
