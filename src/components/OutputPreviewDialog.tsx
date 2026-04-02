import { useEffect } from 'react'
import { MonacoPane } from './MonacoPane'
import type { FormatterMode, TextStats } from '../types'

interface OutputPreviewDialogProps {
  open: boolean
  mode: FormatterMode
  value: string
  stats: TextStats
  isDark?: boolean
  onChange: (value: string) => void
  onCopy: () => void
  onExport: () => void
  onClose: () => void
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <rect x="6" y="6" width="10" height="10" rx="2" />
      <path d="M4 12H3.5A1.5 1.5 0 0 1 2 10.5v-7A1.5 1.5 0 0 1 3.5 2h7A1.5 1.5 0 0 1 12 3.5V4" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M6 3.5h5l3 3V16a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 4 16V5A1.5 1.5 0 0 1 5.5 3.5H6Z" />
      <path d="M11 3.5V7h3.5" />
      <path d="m10 14.5 0-5M7.5 12 10 14.5l2.5-2.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  )
}

export function OutputPreviewDialog({
  open,
  mode,
  value,
  stats,
  isDark = false,
  onChange,
  onCopy,
  onExport,
  onClose,
}: OutputPreviewDialogProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const headerActions = (
    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
      <button
        type="button"
        onClick={onCopy}
        className="pixel-button inline-flex h-9 min-w-[96px] flex-1 items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] sm:flex-none"
        aria-label="复制结果"
        title="复制结果"
      >
        <CopyIcon />
        <span>复制结果</span>
      </button>
      <button
        type="button"
        onClick={onExport}
        className="pixel-button inline-flex h-9 min-w-[96px] flex-1 items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] sm:flex-none"
        aria-label="导出结果"
        title="导出结果"
      >
        <ExportIcon />
        <span>导出结果</span>
      </button>
      <button
        type="button"
        onClick={onClose}
        className="pixel-button inline-flex h-9 min-w-[88px] flex-1 items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] sm:flex-none"
        aria-label="关闭输出区专注查看"
        title="关闭输出区专注查看"
      >
        <CloseIcon />
        <span>关闭</span>
      </button>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/38 p-2 backdrop-blur-[2px] [overscroll-behavior:contain] sm:p-4 lg:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="输出区专注查看"
        className="pixel-shell flex h-full w-full max-w-[1500px] flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <MonacoPane
          title="输出区专注查看"
          ariaLabel="输出区专注查看"
          mode={mode}
          value={value}
          stats={stats}
          isDark={isDark}
          onChange={onChange}
          scrollSource="output"
          headerActions={headerActions}
        />
      </div>
    </div>
  )
}
