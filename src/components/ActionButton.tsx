import type { ReactNode } from 'react'

interface ActionButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantClassMap: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary:
    'pixel-button pixel-button-primary active:translate-y-[2px] active:scale-[0.978]',
  secondary:
    'pixel-button active:translate-y-[2px] active:scale-[0.98]',
  ghost:
    'pixel-button pixel-button-ghost active:translate-y-[2px] active:scale-[0.98]',
}

export function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  active = false,
  variant = 'secondary',
}: ActionButtonProps) {
  const activeClassName =
    active && !disabled
      ? 'pixel-button-active'
      : ''

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[48px] w-full min-w-0 select-none items-center justify-center gap-2 px-3 text-[12px] font-medium transition-all duration-150 ease-out will-change-transform sm:h-[50px] sm:min-w-[124px] sm:px-3.5 sm:text-[13px] disabled:cursor-not-allowed disabled:opacity-60 ${variantClassMap[variant]} ${activeClassName}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}
