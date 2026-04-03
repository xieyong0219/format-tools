import type { ReactNode } from 'react'
import type { CompareMode } from '../types'
import { ActionButton } from './ActionButton'

interface CompareToolbarProps {
  mode: CompareMode
  ignoreTrimWhitespace: boolean
  sideBySide: boolean
  onModeChange: (mode: CompareMode) => void
  onFormatBoth: () => void
  onSwap: () => void
  onClear: () => void
  onToggleIgnoreWhitespace: () => void
  onToggleSideBySide: () => void
  onImportLeft: () => void
  onImportRight: () => void
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4 5.5h5v9H4zM11 5.5h5v9h-5z" />
      <path d="M9 10h2" />
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4 6h10M11 3l3 3-3 3M16 14H6M9 11l-3 3 3 3" />
    </svg>
  )
}

function LinesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4 5.5h12M4 10h12M4 14.5h12" />
    </svg>
  )
}

function SplitIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M4 4.5h5.5v11H4zM10.5 4.5H16v11h-5.5z" />
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

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  )
}

const modeItems: Array<{ id: CompareMode; label: string }> = [
  { id: 'auto', label: '自动' },
  { id: 'json', label: 'JSON' },
  { id: 'xml', label: 'XML' },
  { id: 'text', label: '文本' },
]

function UtilityButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pixel-button inline-flex h-[44px] w-full min-w-0 items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985]"
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

export function CompareToolbar({
  mode,
  ignoreTrimWhitespace,
  sideBySide,
  onModeChange,
  onFormatBoth,
  onSwap,
  onClear,
  onToggleIgnoreWhitespace,
  onToggleSideBySide,
  onImportLeft,
  onImportRight,
}: CompareToolbarProps) {
  return (
    <section className="pixel-strip px-3 py-3 sm:px-4 sm:py-3.5 lg:px-6">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="pixel-segment-wrap inline-flex w-fit p-1">
            {modeItems.map((item) => {
              const active = mode === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onModeChange(item.id)}
                  className={`pixel-segment-button px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] ${
                    active
                      ? 'pixel-segment-active'
                      : 'text-slate-500 hover:text-slate-900 active:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="hidden min-w-0 lg:flex lg:items-center">
            <span className="text-[12px] tracking-[0.06em] text-slate-500 dark:text-zinc-400">
              快捷键: Ctrl+Enter / Ctrl+Shift+V / Ctrl+L
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 2xl:max-w-[760px] 2xl:items-end">
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2.5">
            <ActionButton label="整理两侧" icon={<CompareIcon />} onClick={onFormatBoth} variant="primary" />
            <ActionButton label="交换左右" icon={<SwapIcon />} onClick={onSwap} />
            <ActionButton
              label="忽略空白"
              icon={<LinesIcon />}
              onClick={onToggleIgnoreWhitespace}
              active={ignoreTrimWhitespace}
            />
            <ActionButton
              label={sideBySide ? '左右视图' : '内联视图'}
              icon={<SplitIcon />}
              onClick={onToggleSideBySide}
              active={!sideBySide}
            />
            <ActionButton label="清空" icon={<ClearIcon />} onClick={onClear} variant="ghost" />
          </div>

          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2.5">
            <UtilityButton label="导入左侧" icon={<FileImportIcon />} onClick={onImportLeft} />
            <UtilityButton label="导入右侧" icon={<FileImportIcon />} onClick={onImportRight} />
          </div>
        </div>
      </div>
    </section>
  )
}
