import type { WorkbenchId } from '../types'
import { workbenchMetaMap } from '../utils/workbenchMeta'
import { CornerHamster } from './CornerHamster'

interface WorkspaceSwitcherProps {
  workspace: WorkbenchId
  onSelect: (workspace: WorkbenchId) => void
}

const workspaceItems: WorkbenchId[] = ['formatter', 'compare', 'cron']

function FormatterIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M4 5.5h12M4 10h9M4 14.5h7" />
      <path d="m14.5 12 2.5 2.5-2.5 2.5" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M4 4.5h5.5v11H4zM10.5 4.5H16v11h-5.5z" />
      <path d="M9.5 10h1" />
    </svg>
  )
}

function CronIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 6.5v4l2.5 1.5M13.5 2.8l1.8 1.8M6.5 2.8 4.7 4.6" />
    </svg>
  )
}

function EnterIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M4 10h10M11 7l3 3-3 3" />
      <path d="M6 5.5H4.5A1.5 1.5 0 0 0 3 7v6a1.5 1.5 0 0 0 1.5 1.5H6" />
    </svg>
  )
}

function getWorkbenchIcon(workspace: WorkbenchId) {
  if (workspace === 'formatter') {
    return <FormatterIcon />
  }
  if (workspace === 'compare') {
    return <CompareIcon />
  }

  return <CronIcon />
}

export function WorkspaceSwitcher({ workspace, onSelect }: WorkspaceSwitcherProps) {
  return (
    <section className="pixel-strip relative min-h-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="flex min-h-full flex-col gap-3 pb-28 sm:pb-32">
        <div className="min-w-0">
          <div className="pixel-stat-label text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-zinc-500">
            Workspace
          </div>
          <div className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-zinc-400">选择一个工作台并直接进入。</div>
        </div>

        <nav aria-label="工作台切换">
          <div className="grid gap-2.5 lg:grid-cols-3">
            {workspaceItems.map((item) => {
              const meta = workbenchMetaMap[item]
              const active = workspace === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-pressed={active}
                  className={`pixel-workbench-card group flex min-h-[138px] flex-col items-start justify-between px-4 py-4 text-left transition-[transform,background-color,box-shadow,color,border-color] duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.99] ${
                    active ? 'pixel-workbench-card-active' : ''
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="pixel-stat-label text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
                      {meta.detail}
                    </div>
                    <span className={`pixel-workbench-icon ${active ? 'pixel-workbench-icon-active' : ''}`}>
                      {getWorkbenchIcon(item)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[20px] font-semibold tracking-[0.06em]">{meta.label}</div>
                    <div className="mt-2 text-[12px] leading-6 opacity-80">
                      {meta.highlights.slice(0, 2).join(' · ')}
                    </div>
                  </div>

                  <div className="mt-4 flex w-full items-center justify-between gap-3 text-[12px]">
                    <span className="opacity-70">{active ? '当前工作台' : '点击直接进入'}</span>
                    <span className="pixel-workbench-enter inline-flex items-center gap-1.5 font-semibold">
                      <span>进入</span>
                      <EnterIcon />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      <CornerHamster />
    </section>
  )
}
