import type { FormatterMode, ModeSource, StatusTone, TextStats } from '../types'

interface StatusBarProps {
  mode: FormatterMode
  modeSource: ModeSource
  inputStats: TextStats
  outputStats: TextStats
  historyCount: number
  isDark: boolean
  linkedScrollEnabled: boolean
  alwaysOnTop: boolean
  alwaysOnTopAvailable: boolean
  statusTone: StatusTone
  statusMessage: string
  errorSummary: string
}

const statusToneClassMap: Record<StatusTone, string> = {
  idle: '',
  info: 'pixel-chip-tone-info',
  success: 'pixel-chip-tone-success',
  error: 'pixel-chip-tone-error',
}

const modeLabelMap: Record<FormatterMode, string> = {
  json: 'JSON',
  xml: 'XML',
}

export function StatusBar({
  mode,
  modeSource,
  inputStats,
  outputStats,
  historyCount,
  isDark,
  linkedScrollEnabled,
  alwaysOnTop,
  alwaysOnTopAvailable,
  statusTone,
  statusMessage,
  errorSummary,
}: StatusBarProps) {
  return (
    <footer className="pixel-strip px-4 py-4 lg:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
          <span className="pixel-chip px-3 py-1.5">
            模式: {modeLabelMap[mode]}
            {modeSource === 'auto' ? ' · 自动识别' : ''}
          </span>
          <span className="pixel-chip px-3 py-1.5">
            输入: {inputStats.characters} 字 / {inputStats.lines} 行
          </span>
          <span className="pixel-chip px-3 py-1.5">
            输出: {outputStats.characters} 字 / {outputStats.lines} 行
          </span>
          <span className="pixel-chip px-3 py-1.5">历史: {historyCount} 条</span>
          <span className="pixel-chip px-3 py-1.5">主题: {isDark ? '深色' : '浅色'}</span>
          <span className="pixel-chip px-3 py-1.5">滚动: {linkedScrollEnabled ? '联动' : '独立'}</span>
          <span
            className={`pixel-chip px-3 py-1.5 ${
              alwaysOnTopAvailable ? (alwaysOnTop ? 'pixel-chip-tone-info' : '') : 'pixel-chip-tone-warn'
            }`}
          >
            窗口: {alwaysOnTopAvailable ? (alwaysOnTop ? '已置顶' : '普通层级') : '置顶不可用'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className={`pixel-chip px-3 py-1.5 font-medium ${statusToneClassMap[statusTone]}`}>
            {statusMessage}
          </span>
          <span className="pixel-chip max-w-[460px] truncate px-3 py-1.5 text-slate-500 dark:text-zinc-400">
            {errorSummary || '当前无错误'}
          </span>
        </div>
      </div>
    </footer>
  )
}
