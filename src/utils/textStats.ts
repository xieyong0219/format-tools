import type { TextStats } from '../types'

export function getTextStats(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      lines: 0,
    }
  }

  return {
    characters: text.length,
    lines: text.split(/\r\n|\r|\n/).length,
  }
}
