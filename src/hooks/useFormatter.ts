import { useState } from 'react'
import type {
  ErrorLocation,
  FormatterSnapshot,
  FormatAction,
  FormatterMode,
  ModeSource,
  OutputViewMode,
  StatusTone,
} from '../types'
import { detectFormatterMode } from '../utils/detectFormatterMode'
import { summarizeError, toReadableErrorInfo } from '../utils/errorMessage'
import { compressJson, formatJson } from '../utils/formatJson'
import { compressXml, formatXml } from '../utils/formatXml'
import { getTextStats } from '../utils/textStats'

const SAMPLE_JSON = `{
  "project": "JSON / XML 格式化工具",
  "version": "1.0.0",
  "features": ["format", "compress", "clipboard", "refill"],
  "desktop": true,
  "author": {
    "role": "developer",
    "platform": "Windows"
  }
}`

export function useFormatter() {
  const [mode, setMode] = useState<FormatterMode>('json')
  const [modeSource, setModeSource] = useState<ModeSource>('manual')
  const [input, setInputState] = useState(SAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [outputViewMode, setOutputViewMode] = useState<OutputViewMode>('structured')
  const [statusTone, setStatusTone] = useState<StatusTone>('idle')
  const [statusMessage, setStatusMessage] = useState('就绪')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorLocation, setErrorLocation] = useState<ErrorLocation | null>(null)

  const inputStats = getTextStats(input)
  const outputStats = getTextStats(output)
  const errorSummary = summarizeError(errorMessage)

  function createSnapshot(
    nextMode: FormatterMode = mode,
    nextInput: string = input,
    nextOutput: string = output,
    nextOutputViewMode: OutputViewMode = outputViewMode,
  ): FormatterSnapshot {
    return {
      mode: nextMode,
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
    const detectedMode = detectFormatterMode(value)
    if (detectedMode && detectedMode !== mode) {
      setMode(detectedMode)
      setModeSource('auto')
    }
    if (errorMessage) {
      setErrorMessage('')
      setErrorLocation(null)
    }
  }

  function setOutputValue(value: string) {
    setOutput(value)
  }

  function changeMode(nextMode: FormatterMode) {
    setMode(nextMode)
    setModeSource('manual')
    setStatusTone('info')
    setStatusMessage(`已切换到 ${nextMode.toUpperCase()} 模式`)
    setErrorMessage('')
    setErrorLocation(null)
  }

  function resolveAction(action: FormatAction, value: string, activeMode: FormatterMode) {
    if (activeMode === 'json') {
      return action === 'format' ? formatJson(value) : compressJson(value)
    }

    return action === 'format' ? formatXml(value) : compressXml(value)
  }

  function processContent(action: FormatAction) {
    if (!input.trim()) {
      setStatusTone('error')
      setStatusMessage('请输入需要处理的内容。')
      setErrorMessage('请输入需要处理的内容。')
      setErrorLocation(null)
      setOutput('')
      return null
    }

    try {
      const activeMode = detectFormatterMode(input) ?? mode
      setMode(activeMode)
      setModeSource(activeMode === mode ? modeSource : 'auto')
      const nextOutput = resolveAction(action, input, activeMode)
      const nextOutputViewMode = action === 'compress' ? 'raw' : 'structured'
      setOutput(nextOutput)
      setOutputViewMode(nextOutputViewMode)
      setStatusTone('success')
      setStatusMessage('处理成功')
      setErrorMessage('')
      setErrorLocation(null)
      return createSnapshot(activeMode, input, nextOutput, nextOutputViewMode)
    } catch (error) {
      const activeMode = detectFormatterMode(input) ?? mode
      setMode(activeMode)
      setModeSource(activeMode === mode ? modeSource : 'auto')
      const readableError = toReadableErrorInfo(error, activeMode, input)
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

  function clearAll() {
    setInputState('')
    setOutput('')
    setOutputViewMode('structured')
    setModeSource('manual')
    setStatusTone('info')
    setStatusMessage('已清空输入和输出。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  function applyOutputToInput() {
    if (!output.trim()) {
      setNotice('暂无可回填内容。', 'info')
      return
    }

    setInputState(output)
    setModeSource('auto')
    setStatusTone('success')
    setStatusMessage('已将结果回填到输入区。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  function importInput(value: string) {
    setInputState(value)
    setModeSource('auto')
    setStatusTone('success')
    setStatusMessage('内容已导入输入区。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  function restoreSnapshot(snapshot: FormatterSnapshot) {
    setMode(snapshot.mode)
    setModeSource('manual')
    setInputState(snapshot.input)
    setOutput(snapshot.output)
    setOutputViewMode(snapshot.outputViewMode)
    setStatusTone('success')
    setStatusMessage('已恢复历史记录。')
    setErrorMessage('')
    setErrorLocation(null)
  }

  return {
    mode,
    modeSource,
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
    changeMode,
    formatContent,
    compressContent,
    clearAll,
    applyOutputToInput,
    importInput,
    createSnapshot,
    restoreSnapshot,
    setNotice,
  }
}
