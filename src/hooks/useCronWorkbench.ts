import { useDeferredValue, useMemo, useState } from 'react'
import type { StatusTone } from '../types'
import {
  buildCronExpression,
  createDefaultCronBuilderState,
  cronTemplateItems,
  describeCronExpression,
  previewCronRuns,
  reverseParseCronExpression,
  type CronBuilderState,
  type CronPreset,
  validateCronExpression,
} from '../utils/cronExpression'
import { summarizeError } from '../utils/errorMessage'

const DEFAULT_BUILDER = createDefaultCronBuilderState()

export function useCronWorkbench() {
  const [builder, setBuilder] = useState<CronBuilderState>(DEFAULT_BUILDER)
  const [expressionDraft, setExpressionDraft] = useState(() => buildCronExpression(DEFAULT_BUILDER))
  const [statusTone, setStatusTone] = useState<StatusTone>('idle')
  const [statusMessage, setStatusMessage] = useState('Cron 工作台就绪')
  const [errorSummary, setErrorSummary] = useState('')

  const deferredExpression = useDeferredValue(expressionDraft.trim())

  const validation = useMemo(() => validateCronExpression(deferredExpression), [deferredExpression])

  const description = useMemo(() => {
    if (!validation.valid) {
      return '表达式通过校验后，会在这里显示中文说明。'
    }

    try {
      return describeCronExpression(deferredExpression)
    } catch {
      return '当前表达式暂时无法生成中文说明。'
    }
  }, [deferredExpression, validation.valid])

  const nextRuns = useMemo(() => {
    if (!validation.valid) {
      return []
    }

    try {
      return previewCronRuns(deferredExpression, 5)
    } catch {
      return []
    }
  }, [deferredExpression, validation.valid])

  function setNotice(message: string, tone: StatusTone) {
    setStatusTone(tone)
    setStatusMessage(message)
    setErrorSummary(tone === 'error' ? summarizeError(message) : '')
  }

  function syncFromBuilder(nextBuilder: CronBuilderState) {
    const expression = buildCronExpression(nextBuilder)
    setBuilder(nextBuilder)
    setExpressionDraft(expression)
  }

  function changePreset(nextPreset: CronPreset) {
    if (nextPreset === 'custom') {
      const nextBuilder = {
        ...builder,
        preset: 'custom' as const,
        customExpression: expressionDraft.trim() || builder.customExpression,
      }
      setBuilder(nextBuilder)
      setNotice('已切换到自定义 Cron 模式。', 'info')
      return
    }

    const nextBuilder = {
      ...builder,
      preset: nextPreset,
    }

    syncFromBuilder(nextBuilder)
    setNotice('已切换 Cron 周期类型。', 'info')
  }

  function updateBuilder(patch: Partial<CronBuilderState>) {
    const nextBuilder = {
      ...builder,
      ...patch,
    }

    if (nextBuilder.preset === 'custom') {
      setBuilder(nextBuilder)
      return
    }

    syncFromBuilder(nextBuilder)
  }

  function setExpression(value: string) {
    setExpressionDraft(value)
    if (builder.preset === 'custom') {
      setBuilder((current) => ({
        ...current,
        customExpression: value,
      }))
    }
  }

  function parseExpression() {
    const result = validateCronExpression(expressionDraft)
    if (!result.valid) {
      setNotice(result.message, 'error')
      return
    }

    try {
      const reverseResult = reverseParseCronExpression(expressionDraft)
      const nextBuilder = {
        ...builder,
        ...reverseResult.patch,
        preset: reverseResult.preset,
        customExpression: expressionDraft.trim(),
      }
      setBuilder(nextBuilder)
      setNotice(reverseResult.message, reverseResult.supported ? 'success' : 'info')
    } catch {
      setNotice('反解析失败，请确认 Cron 表达式格式。', 'error')
    }
  }

  function clearAll() {
    const nextBuilder = createDefaultCronBuilderState()
    setBuilder(nextBuilder)
    setExpressionDraft(buildCronExpression(nextBuilder))
    setNotice('已清空 Cron 表达式配置。', 'info')
  }

  function applyTemplate(templateId: string) {
    const template = cronTemplateItems.find((item) => item.id === templateId)
    if (!template) {
      return
    }

    const nextBuilder = {
      ...builder,
      ...template.patch,
    }
    syncFromBuilder(nextBuilder)
    setNotice(`已套用模板：${template.label}`, 'success')
  }

  function importExpression(value: string) {
    setExpression(value)
    setNotice('表达式已导入，记得点“反解析”回填到左侧配置。', 'success')
  }

  return {
    builder,
    expressionDraft,
    validation,
    description,
    nextRuns,
    statusTone,
    statusMessage,
    errorSummary,
    templates: cronTemplateItems,
    setExpression,
    setNotice,
    updateBuilder,
    changePreset,
    parseExpression,
    clearAll,
    applyTemplate,
    importExpression,
  }
}
