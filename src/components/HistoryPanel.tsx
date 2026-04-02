import type { HistoryRecord } from '../types'

interface HistoryPanelProps {
  records: HistoryRecord[]
  onRestore: (record: HistoryRecord) => void
  onRemove: (id: string) => void
  onClear: () => void
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function summarizeText(value: string, maxLength = 72) {
  const compactValue = value.replace(/\s+/g, ' ').trim()
  if (compactValue.length <= maxLength) {
    return compactValue
  }

  return `${compactValue.slice(0, maxLength - 1)}…`
}

export function HistoryPanel({ records, onRestore, onRemove, onClear }: HistoryPanelProps) {
  return (
    <section className="pixel-panel p-4">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 px-2 pb-4 dark:border-zinc-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="pixel-title text-[16px] text-slate-900 dark:text-zinc-100">历史记录</h2>
          <p className="mt-1 text-[13px] leading-6 text-slate-500 dark:text-zinc-400">
            自动保存最近的处理结果，可随时恢复继续编辑。
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="pixel-button px-3 py-1.5 text-[12px] font-medium transition"
        >
          清空历史
        </button>
      </div>

      {records.length === 0 ? (
        <div className="pixel-surface flex min-h-32 items-center justify-center border-dashed px-6 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
          暂无历史记录，处理过的结果会自动出现在这里。
        </div>
      ) : (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {records.map((record) => (
            <article key={record.id} className="pixel-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="pixel-chip px-2.5 py-1 font-medium text-slate-500 dark:text-zinc-300">
                      {record.mode.toUpperCase()}
                    </span>
                    <span className="pixel-chip px-2.5 py-1 font-medium text-slate-500 dark:text-zinc-300">
                      {record.outputViewMode === 'raw' ? '压缩' : '格式化'}
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500">{formatTime(record.createdAt)}</span>
                  </div>
                  <div className="text-[13px] leading-6 text-slate-600 dark:text-zinc-300">
                    {summarizeText(record.input)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(record.id)}
                  className="pixel-button px-2.5 py-1 text-[12px] font-medium text-slate-400 transition hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-300"
                >
                  删除
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-[12px] text-slate-400 dark:text-zinc-500">
                  输出长度 {record.output.length} 字
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(record)}
                  className="pixel-button pixel-button-primary px-3 py-1.5 text-[12px] font-medium transition"
                >
                  恢复到工作区
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
