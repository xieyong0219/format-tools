function hasTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function copyTextWithExecCommand(text: string) {
  if (typeof document === 'undefined') {
    throw new Error('clipboard-unavailable')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('clipboard-unavailable')
  }
}

export function useClipboard() {
  async function readClipboardText() {
    if (hasTauriRuntime()) {
      try {
        const { readText } = await import('@tauri-apps/plugin-clipboard-manager')
        return await readText()
      } catch {
        // Fall through to browser clipboard support.
      }
    }

    if (navigator.clipboard?.readText) {
      return navigator.clipboard.readText()
    }

    throw new Error('clipboard-unavailable')
  }

  async function writeClipboardText(text: string) {
    if (hasTauriRuntime()) {
      try {
        const { writeText } = await import('@tauri-apps/plugin-clipboard-manager')
        await writeText(text)
        return
      } catch {
        // Fall through to browser clipboard support.
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch {
        // Fall through to legacy browser copy support.
      }
    }

    copyTextWithExecCommand(text)
  }

  return {
    readClipboardText,
    writeClipboardText,
  }
}
