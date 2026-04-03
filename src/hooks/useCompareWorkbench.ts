import { useMemo, useState } from 'react'
import type { CompareMode, ComparePane, DiffStats, StatusTone } from '../types'
import { detectFormatterMode } from '../utils/detectFormatterMode'
import { summarizeError } from '../utils/errorMessage'
import { formatJson } from '../utils/formatJson'
import { formatXml } from '../utils/formatXml'
import { getTextStats } from '../utils/textStats'

const COMPARE_SAMPLE_LEFT = `{
  "project": "JSON / XML 格式化工具",
  "version": "1.0.0",
  "features": ["format", "compress", "clipboard", "preview"],
  "desktop": true,
  "author": {
    "role": "developer",
    "platform": "Windows"
  }
}`

const COMPARE_SAMPLE_RIGHT = `{
  "project": "JSON / XML 格式化工具",
  "version": "1.1.0",
  "features": ["format", "compress", "clipboard", "preview", "diff"],
  "desktop": true,
  "author": {
    "role": "developer",
    "platform": "Windows"
  },
  "workspace": "compare"
}`

const EMPTY_DIFF_STATS: DiffStats = {
  changes: 0,
  insertions: 0,
  deletions: 0,
  modifications: 0,
}

function getFormattingMode(mode: CompareMode, value: string) {
  if (mode === 'json' || mode === 'xml') {
    return mode
  }

  if (mode === 'text') {
    return null
  }

  return detectFormatterMode(value)
}

function formatValueForCompare(value: string, mode: CompareMode) {
  if (!value.trim()) {
    return value
  }

  const activeMode = getFormattingMode(mode, value)
  if (!activeMode) {
    return value
  }

  return activeMode === 'json' ? formatJson(value) : formatXml(value)
}

export function useCompareWorkbench() {
  const [leftValue, setLeftValue] = useState(COMPARE_SAMPLE_LEFT)
  const [rightValue, setRightValue] = useState(COMPARE_SAMPLE_RIGHT)
  const [leftSourcePath, setLeftSourcePath] = useState<string | null>(null)
  const [rightSourcePath, setRightSourcePath] = useState<string | null>(null)
  const [mode, setMode] = useState<CompareMode>('auto')
  const [activePane, setActivePane] = useState<ComparePane>('right')
  const [ignoreTrimWhitespace, setIgnoreTrimWhitespace] = useState(true)
  const [sideBySide, setSideBySide] = useState(true)
  const [diffStats, setDiffStats] = useState<DiffStats>(EMPTY_DIFF_STATS)
  const [statusTone, setStatusTone] = useState<StatusTone>('idle')
  const [statusMessage, setStatusMessage] = useState('代码比对就绪')
  const [errorSummary, setErrorSummary] = useState('')

  const leftStats = useMemo(() => getTextStats(leftValue), [leftValue])
  const rightStats = useMemo(() => getTextStats(rightValue), [rightValue])

  const resolvedMode = useMemo<CompareMode>(() => {
    if (mode !== 'auto') {
      return mode
    }

    return detectFormatterMode(rightValue) ?? detectFormatterMode(leftValue) ?? 'text'
  }, [leftValue, mode, rightValue])

  function setNotice(message: string, tone: StatusTone) {
    setStatusTone(tone)
    setStatusMessage(message)
    setErrorSummary(tone === 'error' ? summarizeError(message) : '')
  }

  function importPane(target: ComparePane, value: string, sourcePath?: string | null) {
    if (target === 'left') {
      setLeftValue(value)
      setLeftSourcePath(sourcePath ?? null)
    } else {
      setRightValue(value)
      setRightSourcePath(sourcePath ?? null)
    }

    setActivePane(target)
    setNotice(target === 'left' ? '内容已导入左侧对比区。' : '内容已导入右侧对比区。', 'success')
  }

  function swapPanes() {
    setLeftValue(rightValue)
    setRightValue(leftValue)
    setLeftSourcePath(rightSourcePath)
    setRightSourcePath(leftSourcePath)
    setActivePane((current) => (current === 'left' ? 'right' : 'left'))
    setNotice('已交换左右内容。', 'info')
  }

  function clearAll() {
    setLeftValue('')
    setRightValue('')
    setLeftSourcePath(null)
    setRightSourcePath(null)
    setDiffStats(EMPTY_DIFF_STATS)
    setNotice('已清空代码比对内容。', 'info')
  }

  function toggleIgnoreTrimWhitespace() {
    setIgnoreTrimWhitespace((current) => {
      const nextValue = !current
      setNotice(nextValue ? '已忽略行尾与缩进空白差异。' : '已关闭忽略空白差异。', 'info')
      return nextValue
    })
  }

  function toggleSideBySide() {
    setSideBySide((current) => {
      const nextValue = !current
      setNotice(nextValue ? '已切换为左右分栏视图。' : '已切换为内联比对视图。', 'info')
      return nextValue
    })
  }

  function changeMode(nextMode: CompareMode) {
    setMode(nextMode)
    const label = nextMode === 'auto' ? '自动' : nextMode === 'text' ? '文本' : nextMode.toUpperCase()
    setNotice(`代码比对已切换到 ${label} 模式。`, 'info')
  }

  function formatBoth() {
    if (!leftValue.trim() && !rightValue.trim()) {
      setNotice('请先输入需要比对的内容。', 'error')
      return
    }

    try {
      const nextLeft = formatValueForCompare(leftValue, mode)
      const nextRight = formatValueForCompare(rightValue, mode)

      setLeftValue(nextLeft)
      setRightValue(nextRight)

      if (mode === 'text') {
        setNotice('文本模式不执行结构化格式化。', 'info')
        return
      }

      setNotice('已按结构化规则整理左右内容。', 'success')
    } catch {
      setNotice('格式化比对内容失败，请确认左右内容的 JSON / XML 结构。', 'error')
    }
  }

  return {
    leftValue,
    rightValue,
    leftStats,
    rightStats,
    leftSourcePath,
    rightSourcePath,
    mode,
    resolvedMode,
    activePane,
    ignoreTrimWhitespace,
    sideBySide,
    diffStats,
    statusTone,
    statusMessage,
    errorSummary,
    setLeftValue,
    setRightValue,
    setActivePane,
    setDiffStats,
    setNotice,
    importPane,
    swapPanes,
    clearAll,
    changeMode,
    formatBoth,
    toggleIgnoreTrimWhitespace,
    toggleSideBySide,
  }
}
