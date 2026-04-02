import { forwardRef } from 'react'
import { MonacoPane, type MonacoPaneHandle } from './MonacoPane'
import type { ErrorLocation, FormatterMode, ScrollSyncState, TextStats } from '../types'

export interface StructuredInputHandle {
  focus: () => void
}

interface StructuredInputProps {
  mode: FormatterMode
  title: string
  value: string
  errorLocation?: ErrorLocation | null
  linkedScrollEnabled?: boolean
  externalScrollState?: ScrollSyncState | null
  isDark?: boolean
  stats: TextStats
  onChange: (value: string) => void
  onScrollSync?: (state: ScrollSyncState) => void
}

export const StructuredInput = forwardRef<StructuredInputHandle, StructuredInputProps>(
  (
    {
      mode,
      title,
      value,
      errorLocation,
      linkedScrollEnabled = false,
      externalScrollState,
      isDark = false,
      stats,
      onChange,
      onScrollSync,
    },
    ref,
  ) => {
    const headerAdornment = errorLocation ? (
      <span className="pixel-chip border-rose-300 bg-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
        第 {errorLocation.line} 行 / 第 {errorLocation.column} 列
      </span>
    ) : null

    return (
      <MonacoPane
        ref={ref as React.Ref<MonacoPaneHandle>}
        title={title}
        ariaLabel={title}
        mode={mode}
        value={value}
        stats={stats}
        isDark={isDark}
        linkedScrollEnabled={linkedScrollEnabled}
        externalScrollState={externalScrollState}
        errorLocation={errorLocation}
        onChange={onChange}
        onScrollSync={onScrollSync}
        scrollSource="input"
        headerAdornment={headerAdornment}
      />
    )
  },
)

StructuredInput.displayName = 'StructuredInput'
