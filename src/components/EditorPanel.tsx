import { forwardRef } from 'react'
import type { TextStats } from '../types'

interface EditorPanelProps {
  title: string
  value: string
  placeholder: string
  readOnly?: boolean
  helperText?: string
  stats: TextStats
  onChange?: (value: string) => void
}

export const EditorPanel = forwardRef<HTMLTextAreaElement, EditorPanelProps>(
  ({ title, value, placeholder, readOnly = false, helperText, stats, onChange }, ref) => {
    return (
      <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-white/90 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(248,250,252,0.88))] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-5">
          <div>
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">{title}</h2>
            {helperText ? (
              <p className="mt-1.5 text-[13px] leading-6 text-slate-500">{helperText}</p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[12px] font-medium text-slate-500">
            {stats.characters} 字 / {stats.lines} 行
          </div>
        </header>

        <div className="flex-1 p-4">
          <textarea
            ref={ref}
            value={value}
            readOnly={readOnly}
            spellCheck={false}
            placeholder={placeholder}
            onChange={(event) => onChange?.(event.target.value)}
            className="h-full min-h-[458px] w-full resize-none rounded-[22px] border border-slate-200/90 bg-[#fbfbfd] px-5 py-5 font-['SF_Mono','Cascadia_Code','JetBrains_Mono','Consolas',monospace] text-[14px] leading-7 text-slate-800 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,23,42,0.04)] read-only:bg-[#f6f7fb] read-only:text-slate-500"
          />
        </div>
      </section>
    )
  },
)

EditorPanel.displayName = 'EditorPanel'
