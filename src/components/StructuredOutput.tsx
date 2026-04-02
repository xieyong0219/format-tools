import { MonacoPane } from './MonacoPane'
import type { FormatterMode, ScrollSyncState, TextStats } from '../types'

interface StructuredOutputProps {
  mode: FormatterMode
  value: string
  stats: TextStats
  linkedScrollEnabled?: boolean
  externalScrollState?: ScrollSyncState | null
  isDark?: boolean
  onChange: (value: string) => void
  onScrollSync?: (state: ScrollSyncState) => void
  onOpenPreview?: () => void
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M8 3.5H3.5V8M12 16.5h4.5V12M12 3.5h4.5V8M8 16.5H3.5V12" />
      <path d="M3.5 8 8 3.5M12 16.5 16.5 12M12 3.5 16.5 8M3.5 12 8 16.5" />
    </svg>
  )
}

export function StructuredOutput({
  mode,
  value,
  stats,
  linkedScrollEnabled = false,
  externalScrollState,
  isDark = false,
  onChange,
  onScrollSync,
  onOpenPreview,
}: StructuredOutputProps) {
  const headerActions = onOpenPreview ? (
    <button
      type="button"
      onClick={onOpenPreview}
      className="pixel-button inline-flex h-9 min-w-[92px] items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985]"
      aria-label="打开输出区专注查看"
      title="打开输出区专注查看"
    >
      <ExpandIcon />
      <span>放大查看</span>
    </button>
  ) : null

  return (
    <MonacoPane
      title="输出区"
      ariaLabel="输出区"
      mode={mode}
      value={value}
      stats={stats}
      isDark={isDark}
      linkedScrollEnabled={linkedScrollEnabled}
      externalScrollState={externalScrollState}
      hideGuttersWhenEmpty
      onChange={onChange}
      onScrollSync={onScrollSync}
      scrollSource="output"
      headerActions={headerActions}
    />
  )
}
