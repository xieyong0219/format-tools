import { basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { xml } from '@codemirror/lang-xml'
import { Compartment, EditorState, RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView, type ViewUpdate } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import type { ErrorLocation, FormatterMode, ScrollSyncState, TextStats } from '../types'

export interface StructuredInputHandle {
  focus: () => void
}

interface StructuredInputProps {
  mode: FormatterMode
  title: string
  value: string
  placeholder: string
  helperText?: string
  errorLocation?: ErrorLocation | null
  linkedScrollEnabled?: boolean
  externalScrollState?: ScrollSyncState | null
  isDark?: boolean
  stats: TextStats
  onChange: (value: string) => void
  onScrollSync?: (state: ScrollSyncState) => void
}

const editorFont =
  "'Cascadia Mono','JetBrains Mono','Consolas','Microsoft YaHei UI',monospace"

function createLanguageExtension(mode: FormatterMode) {
  return mode === 'json' ? json() : xml()
}

function createBaseTheme() {
  return EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: 'transparent',
      fontSize: '13px',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: editorFont,
      lineHeight: '1.6rem',
    },
    '.cm-content': {
      padding: '16px 0',
      caretColor: '#0f172a',
      fontFamily: editorFont,
      fontKerning: 'none',
      fontVariantLigatures: 'none',
    },
    '.cm-line': {
      padding: '0 16px',
    },
    '.cm-gutters': {
      display: 'none',
    },
    '.cm-focused': {
      outline: 'none',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
    },
    '.cm-placeholder': {
      color: '#94a3b8',
    },
    '.cm-errorLine': {
      backgroundColor: 'rgba(244, 63, 94, 0.08)',
      boxShadow: 'inset 4px 0 0 rgba(244, 63, 94, 0.32)',
    },
    '.cm-errorColumn': {
      borderBottom: '2px solid rgba(244, 63, 94, 0.7)',
    },
  })
}

function createSyntaxTheme() {
  return syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.propertyName, color: '#9333ea' },
      { tag: tags.attributeName, color: '#9333ea' },
      { tag: [tags.string, tags.attributeValue], color: '#2fb357' },
      { tag: tags.number, color: '#f97316' },
      { tag: [tags.bool, tags.atom], color: '#ef4444' },
      { tag: tags.null, color: '#94a3b8' },
      { tag: [tags.tagName, tags.typeName], color: '#1d4ed8' },
      { tag: [tags.angleBracket, tags.bracket, tags.separator], color: '#94a3b8' },
      { tag: [tags.punctuation, tags.definitionOperator], color: '#94a3b8' },
      { tag: [tags.comment, tags.processingInstruction], color: '#94a3b8' },
      { tag: tags.content, color: '#2fb357' },
    ]),
  )
}

function createDarkTheme() {
  return EditorView.theme(
    {
      '&': {
        backgroundColor: 'transparent',
        color: '#f4f4f5',
      },
      '.cm-scroller': {
        color: '#e4e4e7',
      },
      '.cm-content': {
        caretColor: '#fafafa',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#fafafa',
      },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(101, 212, 110, 0.18)',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(101, 212, 110, 0.08)',
      },
      '.cm-placeholder': {
        color: '#71717a',
      },
      '.cm-errorLine': {
        backgroundColor: 'rgba(127, 29, 29, 0.24)',
        boxShadow: 'inset 4px 0 0 rgba(251, 113, 133, 0.42)',
      },
      '.cm-errorColumn': {
        borderBottom: '2px solid rgba(251, 113, 133, 0.82)',
      },
    },
    { dark: true },
  )
}

