import { DiffEditor } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CompareMode, ComparePane, DiffStats, TextStats } from '../types'
import { configureMonaco, getEditorFont, getMonacoTheme } from '../utils/monacoEditor'

interface CompareWorkspaceProps {
  leftValue: string
  rightValue: string
  leftStats: TextStats
  rightStats: TextStats
  leftSourcePath: string | null
  rightSourcePath: string | null
  mode: CompareMode
  resolvedMode: CompareMode
  activePane: ComparePane
  diffStats: DiffStats
  ignoreTrimWhitespace: boolean
  sideBySide: boolean
  isDark?: boolean
  onChangeLeft: (value: string) => void
  onChangeRight: (value: string) => void
  onActivePaneChange: (pane: ComparePane) => void
  onDiffStatsChange: (stats: DiffStats) => void
}

configureMonaco()

function summarizeLineChanges(
  lineChanges: readonly MonacoEditor.ILineChange[] | null,
): DiffStats {
  if (!lineChanges?.length) {
    return {
      changes: 0,
      insertions: 0,
      deletions: 0,
      modifications: 0,
    }
  }

  let insertions = 0
  let deletions = 0
  let modifications = 0

  for (const change of lineChanges) {
    const originalLines =
      change.originalStartLineNumber > 0 && change.originalEndLineNumber > 0
        ? change.originalEndLineNumber - change.originalStartLineNumber + 1
        : 0
    const modifiedLines =
      change.modifiedStartLineNumber > 0 && change.modifiedEndLineNumber > 0
        ? change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1
        : 0

    if (originalLines > 0 && modifiedLines > 0) {
      modifications += Math.max(originalLines, modifiedLines)
    } else if (originalLines > 0) {
      deletions += originalLines
    } else if (modifiedLines > 0) {
      insertions += modifiedLines
    }
  }

  return {
    changes: lineChanges.length,
    insertions,
    deletions,
    modifications,
  }
}

function getCompareLanguage(mode: CompareMode) {
  if (mode === 'json' || mode === 'xml') {
    return mode
  }

  return 'plaintext'
}

function InlineSummary({
  label,
  stats,
  sourcePath,
  active,
}: {
  label: string
  stats: TextStats
  sourcePath: string | null
  active: boolean
}) {
  return (
    <div
      className={`pixel-chip flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-[12px] ${
        active ? 'pixel-chip-tone-info' : ''
      }`}
    >
      <div className="min-w-0 flex flex-1 items-center gap-2">
        <span className="shrink-0 font-semibold">{label}</span>
        {sourcePath ? (
          <span
            className="truncate text-[11px] text-slate-500 dark:text-zinc-300"
            title={sourcePath}
          >
            · {sourcePath}
          </span>
        ) : null}
      </div>
      <span className="shrink-0 text-slate-500 dark:text-zinc-300">
        {stats.characters} 字 / {stats.lines} 行
      </span>
    </div>
  )
}

function DiffStatChip({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'neutral' | 'insert' | 'delete' | 'modify'
}) {
  const toneClass =
    tone === 'insert'
      ? 'border-emerald-300/90 bg-emerald-50 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-500/15 dark:text-emerald-300'
      : tone === 'delete'
        ? 'border-rose-300/90 bg-rose-50 text-rose-700 dark:border-rose-500/60 dark:bg-rose-500/15 dark:text-rose-300'
        : tone === 'modify'
          ? 'border-amber-300/90 bg-amber-50 text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/15 dark:text-amber-300'
          : 'text-slate-600 dark:text-zinc-300'

  return <span className={`pixel-chip px-3 py-1.5 ${toneClass}`}>{label} {value}</span>
}

