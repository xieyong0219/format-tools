export type CronPreset = 'every-minute' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'

export interface CronBuilderState {
  preset: CronPreset
  minuteInterval: number
  hourlyMinute: number
  dailyHour: number
  dailyMinute: number
  weeklyHour: number
  weeklyMinute: number
  weeklyDays: number[]
  monthlyDay: number
  monthlyHour: number
  monthlyMinute: number
  customExpression: string
}

export interface CronValidationResult {
  valid: boolean
  message: string
}

export interface CronReverseResult {
  supported: boolean
  preset: CronPreset
  patch: Partial<CronBuilderState>
  message: string
}

interface ParsedCronField {
  raw: string
  values: number[]
  isWildcard: boolean
  isStep: boolean
}

interface ParsedCronExpression {
  minute: ParsedCronField
  hour: ParsedCronField
  dayOfMonth: ParsedCronField
  month: ParsedCronField
  dayOfWeek: ParsedCronField
}

const MONTH_ALIASES: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
}

const WEEKDAY_ALIASES: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export const cronTemplateItems: Array<{
  id: string
  label: string
  description: string
  patch: Partial<CronBuilderState>
}> = [
  {
    id: 'every-5-minutes',
    label: '每 5 分钟',
    description: '适合轻量轮询',
    patch: { preset: 'every-minute', minuteInterval: 5 },
  },
  {
    id: 'weekday-morning',
    label: '工作日 09:00',
    description: '周一到周五上班前执行',
    patch: { preset: 'weekly', weeklyDays: [1, 2, 3, 4, 5], weeklyHour: 9, weeklyMinute: 0 },
  },
  {
    id: 'daily-midnight',
    label: '每天 00:00',
    description: '适合日级汇总任务',
    patch: { preset: 'daily', dailyHour: 0, dailyMinute: 0 },
  },
  {
    id: 'monthly-first',
    label: '每月 1 日 08:30',
    description: '适合月初结算类任务',
    patch: { preset: 'monthly', monthlyDay: 1, monthlyHour: 8, monthlyMinute: 30 },
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

function range(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index)
}

function normalizeToken(token: string) {
  return token.trim().toUpperCase()
}

function parseAliasValue(token: string, aliases?: Record<string, number>) {
  const normalized = normalizeToken(token)

  if (aliases && normalized in aliases) {
    return aliases[normalized]
  }

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`无法识别字段值 ${token}`)
  }

  return Number(normalized)
}

function normalizeWeekday(value: number) {
  if (value === 7) {
    return 0
  }

  return value
}

function parseField(
  rawField: string,
  min: number,
  max: number,
  aliases?: Record<string, number>,
  normalizeValue?: (value: number) => number,
): ParsedCronField {
  const raw = rawField.trim()
  if (!raw) {
    throw new Error('存在空的 Cron 字段')
  }

  const values = new Set<number>()
  const segments = raw.split(',')
  let isWildcard = false
  let isStep = false

  function addValue(value: number) {
    const normalized = normalizeValue ? normalizeValue(value) : value
    if (normalized < min || normalized > max) {
      throw new Error(`字段值 ${value} 超出范围 ${min}-${max}`)
    }
    values.add(normalized)
  }

  for (const segment of segments) {
    const item = segment.trim()
    if (!item) {
      throw new Error('存在空的 Cron 片段')
    }

    let base = item
    let step = 1

    if (item.includes('/')) {
      const parts = item.split('/')
      if (parts.length !== 2) {
        throw new Error(`无效的步长写法: ${item}`)
      }

      base = parts[0]
      step = Number(parts[1])
      if (!Number.isInteger(step) || step <= 0) {
        throw new Error(`无效的步长数值: ${item}`)
      }
      isStep = true
    }

    if (base === '*') {
      isWildcard = true
      const allValues = range(min, max)
      for (let index = 0; index < allValues.length; index += step) {
        addValue(allValues[index])
      }
      continue
    }

    if (base.includes('-')) {
      const [startToken, endToken] = base.split('-')
      const start = parseAliasValue(startToken, aliases)
      const end = parseAliasValue(endToken, aliases)

      if (start > end) {
        throw new Error(`范围起始值不能大于结束值: ${item}`)
      }

      for (let value = start; value <= end; value += step) {
        addValue(value)
      }
      continue
    }

    const start = parseAliasValue(base, aliases)
    if (item.includes('/')) {
      for (let value = start; value <= max; value += step) {
        addValue(value)
      }
      continue
    }

    addValue(start)
  }

  return {
    raw,
    values: Array.from(values).sort((left, right) => left - right),
    isWildcard: raw === '*' || isWildcard,
    isStep,
  }
}