function createErrorExtension(errorLocation?: ErrorLocation | null) {
  if (!errorLocation) {
    return []
  }

  return EditorView.decorations.compute([], (state) => {
    const builder = new RangeSetBuilder<Decoration>()
    const safeLine = Math.min(Math.max(errorLocation.line, 1), state.doc.lines)
    const lineInfo = state.doc.line(safeLine)
    const safeColumn = Math.max(1, errorLocation.column)
    const targetFrom = Math.min(lineInfo.from + safeColumn - 1, lineInfo.to)
    const targetTo = Math.min(targetFrom + 1, lineInfo.to)

    builder.add(
      lineInfo.from,
      lineInfo.from,
      Decoration.line({ attributes: { class: 'cm-errorLine' } }),
    )

    if (targetTo > targetFrom) {
      builder.add(
        targetFrom,
        targetTo,
        Decoration.mark({ attributes: { class: 'cm-errorColumn' } }),
      )
    }

    return builder.finish()
  })
}

export const StructuredInput = forwardRef<StructuredInputHandle, StructuredInputProps>(
  (
    {
      mode,
      title,
      value,
      placeholder,
      helperText,
      errorLocation,
      linkedScrollEnabled = false,
      externalScrollState,
      isDark = false,
      stats,
      onChange,
      onScrollSync,
    },
    ref,
  ) => {
    const editorHostRef = useRef<HTMLDivElement>(null)
    const editorViewRef = useRef<EditorView | null>(null)
    const syncingRef = useRef(false)
    const initialModeRef = useRef(mode)
    const initialIsDarkRef = useRef(isDark)
    const initialErrorLocationRef = useRef(errorLocation)
    const initialPlaceholderRef = useRef(placeholder)
    const initialTitleRef = useRef(title)
    const initialValueRef = useRef(value)
    const latestValueRef = useRef(value)
    const linkedScrollEnabledRef = useRef(linkedScrollEnabled)
    const onChangeRef = useRef(onChange)
    const onScrollSyncRef = useRef(onScrollSync)
    const languageCompartment = useRef(new Compartment())
    const themeCompartment = useRef(new Compartment())
    const errorCompartment = useRef(new Compartment())

    const headerHelpText = useMemo(() => {
      if (!helperText) {
        return ''
      }

      return errorLocation?.excerpt ? `${helperText} 当前错误行：${errorLocation.excerpt}` : helperText
    }, [errorLocation?.excerpt, helperText])

    useImperativeHandle(ref, () => ({
      focus: () => editorViewRef.current?.focus(),
    }))

    useEffect(() => {
      latestValueRef.current = value
    }, [value])

    useEffect(() => {
      linkedScrollEnabledRef.current = linkedScrollEnabled
    }, [linkedScrollEnabled])

    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
      onScrollSyncRef.current = onScrollSync
    }, [onScrollSync])

    useEffect(() => {
      if (!editorHostRef.current) {
        return
      }

      const baseTheme = createBaseTheme()
      const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
        if (!update.docChanged) {
          return
        }

        const nextValue = update.state.doc.toString()
        if (nextValue !== latestValueRef.current) {
          onChangeRef.current(nextValue)
        }
      })

      const startState = EditorState.create({
        doc: initialValueRef.current,
        extensions: [
          basicSetup,
          baseTheme,
          createSyntaxTheme(),
          languageCompartment.current.of(createLanguageExtension(initialModeRef.current)),
          themeCompartment.current.of(initialIsDarkRef.current ? createDarkTheme() : []),
          errorCompartment.current.of(createErrorExtension(initialErrorLocationRef.current)),
          updateListener,
          EditorView.contentAttributes.of({
            'data-placeholder': initialPlaceholderRef.current,
            'aria-label': initialTitleRef.current,
          }),
        ],
      })

      const view = new EditorView({
        state: startState,
        parent: editorHostRef.current,
      })

      editorViewRef.current = view

      function handleScroll() {
        if (!linkedScrollEnabledRef.current || !onScrollSyncRef.current) {
          return
        }

        if (syncingRef.current) {
          syncingRef.current = false
          return
        }

        const maxTop = Math.max(view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight, 1)
        const maxLeft = Math.max(view.scrollDOM.scrollWidth - view.scrollDOM.clientWidth, 1)

        onScrollSyncRef.current({
          source: 'input',
          top: view.scrollDOM.scrollTop,
          left: view.scrollDOM.scrollLeft,
          topRatio: view.scrollDOM.scrollTop / maxTop,
          leftRatio: view.scrollDOM.scrollLeft / maxLeft,
        })
      }

      view.scrollDOM.addEventListener('scroll', handleScroll)

      return () => {
        view.scrollDOM.removeEventListener('scroll', handleScroll)
        view.destroy()
        editorViewRef.current = null
      }
    }, [])

    useEffect(() => {
      const view = editorViewRef.current
      if (!view) {
        return
      }

      const currentValue = view.state.doc.toString()
      if (currentValue === value) {
        return
      }

      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      })
    }, [value])

    useEffect(() => {
      const view = editorViewRef.current
      if (!view) {
        return
      }

      view.dispatch({
        effects: languageCompartment.current.reconfigure(createLanguageExtension(mode)),
      })
    }, [mode])

    useEffect(() => {
      const view = editorViewRef.current
      if (!view) {
        return
      }

      view.dispatch({
        effects: themeCompartment.current.reconfigure(isDark ? createDarkTheme() : []),
      })
    }, [isDark])

    useEffect(() => {
      const view = editorViewRef.current
      if (!view) {
        return
      }

      view.dispatch({
        effects: errorCompartment.current.reconfigure(createErrorExtension(errorLocation)),
      })

      if (errorLocation) {
        const safeLine = Math.min(Math.max(errorLocation.line, 1), view.state.doc.lines)
        const lineInfo = view.state.doc.line(safeLine)
        const safeColumn = Math.max(1, errorLocation.column)
        const targetPosition = Math.min(lineInfo.from + safeColumn - 1, lineInfo.to)

        view.dispatch({
          effects: EditorView.scrollIntoView(targetPosition, { y: 'center' }),
        })
      }
    }, [errorLocation])

    useEffect(() => {
      const view = editorViewRef.current
      if (!view || !linkedScrollEnabled || !externalScrollState || externalScrollState.source === 'input') {
        return
      }

      const maxTop = Math.max(view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight, 0)
      const maxLeft = Math.max(view.scrollDOM.scrollWidth - view.scrollDOM.clientWidth, 0)

      syncingRef.current = true
      view.scrollDOM.scrollTop = maxTop * externalScrollState.topRatio
      view.scrollDOM.scrollLeft = maxLeft * externalScrollState.leftRatio
    }, [externalScrollState, linkedScrollEnabled])

    return (
      <section className="pixel-panel flex h-full min-h-[420px] flex-col overflow-hidden">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-5 dark:border-zinc-800/80">
          <div>
              <div className="flex items-center gap-3">
                <h2 className="pixel-title text-[16px] text-slate-900 dark:text-zinc-100">{title}</h2>
              {errorLocation ? (
                <span className="pixel-chip border-rose-300 bg-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
                  第 {errorLocation.line} 行 / 第 {errorLocation.column} 列
                </span>
              ) : null}
            </div>
            {headerHelpText ? (
              <p className="pixel-subtitle mt-1.5 text-[13px] leading-6 text-slate-500 dark:text-zinc-400">
                {headerHelpText}
              </p>
            ) : null}
          </div>
          <div className="pixel-chip shrink-0 px-3 py-1.5 text-[12px] font-medium text-slate-500 dark:text-zinc-300">
            {stats.characters} 字 / {stats.lines} 行
          </div>
        </header>

        <div className="min-h-0 flex-1 p-4">
          <div className="pixel-surface relative h-full min-h-0 overflow-hidden">
            <div ref={editorHostRef} className="h-full min-h-0" />
            {!value ? (
              <div className="pointer-events-none absolute left-5 top-5 text-[14px] text-slate-400 dark:text-zinc-500">
                {placeholder}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    )
  },
)

StructuredInput.displayName = 'StructuredInput'
