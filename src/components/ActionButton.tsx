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
      className={`inline-flex min-w-[108px] select-none items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium transition-all duration-150 ease-out will-change-transform disabled:cursor-not-allowed disabled:opacity-60 ${variantClassMap[variant]} ${activeClassName}`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
