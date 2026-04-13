import { useState } from 'react'
import type { ErrorLocation, FormatterSnapshot, OutputViewMode, StatusTone } from '../types'
import { summarizeError, toReadableErrorInfo } from '../utils/errorMessage'
import { compressSql, formatSql } from '../utils/formatSql'
import { getTextStats } from '../utils/textStats'

const SAMPLE_SQL = `SELECT id, name, created_at
FROM users
WHERE status = 'active' AND deleted_at IS NULL
ORDER BY created_at DESC;`

export function useSqlWorkbench() {
  const [input, setInputState] = useState(SAMPLE_SQL)
  const [output, setOutput] = useState('')
  const [outputViewMode, setOutputViewMode] = useState<OutputViewMode>('structured')
  const [statusTone, setStatusTone] = useState<StatusTone>('idle')
  const [statusMessage, setStatusMessage] = useState('SQL 工作台就绪')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorLocation, setErrorLocation] = useState<ErrorLocation | null>(null)

  const inputStats = getTextStats(input)
  const outputStats = getTextStats(output)
  const errorSummary = summarizeError(errorMessage)

  function createSnapshot(
    nextInput: string = input,
    nextOutput: string = output,
    nextOutputViewMode: OutputViewMode = outputViewMode,
  ): FormatterSnapshot {
    return {
      mode: 'sql',
      input: nextInput,
      output: nextOutput,
      outputViewMode: nextOutputViewMode,
    }
  }

  function setNotice(message: string, tone: StatusTone) {
    setStatusTone(tone)
    setStatusMessage(message)
    if (tone !== 'error') {
      setErrorMessage('')
      setErrorLocation(null)
    }
  }

  function setInput(value: string) {
    setInputState(value)
    if (errorMessage) {
      setErrorMessage('')
      setErrorLocation(null)
    }
  }

  function setOutputValue(value: string) {
    setOutput(value)
  }

  function processContent(action: 'format' | 'compress' | 'uppercase' | 'lowercase') {
    const transformationSource = output.trim() ? output : input

    if (!transformationSource.trim()) {
      setStatusTone('error')
      setStatusMessage('请输入需要处理的 SQL。')
      setErrorMessage('请输入需要处理的 SQL。')
      setErrorLocation(null)
      setOutput('')
      return null
    }

    try {
      const nextOutput =
        action === 'format'
          ? formatSql(transformationSource)
          : action === 'compress'
            ? compressSql(transformationSource)
            : action === 'uppercase'
              ? transformationSource.toUpperCase()
              : transformationSource.toLowerCase()
      const nextOutputViewMode: OutputViewMode =
        action === 'compress'
          ? 'raw'
          : action === 'uppercase'
            ? 'uppercase'
            : action === 'lowercase'
              ? 'lowercase'
              : 'structured'

      setOutput(nextOutput)
      setOutputViewMode(nextOutputViewMode)
      setStatusTone('success')
      setStatusMessage(
        action === 'format'
          ? 'SQL 格式化成功'
          : action === 'compress'
            ? 'SQL 已压缩为单行'
            : action === 'uppercase'
              ? 'SQL 已转换为大写'
              : 'SQL 已转换为小写',
      )
      setErrorMessage('')
      setErrorLocation(null)
      return createSnapshot(input, nextOutput, nextOutputViewMode)
    } catch (error) {
      const readableError = toReadableErrorInfo(error, 'sql', transformationSource)
      setOutput('')
      setOutputViewMode('structured')
      setStatusTone('error')
      setStatusMessage(readableError.message)
      setErrorMessage(readableError.message)
      setErrorLocation(readableError.location ?? null)
      return null
    }
  }

  function formatContent() {
    return processContent('format')
  }

  function compressContent() {
    return processContent('compress')
  }

  function uppercaseContent() {
    return processContent('uppercase')
  }

  function lowercaseContent() {
    return processContent('lowercase')
  }

  function clearAll() {
    setInputState('')
    setOutput('')
    setOutputViewMode('structured')
    setStatusTone('info')
    setStatusMessage('已清空 SQL 输入和输出。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  function importInput(value: string) {
    setInputState(value)
    setStatusTone('success')
    setStatusMessage('SQL 已导入输入区。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  function restoreSnapshot(snapshot: FormatterSnapshot) {
    setInputState(snapshot.input)
    setOutput(snapshot.output)
    setOutputViewMode(snapshot.outputViewMode)
    setStatusTone('success')
    setStatusMessage('已恢复 SQL 历史记录。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  return {
    mode: 'sql' as const,
    input,
    output,
    outputViewMode,
    inputStats,
    outputStats,
    statusTone,
    statusMessage,
    errorMessage,
    errorLocation,
    errorSummary,
    setInput,
    setOutput: setOutputValue,
    formatContent,
    compressContent,
    uppercaseContent,
    lowercaseContent,
    clearAll,
    importInput,
    createSnapshot,
    restoreSnapshot,
    setNotice,
  }
}
