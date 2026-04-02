import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ErrorLocation, FormatterMode, ScrollSyncState, TextStats } from '../types'
import { configureMonaco, getEditorFont, getMonacoLanguage, getMonacoTheme } from '../utils/monacoEditor'

export interface MonacoPaneHandle {
  focus: () => void
}

interface MonacoPaneProps {
  title: string
  ariaLabel: string
  mode: FormatterMode
  value: string
  stats: TextStats
  isDark?: boolean
  linkedScrollEnabled?: boolean
  externalScrollState?: ScrollSyncState | null
  hideGuttersWhenEmpty?: boolean
  errorLocation?: ErrorLocation | null
  onChange: (value: string) => void
  onScrollSync?: (state: ScrollSyncState) => void
  scrollSource: 'input' | 'output'
  headerAdornment?: ReactNode
  headerActions?: ReactNode
}

configureMonaco()

export const MonacoPane = forwardRef<MonacoPaneHandle, MonacoPaneProps>(
  (
    {
      title,
      ariaLabel,
      mode,
      value,
      stats,
      isDark = false,
      linkedScrollEnabled = false,
      externalScrollState,
      hideGuttersWhenEmpty = false,
      errorLocation = null,
      onChange,
      onScrollSync,
      scrollSource,
      headerAdornment,
      headerActions,
    },
    ref,
  ) => {
    const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null)
    const syncingRef = useRef(false)
    const decorationIdsRef = useRef<string[]>([])
    const linkedScrollEnabledRef = useRef(linkedScrollEnabled)
    const onScrollSyncRef = useRef(onScrollSync)
    const [lineHighlightEnabled, setLineHighlightEnabled] = useState(false)

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
    }))

    useEffect(() => {
      linkedScrollEnabledRef.current = linkedScrollEnabled
    }, [linkedScrollEnabled])

    useEffect(() => {
      onScrollSyncRef.current = onScrollSync
    }, [onScrollSync])

    const shouldHideGutters = hideGuttersWhenEmpty && !value.trim()

    const options = useMemo<MonacoEditor.IStandaloneEditorConstructionOptions>(
      () => ({
        ariaLabel,
        automaticLayout: true,
        contextmenu: true,
        cursorBlinking: 'solid',
        cursorSmoothCaretAnimation: 'off',
        folding: !shouldHideGutters,
        foldingHighlight: true,
        showFoldingControls: 'always',
        fontFamily: getEditorFont(),
        fontLigatures: false,
        fontSize: 13,
        glyphMargin: false,
        guides: {
          bracketPairs: false,
          indentation: false,
          highlightActiveIndentation: false,
        },
        lineDecorationsWidth: 10,
        lineHeight: 24,
        lineNumbers: shouldHideGutters ? 'off' : 'on',
        lineNumbersMinChars: 3,
        minimap: { enabled: false },
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        padding: { top: 12, bottom: 12 },
        renderFinalNewline: 'off',
        renderLineHighlight: lineHighlightEnabled ? 'line' : 'none',
        renderLineHighlightOnlyWhenFocus: true,
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
        selectOnLineNumbers: true,
        smoothScrolling: false,
        stickyScroll: { enabled: false },
        tabSize: 2,
        wordWrap: 'off',
      }),
      [ariaLabel, lineHighlightEnabled, shouldHideGutters],
    )

    const handleMount: OnMount = (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      editor.onDidScrollChange(() => {
        if (!linkedScrollEnabledRef.current || !onScrollSyncRef.current) {
          return
        }

        if (syncingRef.current) {
          syncingRef.current = false
          return
        }

        const top = editor.getScrollTop()
        const left = editor.getScrollLeft()
        const layout = editor.getLayoutInfo()
        const contentHeight = editor.getContentHeight()
        const maxTop = Math.max(contentHeight - layout.height, 1)
        const maxLeft = Math.max(editor.getScrollWidth() - layout.width, 1)

        onScrollSyncRef.current({
          source: scrollSource,
          top,
          left,
          topRatio: top / maxTop,
          leftRatio: left / maxLeft,
        })
      })

      editor.onMouseDown(() => {
        setLineHighlightEnabled(true)
      })

      editor.onKeyDown(() => {
        setLineHighlightEnabled(true)
      })
    }

    useEffect(() => {
      const editor = editorRef.current
      const monaco = monacoRef.current
      if (!editor || !monaco) {
        return
      }

      const nextDecorations: MonacoEditor.IModelDeltaDecoration[] = []

      if (errorLocation && editor.getModel()) {
        const line = Math.max(1, Math.min(errorLocation.line, editor.getModel()!.getLineCount()))
        const column = Math.max(1, errorLocation.column)
        const maxColumn = editor.getModel()!.getLineMaxColumn(line)
        const safeColumn = Math.min(column, maxColumn)

        nextDecorations.push(
          {
            range: new monaco.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              className: 'monaco-error-line',
              linesDecorationsClassName: 'monaco-error-gutter',
            },
          },
          {
            range: new monaco.Range(line, safeColumn, line, Math.min(safeColumn + 1, maxColumn)),
            options: {
              inlineClassName: 'monaco-error-column',
            },
          },
        )

        editor.revealLineInCenterIfOutsideViewport(line)
      }

      decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, nextDecorations)
    }, [errorLocation])

    useEffect(() => {
      const editor = editorRef.current
      if (!editor || !linkedScrollEnabled || !externalScrollState || externalScrollState.source === scrollSource) {
        return
      }

      const layout = editor.getLayoutInfo()
      const maxTop = Math.max(editor.getContentHeight() - layout.height, 0)
      const maxLeft = Math.max(editor.getScrollWidth() - layout.width, 0)

      syncingRef.current = true
      editor.setScrollTop(maxTop * externalScrollState.topRatio)
      editor.setScrollLeft(maxLeft * externalScrollState.leftRatio)
    }, [externalScrollState, linkedScrollEnabled, scrollSource, value])

    return (
      <section className="pixel-panel flex h-full min-h-0 flex-col overflow-hidden">
        <header className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-zinc-800/80 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0 flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="pixel-title text-[16px] text-slate-900 dark:text-zinc-100">{title}</h2>
            <div className="pixel-chip shrink-0 px-3 py-1.5 text-[12px] font-medium text-slate-500 dark:text-zinc-300">
              {stats.characters} 字 / {stats.lines} 行
            </div>
            {headerAdornment}
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            {headerActions}
          </div>
        </header>

        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <div className="pixel-surface monaco-pane h-full min-h-0 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={getMonacoLanguage(mode)}
              language={getMonacoLanguage(mode)}
              theme={getMonacoTheme(isDark)}
              value={value}
              options={options}
              onMount={handleMount}
              onChange={(nextValue) => onChange(nextValue ?? '')}
            />
          </div>
        </div>
      </section>
    )
  },
)

MonacoPane.displayName = 'MonacoPane'