export function CompareWorkspace({
  leftValue,
  rightValue,
  leftStats,
  rightStats,
  leftSourcePath,
  rightSourcePath,
  mode,
  resolvedMode,
  activePane,
  diffStats,
  ignoreTrimWhitespace,
  sideBySide,
  isDark = false,
  onChangeLeft,
  onChangeRight,
  onActivePaneChange,
  onDiffStatsChange,
}: CompareWorkspaceProps) {
  const diffEditorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null)
  const disposablesRef = useRef<Array<{ dispose: () => void }>>([])
  const [initialValues] = useState(() => ({
    left: leftValue,
    right: rightValue,
  }))
  const [isCompactViewport, setIsCompactViewport] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < 1180,
  )
  const [lineHighlightEnabled, setLineHighlightEnabled] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsCompactViewport(window.innerWidth < 1180)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      for (const disposable of disposablesRef.current) {
        disposable.dispose()
      }
      disposablesRef.current = []
    }
  }, [])

  useEffect(() => {
    const editor = diffEditorRef.current
    const model = editor?.getModel()
    if (!editor || !model) {
      return
    }

    if (model.original.getValue() !== leftValue) {
      model.original.setValue(leftValue)
    }

    if (model.modified.getValue() !== rightValue) {
      model.modified.setValue(rightValue)
    }
  }, [leftValue, rightValue])

  const renderSideBySide = sideBySide && !isCompactViewport

  const options = useMemo<MonacoEditor.IDiffEditorConstructionOptions>(
    () => ({
      ariaLabel: '代码比对工作台',
      automaticLayout: true,
      contextmenu: true,
      cursorBlinking: 'solid',
      cursorSmoothCaretAnimation: 'off',
      diffCodeLens: false,
      enableSplitViewResizing: true,
      fontFamily: getEditorFont(),
      fontLigatures: false,
      fontSize: 13,
      glyphMargin: false,
      guides: {
        bracketPairs: false,
        indentation: false,
        highlightActiveIndentation: false,
      },
      ignoreTrimWhitespace,
      lineDecorationsWidth: 10,
      lineHeight: 24,
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      originalEditable: true,
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: lineHighlightEnabled ? 'line' : 'none',
      renderLineHighlightOnlyWhenFocus: true,
      renderIndicators: true,
      renderOverviewRuler: false,
      renderSideBySide,
      roundedSelection: false,
      scrollBeyondLastColumn: 0,
      scrollBeyondLastLine: false,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        horizontal: 'auto',
        horizontalScrollbarSize: 10,
        useShadows: false,
        vertical: 'auto',
        verticalScrollbarSize: 10,
      },
      renderSideBySideInlineBreakpoint: 1080,
      smoothScrolling: false,
      stickyScroll: { enabled: false },
      wordWrap: 'off',
    }),
    [ignoreTrimWhitespace, lineHighlightEnabled, renderSideBySide],
  )

  function bindEditorState(editor: MonacoEditor.IStandaloneDiffEditor) {
    for (const disposable of disposablesRef.current) {
      disposable.dispose()
    }
    disposablesRef.current = []

    const model = editor.getModel()
    if (!model) {
      onDiffStatsChange({
        changes: 0,
        insertions: 0,
        deletions: 0,
        modifications: 0,
      })
      return
    }

    const updateDiffStats = () => {
      onDiffStatsChange(summarizeLineChanges(editor.getLineChanges()))
    }

    disposablesRef.current = [
      model.original.onDidChangeContent(() => {
        onChangeLeft(model.original.getValue())
      }),
      model.modified.onDidChangeContent(() => {
        onChangeRight(model.modified.getValue())
      }),
      model.original.onDidChangeContent(updateDiffStats),
      model.modified.onDidChangeContent(updateDiffStats),
      editor.onDidUpdateDiff(updateDiffStats),
      editor.getOriginalEditor().onDidFocusEditorText(() => {
        setLineHighlightEnabled(true)
        onActivePaneChange('left')
      }),
      editor.getModifiedEditor().onDidFocusEditorText(() => {
        setLineHighlightEnabled(true)
        onActivePaneChange('right')
      }),
      editor.getOriginalEditor().onDidChangeCursorPosition(() => {
        setLineHighlightEnabled(true)
      }),
      editor.getModifiedEditor().onDidChangeCursorPosition(() => {
        setLineHighlightEnabled(true)
      }),
    ]

    updateDiffStats()
  }

  return (
    <section className="pixel-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-zinc-800/80 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="pixel-title text-[16px] text-slate-900 dark:text-zinc-100">代码比对</h2>
              <span className="pixel-chip px-3 py-1.5 text-[12px] font-medium text-slate-500 dark:text-zinc-300">
                当前模式: {mode === 'auto' ? '自动识别' : mode === 'text' ? '文本' : mode.toUpperCase()}
              </span>
              <span className="pixel-chip px-3 py-1.5 text-[12px] font-medium text-slate-500 dark:text-zinc-300">
                解析结果: {resolvedMode === 'text' ? 'TEXT' : resolvedMode.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-[12px]">
            <DiffStatChip label="差异块" value={diffStats.changes} tone="neutral" />
            <DiffStatChip label="新增" value={diffStats.insertions} tone="insert" />
            <DiffStatChip label="删除" value={diffStats.deletions} tone="delete" />
            <DiffStatChip label="修改" value={diffStats.modifications} tone="modify" />
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <InlineSummary
            label="左侧内容"
            stats={leftStats}
            sourcePath={leftSourcePath}
            active={activePane === 'left'}
          />
          <InlineSummary
            label="右侧内容"
            stats={rightStats}
            sourcePath={rightSourcePath}
            active={activePane === 'right'}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 p-2 sm:p-3">
        <div className="pixel-surface monaco-pane monaco-diff-pane h-full min-h-[440px] overflow-hidden">
          <DiffEditor
            height="100%"
            language={getCompareLanguage(resolvedMode)}
            original={initialValues.left}
            modified={initialValues.right}
            theme={getMonacoTheme(isDark)}
            options={options}
            onMount={(editor) => {
              diffEditorRef.current = editor
              bindEditorState(editor)
            }}
          />
        </div>
      </div>
    </section>
  )
}
