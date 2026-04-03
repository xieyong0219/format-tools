import { useEffect, useState, type ReactNode } from 'react'
import type { CronBuilderState, CronPreset } from '../utils/cronExpression'

interface CronWorkspaceProps {
  builder: CronBuilderState
  expressionDraft: string
  validation: {
    valid: boolean
    message: string
  }
  description: string
  nextRuns: string[]
  templates: Array<{
    id: string
    label: string
    description: string
  }>
  onPresetChange: (preset: CronPreset) => void
  onBuilderChange: (patch: Partial<CronBuilderState>) => void
  onExpressionChange: (value: string) => void
  onApplyTemplate: (templateId: string) => void
}

const presetItems: Array<{ id: CronPreset; label: string; detail: string }> = [
  { id: 'every-minute', label: '每分钟', detail: '按固定步长循环' },
  { id: 'hourly', label: '每小时', detail: '固定分钟触发' },
  { id: 'daily', label: '每天', detail: '固定时间触发' },
  { id: 'weekly', label: '每周', detail: '按星期几执行' },
  { id: 'monthly', label: '每月', detail: '按日期执行' },
  { id: 'custom', label: '自定义', detail: '直接编辑表达式' },
]

const weekdayItems = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
]

function CompactTag({
  tone = 'default',
  children,
}: {
  tone?: 'default' | 'success' | 'error'
  children: ReactNode
}) {
  const toneClassName =
    tone === 'success'
      ? 'pixel-chip-tone-success'
      : tone === 'error'
        ? 'pixel-chip-tone-error'
        : ''

  return <span className={`pixel-chip px-3 py-1.5 text-[11px] ${toneClassName}`}>{children}</span>
}

function LabeledField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[12px] font-semibold text-slate-700 dark:text-zinc-200">{label}</span>
      {children}
    </label>
  )
}

function PixelNumberInput({
  name,
  value,
  min,
  max,
  onChange,
}: {
  name: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      autoComplete="off"
      className="pixel-input h-11 w-full px-3 text-[13px] text-slate-900 dark:text-zinc-100"
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const numericText = event.target.value.replace(/[^\d]/g, '')
        setDraft(numericText)

        if (!numericText) {
          return
        }

        const nextValue = Math.min(max, Math.max(min, Number(numericText)))
        onChange(nextValue)
      }}
      onBlur={() => {
        if (!draft) {
          const fallbackValue = String(min)
          setDraft(fallbackValue)
          onChange(min)
          return
        }

        const nextValue = Math.min(max, Math.max(min, Number(draft)))
        const normalized = String(nextValue)
        setDraft(normalized)
        onChange(nextValue)
      }}
    />
  )
}

