import type { DiffStats, FormatterMode, ModeSource, StatusTone, TextStats, WorkbenchId } from '../types'

interface StatusBarProps {
  workspace: WorkbenchId
  mode: FormatterMode
  modeSource: ModeSource
  inputStats: TextStats
  outputStats: TextStats
  compareLeftStats?: TextStats
  compareRightStats?: TextStats
  diffStats?: DiffStats
  historyCount: number
  isDark: boolean
  linkedScrollEnabled: boolean
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

const workspaceLabelMap: Record<WorkbenchId, string> = {
  formatter: '格式化',
  compare: '代码比对',
  cron: 'Cron 表达式',
}

export function StatusBar({
  workspace,
  mode,
  modeSource,
  inputStats,
  outputStats,
  compareLeftStats,
  compareRightStats,
  diffStats,
  historyCount,
  isDark,
  linkedScrollEnabled,
  statusTone,
  statusMessage,
  errorSummary,
}: StatusBarProps) {
  return (
    <footer className="pixel-strip px-4 py-4 lg:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
          <span className="pixel-chip px-3 py-1.5">工作台: {workspaceLabelMap[workspace]}</span>
          {workspace === 'formatter' ? (
            <>
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
            </>
          ) : null}
          {workspace === 'compare' ? (
            <>
              <span className="pixel-chip px-3 py-1.5">
                左侧: {compareLeftStats?.characters ?? 0} 字 / {compareLeftStats?.lines ?? 0} 行
              </span>
              <span className="pixel-chip px-3 py-1.5">
                右侧: {compareRightStats?.characters ?? 0} 字 / {compareRightStats?.lines ?? 0} 行
              </span>
              <span className="pixel-chip px-3 py-1.5">
                差异: {diffStats?.changes ?? 0} 块 / 新增 {diffStats?.insertions ?? 0} / 删除{' '}
                {diffStats?.deletions ?? 0} / 修改 {diffStats?.modifications ?? 0}
              </span>
            </>
          ) : null}
          {workspace === 'cron' ? (
            <span className="pixel-chip px-3 py-1.5">Cron: 生成、反解析与未来执行时间预览</span>
          ) : null}
          <span className="pixel-chip px-3 py-1.5">历史: {historyCount} 条</span>
          <span className="pixel-chip px-3 py-1.5">主题: {isDark ? '深色' : '浅色'}</span>
          <span className="pixel-chip px-3 py-1.5">滚动: {linkedScrollEnabled ? '联动' : '独立'}</span>
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
