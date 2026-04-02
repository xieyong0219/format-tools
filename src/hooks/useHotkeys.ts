import { useEffect } from 'react'

interface UseHotkeysOptions {
  onFormat: () => void
  onCompress: () => void
  onClear: () => void
  onImportClipboard: () => void
}

export function useHotkeys({
  onFormat,
  onCompress,
  onClear,
  onImportClipboard,
}: UseHotkeysOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.isComposing || event.altKey) {
        return
      }

      const key = event.key.toLowerCase()

      if (event.ctrlKey && !event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        onFormat()
        return
      }

      if (event.ctrlKey && event.shiftKey && key === 'c') {
        event.preventDefault()
        onCompress()
        return
      }

      if (event.ctrlKey && !event.shiftKey && key === 'l') {
        event.preventDefault()
        onClear()
        return
      }

      if (event.ctrlKey && event.shiftKey && key === 'v') {
        event.preventDefault()
        onImportClipboard()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClear, onCompress, onFormat, onImportClipboard])
}