function PixelTextInput({
  name,
  value,
  placeholder,
  onChange,
}: {
  name: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <input
      name={name}
      type="text"
      autoComplete="off"
      spellCheck={false}
      value={value}
      placeholder={placeholder}
      className="pixel-input h-11 w-full px-3 text-[13px] text-slate-900 dark:text-zinc-100"
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function TimePairFields({
  prefix,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  prefix: string
  hour: number
  minute: number
  onHourChange: (value: number) => void
  onMinuteChange: (value: number) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <LabeledField label="小时">
        <PixelNumberInput name={`${prefix}-hour`} value={hour} min={0} max={23} onChange={onHourChange} />
      </LabeledField>
      <LabeledField label="分钟">
        <PixelNumberInput
          name={`${prefix}-minute`}
          value={minute}
          min={0}
          max={59}
          onChange={onMinuteChange}
        />
      </LabeledField>
    </div>
  )
}

export function CronWorkspace({
  builder,
  expressionDraft,
  validation,
  description,
  nextRuns,
  templates,
  onPresetChange,
  onBuilderChange,
  onExpressionChange,
  onApplyTemplate,
}: CronWorkspaceProps) {
  const activePreset = presetItems.find((item) => item.id === builder.preset)

  return (
    <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <div className="pixel-panel flex min-h-0 flex-col overflow-hidden">
        <header className="border-b border-slate-200/80 px-4 py-3 dark:border-zinc-800/80 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="pixel-title text-[16px] text-slate-900 dark:text-zinc-100">可视化生成器</h2>
            <CompactTag>{activePreset?.label ?? '当前周期'}</CompactTag>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {presetItems.map((item) => {
                const active = builder.preset === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPresetChange(item.id)}
                    className={`pixel-button flex min-h-[58px] flex-col items-start justify-center gap-0.5 px-3 py-3 text-left transition-[transform,background-color,box-shadow] duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] ${
                      active ? 'pixel-button-active' : ''
                    }`}
                  >
                    <span className="text-[13px] font-semibold">{item.label}</span>
                    <span className="text-[11px] opacity-70">{item.detail}</span>
                  </button>
                )
              })}
            </div>

            <div className="pixel-surface flex min-h-[200px] flex-col gap-4 p-4">
              {builder.preset === 'every-minute' ? (
                <div>
                  <LabeledField label="步长（分钟）">
                    <PixelNumberInput
                      name="minute-interval"
                      value={builder.minuteInterval}
                      min={1}
                      max={59}
                      onChange={(value) => onBuilderChange({ minuteInterval: value })}
                    />
                  </LabeledField>
                </div>
              ) : null}

              {builder.preset === 'hourly' ? (
                <div>
                  <LabeledField label="固定分钟">
                    <PixelNumberInput
                      name="hourly-minute"
                      value={builder.hourlyMinute}
                      min={0}
                      max={59}
                      onChange={(value) => onBuilderChange({ hourlyMinute: value })}
                    />
                  </LabeledField>
                </div>
              ) : null}

              {builder.preset === 'daily' ? (
                <TimePairFields
                  prefix="daily"
                  hour={builder.dailyHour}
                  minute={builder.dailyMinute}
                  onHourChange={(value) => onBuilderChange({ dailyHour: value })}
                  onMinuteChange={(value) => onBuilderChange({ dailyMinute: value })}
                />
              ) : null}

              {builder.preset === 'weekly' ? (
                <>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-700 dark:text-zinc-200">星期</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                      {weekdayItems.map((day) => {
                        const active = builder.weeklyDays.includes(day.value)

                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const nextDays = active
                                ? builder.weeklyDays.filter((item) => item !== day.value)
                                : [...builder.weeklyDays, day.value]
                              onBuilderChange({ weeklyDays: nextDays })
                            }}
                            className={`pixel-button h-10 px-3 text-[12px] font-medium transition-[transform,background-color,box-shadow] duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985] ${
                              active ? 'pixel-button-active' : ''
                            }`}
                          >
                            {day.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <TimePairFields
                    prefix="weekly"
                    hour={builder.weeklyHour}
                    minute={builder.weeklyMinute}
                    onHourChange={(value) => onBuilderChange({ weeklyHour: value })}
                    onMinuteChange={(value) => onBuilderChange({ weeklyMinute: value })}
                  />
                </>
              ) : null}

              {builder.preset === 'monthly' ? (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
                  <LabeledField label="日期">
                    <PixelNumberInput
                      name="monthly-day"
                      value={builder.monthlyDay}
                      min={1}
                      max={31}
                      onChange={(value) => onBuilderChange({ monthlyDay: value })}
                    />
                  </LabeledField>

                  <TimePairFields
                    prefix="monthly"
                    hour={builder.monthlyHour}
                    minute={builder.monthlyMinute}
                    onHourChange={(value) => onBuilderChange({ monthlyHour: value })}
                    onMinuteChange={(value) => onBuilderChange({ monthlyMinute: value })}
                  />
                </div>
              ) : null}

              {builder.preset === 'custom' ? (
                <div>
                  <LabeledField label="自定义模式">
                    <PixelTextInput
                      name="custom-expression"
                      value={expressionDraft}
                      placeholder="输入 5 段表达式，例如：0 9 * * 1-5…"
                      onChange={onExpressionChange}
                    />
                  </LabeledField>
                </div>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onApplyTemplate(template.id)}
                    className="pixel-button inline-flex min-h-[42px] min-w-0 items-center justify-center px-3 text-[12px] font-medium transition-[transform,background-color,box-shadow] duration-150 ease-out will-change-transform active:translate-y-[1px] active:scale-[0.985]"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pixel-panel flex min-h-0 flex-col overflow-hidden">
        <header className="border-b border-slate-200/80 px-4 py-3 dark:border-zinc-800/80 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="pixel-title text-[16px] text-slate-900 dark:text-zinc-100">结果预览</h2>
            <CompactTag tone={validation.valid ? 'success' : 'error'}>
              {validation.valid ? '表达式有效' : '待修正'}
            </CompactTag>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="grid gap-3 xl:grid-rows-[auto,auto,minmax(0,1fr)]">
            <div className="pixel-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12px] font-semibold text-slate-700 dark:text-zinc-200">Cron 表达式</div>
                <div aria-live="polite" className="text-[12px] text-slate-500 dark:text-zinc-400">
                  {validation.message}
                </div>
              </div>
              <div className="mt-3">
                <PixelTextInput
                  name="cron-expression"
                  value={expressionDraft}
                  placeholder="输入 5 段表达式，例如：0 9 * * 1-5…"
                  onChange={onExpressionChange}
                />
              </div>
            </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(220px,0.85fr)] xl:grid-cols-1">
                <div className="pixel-surface p-4">
                  <div className="pixel-stat-label text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500">
                    说明
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-slate-700 dark:text-zinc-200">{description}</p>
                </div>

                <div className="pixel-surface flex min-h-[184px] flex-col p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="pixel-stat-label text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500">
                      未来执行
                    </div>
                    <CompactTag>{nextRuns.length} 条</CompactTag>
                  </div>

                  <div className="mt-4 flex-1 overflow-auto">
                    {nextRuns.length ? (
                      <ul className="space-y-2">
                        {nextRuns.map((run) => (
                          <li key={run} className="pixel-chip flex items-center justify-between gap-3 px-3 py-2 text-[12px]">
                            <span className="font-semibold text-slate-700 dark:text-zinc-200">{run}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="pixel-chip px-3 py-2 text-[12px] text-slate-500 dark:text-zinc-400">
                        表达式通过校验后会显示执行时间。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  )
}
