import { useEffect, useState } from 'react'

export function useWindowControls() {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    let mounted = true

    async function syncWindowState() {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const currentWindow = getCurrentWindow()
        const nextValue = await currentWindow.isAlwaysOnTop()

        if (mounted) {
          setIsAlwaysOnTop(nextValue)
          setIsAvailable(true)
        }
      } catch {
        if (mounted) {
          setIsAvailable(false)
        }
      }
    }

    void syncWindowState()

    return () => {
      mounted = false
    }
  }, [])

  async function toggleAlwaysOnTop() {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const currentWindow = getCurrentWindow()
      const nextValue = !isAlwaysOnTop
      await currentWindow.setAlwaysOnTop(nextValue)
      setIsAlwaysOnTop(nextValue)
      setIsAvailable(true)
      return nextValue
    } catch {
      setIsAvailable(false)
      return null
    }
  }

  return {
    isAlwaysOnTop,
    isAvailable,
    toggleAlwaysOnTop,
  }
}