function parseCronExpression(expression: string): ParsedCronExpression {
  const normalized = expression.trim().replace(/\s+/g, ' ')
  const fields = normalized.split(' ')

  if (fields.length !== 5) {
    throw new Error('当前仅支持标准 5 段 Cron：分 时 日 月 周')
  }

  return {
    minute: parseField(fields[0], 0, 59),
    hour: parseField(fields[1], 0, 23),
    dayOfMonth: parseField(fields[2], 1, 31),
    month: parseField(fields[3], 1, 12, MONTH_ALIASES),
    dayOfWeek: parseField(fields[4], 0, 6, WEEKDAY_ALIASES, normalizeWeekday),
  }
}

function hasSingleValue(field: ParsedCronField) {
  return field.values.length === 1
}

function isAnyField(field: ParsedCronField) {
  return field.raw === '*'
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatWeekdays(days: number[]) {
  return days.map((day) => weekdayLabels[day] ?? `周${day}`).join('、')
}

function describeGenericField(name: string, field: ParsedCronField, formatter?: (value: number) => string) {
  if (field.raw === '*') {
    return `${name}任意`
  }

  if (field.raw.startsWith('*/')) {
    return `${name}每 ${field.raw.slice(2)} 个单位`
  }

  const values = field.values.map((value) => (formatter ? formatter(value) : String(value))).join('、')
  return `${name}${values}`
}

function formatDateTime(date: Date) {
  const locale =
    typeof navigator !== 'undefined' && navigator.languages?.length
      ? navigator.languages
      : ['zh-CN']

  return new Intl.DateTimeFormat(locale, {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function matchesCron(parsed: ParsedCronExpression, date: Date) {
  const minute = date.getMinutes()
  const hour = date.getHours()
  const dayOfMonth = date.getDate()
  const month = date.getMonth() + 1
  const dayOfWeek = date.getDay()

  const minuteMatch = parsed.minute.values.includes(minute)
  const hourMatch = parsed.hour.values.includes(hour)
  const monthMatch = parsed.month.values.includes(month)
  const domMatch = parsed.dayOfMonth.values.includes(dayOfMonth)
  const dowMatch = parsed.dayOfWeek.values.includes(dayOfWeek)

  let dayMatch = false
  if (isAnyField(parsed.dayOfMonth) && isAnyField(parsed.dayOfWeek)) {
    dayMatch = true
  } else if (isAnyField(parsed.dayOfMonth)) {
    dayMatch = dowMatch
  } else if (isAnyField(parsed.dayOfWeek)) {
    dayMatch = domMatch
  } else {
    dayMatch = domMatch || dowMatch
  }

  return minuteMatch && hourMatch && monthMatch && dayMatch
}

export function createDefaultCronBuilderState(): CronBuilderState {
  return {
    preset: 'every-minute',
    minuteInterval: 5,
    hourlyMinute: 0,
    dailyHour: 9,
    dailyMinute: 0,
    weeklyHour: 9,
    weeklyMinute: 0,
    weeklyDays: [1, 2, 3, 4, 5],
    monthlyDay: 1,
    monthlyHour: 9,
    monthlyMinute: 0,
    customExpression: '0 9 * * 1-5',
  }
}

export function buildCronExpression(builder: CronBuilderState) {
  switch (builder.preset) {
    case 'every-minute':
      return builder.minuteInterval <= 1 ? '* * * * *' : `*/${clamp(builder.minuteInterval, 1, 59)} * * * *`
    case 'hourly':
      return `${clamp(builder.hourlyMinute, 0, 59)} * * * *`
    case 'daily':
      return `${clamp(builder.dailyMinute, 0, 59)} ${clamp(builder.dailyHour, 0, 23)} * * *`
    case 'weekly': {
      const weeklyDays = builder.weeklyDays.length
        ? Array.from(new Set(builder.weeklyDays)).sort((left, right) => left - right)
        : [1]
      return `${clamp(builder.weeklyMinute, 0, 59)} ${clamp(builder.weeklyHour, 0, 23)} * * ${weeklyDays.join(',')}`
    }
    case 'monthly':
      return `${clamp(builder.monthlyMinute, 0, 59)} ${clamp(builder.monthlyHour, 0, 23)} ${clamp(builder.monthlyDay, 1, 31)} * *`
    case 'custom':
    default:
      return builder.customExpression.trim()
  }
}

export function validateCronExpression(expression: string): CronValidationResult {
  if (!expression.trim()) {
    return {
      valid: false,
      message: '请输入 Cron 表达式。',
    }
  }

  try {
    parseCronExpression(expression)
    return {
      valid: true,
      message: '表达式合法，可继续生成说明和执行时间。',
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'Cron 表达式校验失败。',
    }
  }
}

export function reverseParseCronExpression(expression: string): CronReverseResult {
  const parsed = parseCronExpression(expression)

  if (
    isAnyField(parsed.hour) &&
    isAnyField(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    isAnyField(parsed.dayOfWeek)
  ) {
    if (parsed.minute.raw === '*' || parsed.minute.raw.startsWith('*/')) {
      const interval = parsed.minute.raw === '*' ? 1 : clamp(Number(parsed.minute.raw.slice(2)), 1, 59)
      return {
        supported: true,
        preset: 'every-minute',
        patch: {
          minuteInterval: interval,
          customExpression: expression.trim(),
        },
        message: '已回填到“每 N 分钟”可视化配置。',
      }
    }

    if (hasSingleValue(parsed.minute)) {
      return {
        supported: true,
        preset: 'hourly',
        patch: {
          hourlyMinute: parsed.minute.values[0],
          customExpression: expression.trim(),
        },
        message: '已回填到“每小时固定分钟”配置。',
      }
    }
  }

  if (
    hasSingleValue(parsed.minute) &&
    hasSingleValue(parsed.hour) &&
    isAnyField(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    isAnyField(parsed.dayOfWeek)
  ) {
    return {
      supported: true,
      preset: 'daily',
      patch: {
        dailyMinute: parsed.minute.values[0],
        dailyHour: parsed.hour.values[0],
        customExpression: expression.trim(),
      },
      message: '已回填到“每天固定时间”配置。',
    }
  }

  if (
    hasSingleValue(parsed.minute) &&
    hasSingleValue(parsed.hour) &&
    isAnyField(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    !isAnyField(parsed.dayOfWeek)
  ) {
    return {
      supported: true,
      preset: 'weekly',
      patch: {
        weeklyMinute: parsed.minute.values[0],
        weeklyHour: parsed.hour.values[0],
        weeklyDays: parsed.dayOfWeek.values,
        customExpression: expression.trim(),
      },
      message: '已回填到“每周固定星期”配置。',
    }
  }

  if (
    hasSingleValue(parsed.minute) &&
    hasSingleValue(parsed.hour) &&
    hasSingleValue(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    isAnyField(parsed.dayOfWeek)
  ) {
    return {
      supported: true,
      preset: 'monthly',
      patch: {
        monthlyMinute: parsed.minute.values[0],
        monthlyHour: parsed.hour.values[0],
        monthlyDay: parsed.dayOfMonth.values[0],
        customExpression: expression.trim(),
      },
      message: '已回填到“每月固定日期”配置。',
    }
  }

  return {
    supported: false,
    preset: 'custom',
    patch: {
      customExpression: expression.trim(),
    },
    message: '表达式有效，但超出当前可视化映射范围，已保留在自定义模式。',
  }
}

export function describeCronExpression(expression: string) {
  const parsed = parseCronExpression(expression)

  if (
    isAnyField(parsed.hour) &&
    isAnyField(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    isAnyField(parsed.dayOfWeek)
  ) {
    if (parsed.minute.raw === '*') {
      return '每分钟执行一次。'
    }

    if (parsed.minute.raw.startsWith('*/')) {
      return `每 ${parsed.minute.raw.slice(2)} 分钟执行一次。`
    }

    if (hasSingleValue(parsed.minute)) {
      return `每小时的第 ${String(parsed.minute.values[0]).padStart(2, '0')} 分执行。`
    }
  }

  if (
    hasSingleValue(parsed.minute) &&
    hasSingleValue(parsed.hour) &&
    isAnyField(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    isAnyField(parsed.dayOfWeek)
  ) {
    return `每天 ${formatTime(parsed.hour.values[0], parsed.minute.values[0])} 执行。`
  }

  if (
    hasSingleValue(parsed.minute) &&
    hasSingleValue(parsed.hour) &&
    isAnyField(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    !isAnyField(parsed.dayOfWeek)
  ) {
    return `每周 ${formatWeekdays(parsed.dayOfWeek.values)} 的 ${formatTime(parsed.hour.values[0], parsed.minute.values[0])} 执行。`
  }

  if (
    hasSingleValue(parsed.minute) &&
    hasSingleValue(parsed.hour) &&
    hasSingleValue(parsed.dayOfMonth) &&
    isAnyField(parsed.month) &&
    isAnyField(parsed.dayOfWeek)
  ) {
    return `每月 ${parsed.dayOfMonth.values[0]} 日 ${formatTime(parsed.hour.values[0], parsed.minute.values[0])} 执行。`
  }

  return [
    describeGenericField('分钟', parsed.minute),
    describeGenericField('小时', parsed.hour),
    describeGenericField('日期', parsed.dayOfMonth),
    describeGenericField('月份', parsed.month, (value) => `${value}月`),
    describeGenericField('星期', parsed.dayOfWeek, (value) => weekdayLabels[value] ?? `周${value}`),
  ].join(' · ')
}

export function previewCronRuns(expression: string, count = 5) {
  const parsed = parseCronExpression(expression)
  const results: string[] = []
  const cursor = new Date()
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  let attempts = 0
  const maxAttempts = 60 * 24 * 366 * 2

  while (results.length < count && attempts < maxAttempts) {
    if (matchesCron(parsed, cursor)) {
      results.push(formatDateTime(cursor))
    }

    cursor.setMinutes(cursor.getMinutes() + 1)
    attempts += 1
  }

  return results
}
