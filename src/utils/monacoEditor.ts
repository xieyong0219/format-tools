import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import type { FormatterMode } from '../types'

const editorFont =
  "'Cascadia Mono','JetBrains Mono','Consolas','Microsoft YaHei UI',monospace"

let configured = false

function ensureWorkerEnvironment() {
  const scope = globalThis as typeof globalThis & {
    MonacoEnvironment?: {
      getWorker: (_workerId: string, label: string) => Worker
    }
  }

  scope.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }

      if (label === 'html' || label === 'xml') {
        return new htmlWorker()
      }

      return new editorWorker()
    },
  }
}

export function getMonacoLanguage(mode: FormatterMode) {
  return mode === 'json' ? 'json' : 'xml'
}

export function configureMonaco() {
  if (configured) {
    return
  }

  ensureWorkerEnvironment()
  loader.config({ monaco })

  monaco.editor.defineTheme('pixel-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '9333ea' },
      { token: 'string.value.json', foreground: '2fb357' },
      { token: 'string', foreground: '2fb357' },
      { token: 'number', foreground: 'f97316' },
      { token: 'keyword', foreground: 'ef4444' },
      { token: 'delimiter', foreground: '94a3b8' },
      { token: 'tag', foreground: '1d4ed8' },
      { token: 'attribute.name', foreground: '9333ea' },
      { token: 'attribute.value', foreground: '2fb357' },
    ],
    colors: {
      'editor.background': '#00000000',
      'editor.foreground': '#1f2937',
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#334155',
      'editorLineNumber.dimmedForeground': '#cbd5e1',
      'editorGutter.background': '#00000000',
      'editor.foldBackground': '#00000000',
      'editor.lineHighlightBackground': '#dbeafe',
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': '#f59e0b33',
      'editor.inactiveSelectionBackground': '#f59e0b22',
      'editorCursor.foreground': '#0f172a',
      'editorWhitespace.foreground': '#00000000',
      'editorIndentGuide.background1': '#00000000',
      'editorIndentGuide.activeBackground1': '#00000000',
      'editorBracketMatch.background': '#0ea5e922',
      'editorBracketMatch.border': '#0ea5e955',
      'editorError.foreground': '#e11d48',
      'editorHoverWidget.background': '#fffaf0',
      'editorHoverWidget.border': '#23262b',
      'editorWidget.background': '#fffaf0',
      'editorWidget.border': '#23262b',
      'editorSuggestWidget.background': '#fffaf0',
      'editorSuggestWidget.border': '#23262b',
      'editorSuggestWidget.foreground': '#1f2937',
      'editorSuggestWidget.selectedBackground': '#efe5ce',
      'scrollbarSlider.background': '#94a3b855',
      'scrollbarSlider.hoverBackground': '#64748b88',
      'scrollbarSlider.activeBackground': '#475569aa',
    },
  })

  monaco.editor.defineTheme('pixel-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: 'c084fc' },
      { token: 'string.value.json', foreground: '65d46e' },
      { token: 'string', foreground: '65d46e' },
      { token: 'number', foreground: 'fb923c' },
      { token: 'keyword', foreground: 'fb7185' },
      { token: 'delimiter', foreground: 'a1a1aa' },
      { token: 'tag', foreground: '60a5fa' },
      { token: 'attribute.name', foreground: 'c084fc' },
      { token: 'attribute.value', foreground: '65d46e' },
    ],
    colors: {
      'editor.background': '#00000000',
      'editor.foreground': '#f4f4f5',
      'editorLineNumber.foreground': '#71717a',
      'editorLineNumber.activeForeground': '#f4f4f5',
      'editorLineNumber.dimmedForeground': '#52525b',
      'editorGutter.background': '#00000000',
      'editor.foldBackground': '#00000000',
      'editor.lineHighlightBackground': '#3a3a44',
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': '#65d46e33',
      'editor.inactiveSelectionBackground': '#65d46e22',
      'editorCursor.foreground': '#fafafa',
      'editorWhitespace.foreground': '#00000000',
      'editorIndentGuide.background1': '#00000000',
      'editorIndentGuide.activeBackground1': '#00000000',
      'editorBracketMatch.background': '#22c55e22',
      'editorBracketMatch.border': '#22c55e55',
      'editorError.foreground': '#fb7185',
      'editorHoverWidget.background': '#202328',
      'editorHoverWidget.border': '#d4d4d8',
      'editorWidget.background': '#202328',
      'editorWidget.border': '#d4d4d8',
      'editorSuggestWidget.background': '#202328',
      'editorSuggestWidget.border': '#d4d4d8',
      'editorSuggestWidget.foreground': '#f4f4f5',
      'editorSuggestWidget.selectedBackground': '#2a2e34',
      'scrollbarSlider.background': '#71717a55',
      'scrollbarSlider.hoverBackground': '#a1a1aa88',
      'scrollbarSlider.activeBackground': '#d4d4d8aa',
    },
  })

  configured = true
}

export function getMonacoTheme(isDark: boolean) {
  configureMonaco()
  return isDark ? 'pixel-dark' : 'pixel-light'
}

export function getEditorFont() {
  return editorFont
}
