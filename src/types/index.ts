export type FormatterMode = 'json' | 'xml'

export type WorkbenchId = 'formatter' | 'compare' | 'cron'

export type CompareMode = 'auto' | FormatterMode | 'text'

export type ComparePane = 'left' | 'right'

export type FormatAction = 'format' | 'compress'

export type OutputViewMode = 'structured' | 'raw'

export type StatusTone = 'idle' | 'info' | 'success' | 'error'

export type ModeSource = 'manual' | 'auto'

export interface TextStats {
  characters: number
  lines: number
}

export interface ErrorLocation {
  line: number
  column: number
  excerpt?: string
}

export interface ReadableErrorInfo {
  message: string
  location?: ErrorLocation
}

export interface ScrollSyncState {
  source: 'input' | 'output'
  top: number
  left: number
  topRatio: number
  leftRatio: number
}

export interface DiffStats {
  changes: number
  insertions: number
  deletions: number
  modifications: number
}

export interface ImportedTextPayload {
  text: string
  path: string | null
  name: string | null
}

export interface FormatterSnapshot {
  mode: FormatterMode
  input: string
  output: string
  outputViewMode: OutputViewMode
}

export interface HistoryRecord extends FormatterSnapshot {
  id: string
  createdAt: string
}

export interface FutureFeatureFlags {
  fileImport: boolean
  fileExport: boolean
  dragAndDrop: boolean
  darkMode: boolean
  history: boolean
  autoDetect: boolean
  tabs: boolean
}
