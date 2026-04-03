import { useEffect, type ReactNode } from 'react'

interface WorkbenchDialogProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  )
}

export function WorkbenchDialog({
  open,
  title,
  description,
  onClose,
  children,
}: WorkbenchDialogProps) {
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

  return (
    <div
      className="pixel-dialog-backdrop fixed inset-0 z-[55] flex items-stretch justify-center bg-black/38 p-2 backdrop-blur-[2px] [overscroll-behavior:contain] sm:p-4 lg:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pixel-dialog-shell pixel-shell flex h-full w-full max-w-[1600px] flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-slate-200/80 px-4 py-4 dark:border-zinc-800/80 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="pixel-stat-label text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500">
                Workspace Dialog
              </div>
              <h2 className="mt-2 text-[20px] font-semibold tracking-[0.08em] text-slate-900 dark:text-zinc-100">
                {title}
              </h2>
              {description ? (
                <p className="mt-2 max-w-4xl text-[13px] leading-6 text-slate-600 dark:text-zinc-400">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="pixel-button inline-flex h-10 min-w-[92px] items-center justify-center gap-2 px-3 text-[12px] font-medium transition-[transform,background-color,box-shadow] duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985]"
              aria-label={`关闭${title}`}
              title={`关闭${title}`}
            >
              <CloseIcon />
              <span>关闭</span>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
