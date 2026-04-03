import { useRef, type ChangeEvent } from 'react'
import type { ImportedTextPayload } from '../types'

const ACCEPTED_EXTENSIONS = '.json,.xml,.txt,.pom'

function hasTauriRuntime() {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
}

function getDefaultFileName(mode: 'json' | 'xml') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `formatter-output-${stamp}.${mode === 'json' ? 'json' : 'xml'}`
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('file-read-failed'))
    reader.readAsText(file, 'utf-8')
  })
}

export function useFileTransfer() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingPickerResolveRef = useRef<((value: ImportedTextPayload | null) => void) | null>(null)
  const pendingPickerRejectRef = useRef<((reason?: unknown) => void) | null>(null)
  const focusCleanupRef = useRef<(() => void) | null>(null)

  function clearPendingPicker() {
    pendingPickerResolveRef.current = null
    pendingPickerRejectRef.current = null
    if (focusCleanupRef.current) {
      focusCleanupRef.current()
      focusCleanupRef.current = null
    }
  }

  async function openFilePicker() {
    if (hasTauriRuntime()) {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const selectedPath = await open({
        title: '导入文件',
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'JSON XML Text',
            extensions: ['json', 'xml', 'txt', 'pom'],
          },
        ],
      })

      if (!selectedPath || Array.isArray(selectedPath)) {
        return null
      }

      const text = await readTextFile(selectedPath)
      return {
        text,
        path: selectedPath,
        name: selectedPath.split(/[/\\]/).pop() ?? null,
      }
    }

    const input = fileInputRef.current
    if (!input) {
      return null
    }

    if (pendingPickerResolveRef.current) {
      pendingPickerResolveRef.current(null)
      clearPendingPicker()
    }

    input.value = ''

    return new Promise<ImportedTextPayload | null>((resolve, reject) => {
      pendingPickerResolveRef.current = resolve
      pendingPickerRejectRef.current = reject

      const handleFocus = () => {
        window.setTimeout(() => {
          if (pendingPickerResolveRef.current) {
            pendingPickerResolveRef.current(null)
            clearPendingPicker()
          }
        }, 300)
      }

      window.addEventListener('focus', handleFocus, { once: true })
      focusCleanupRef.current = () => window.removeEventListener('focus', handleFocus)
      input.click()
    })
  }

  async function readSelectedFile(file: File | null | undefined) {
    if (!file) {
      return ''
    }

    return readFileAsText(file)
  }

  async function readDroppedFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return ''
    }

    return readSelectedFile(files[0])
  }

  async function exportText(mode: 'json' | 'xml', text: string) {
    if (hasTauriRuntime()) {
      const { save } = await import('@tauri-apps/plugin-dialog')
      const { writeTextFile } = await import('@tauri-apps/plugin-fs')
      const targetPath = await save({
        title: '导出结果',
        defaultPath: getDefaultFileName(mode),
        filters: [
          {
            name: mode.toUpperCase(),
            extensions: [mode === 'json' ? 'json' : 'xml', 'txt'],
          },
        ],
      })

      if (!targetPath) {
        return false
      }

      await writeTextFile(targetPath, text)
      return true
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = getDefaultFileName(mode)
    anchor.click()
    URL.revokeObjectURL(objectUrl)
    return true
  }

  async function handleBrowserFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const resolve = pendingPickerResolveRef.current
    const reject = pendingPickerRejectRef.current

    try {
      if (!resolve) {
        event.target.value = ''
        return
      }

      const text = await readSelectedFile(file)
      resolve(
        text
          ? {
              text,
              path: file?.name ?? null,
              name: file?.name ?? null,
            }
          : null,
      )
    } catch (error) {
      if (reject) {
        reject(error)
      }
    } finally {
      clearPendingPicker()
      event.target.value = ''
    }
  }

  return {
    acceptedExtensions: ACCEPTED_EXTENSIONS,
    fileInputRef,
    openFilePicker,
    readSelectedFile,
    readDroppedFiles,
    exportText,
    handleBrowserFileInputChange,
  }
}
