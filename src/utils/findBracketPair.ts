import type { FormatterMode } from '../types'

const JSON_OPENERS = new Set(['{', '['])
const JSON_CLOSERS: Record<string, string> = {
  '}': '{',
  ']': '[',
}

function getTargetIndex(value: string, caretPosition: number) {
  const previousIndex = Math.max(caretPosition - 1, 0)
  const previousChar = value[previousIndex]
  const currentChar = value[caretPosition]

  if (previousChar && '{}[]<>'.includes(previousChar)) {
    return previousIndex
  }

  if (currentChar && '{}[]<>'.includes(currentChar)) {
    return caretPosition
  }

  return -1
}

function buildJsonBracketMap(value: string) {
  const pairMap = new Map<number, number>()
  const stack: Array<{ char: string; index: number }> = []

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (char === '"') {
      let cursor = index + 1
      let escaped = false

      while (cursor < value.length) {
        const nextChar = value[cursor]
        if (nextChar === '"' && !escaped) {
          break
        }
        escaped = nextChar === '\\' ? !escaped : false
        cursor += 1
      }

      index = cursor
      continue
    }

    if (JSON_OPENERS.has(char)) {
      stack.push({ char, index })
      continue
    }

    if (char in JSON_CLOSERS) {
      const top = stack[stack.length - 1]
      if (top && top.char === JSON_CLOSERS[char]) {
        stack.pop()
        pairMap.set(top.index, index)
        pairMap.set(index, top.index)
      }
    }
  }

  return pairMap
}

function buildXmlBracketMap(value: string) {
  const pairMap = new Map<number, number>()

  for (let index = 0; index < value.length; index += 1) {
    if (value.startsWith('<!--', index)) {
      const end = value.indexOf('-->', index + 4)
      index = end === -1 ? value.length : end + 2
      continue
    }

    if (value.startsWith('<![CDATA[', index)) {
      const end = value.indexOf(']]>', index + 9)
      index = end === -1 ? value.length : end + 2
      continue
    }

    if (value[index] !== '<') {
      continue
    }

    const start = index
    let quote: '"' | "'" | null = null

    for (let cursor = index + 1; cursor < value.length; cursor += 1) {
      const char = value[cursor]

      if (quote) {
        if (char === quote) {
          quote = null
        }
        continue
      }

      if (char === '"' || char === "'") {
        quote = char
        continue
      }

      if (char === '>') {
        pairMap.set(start, cursor)
        pairMap.set(cursor, start)
        index = cursor
        break
      }
    }
  }

  return pairMap
}

export function findBracketPair(
  mode: FormatterMode,
  value: string,
  caretPosition: number,
): Set<number> | undefined {
  if (!value) {
    return undefined
  }

  const targetIndex = getTargetIndex(value, caretPosition)
  if (targetIndex === -1) {
    return undefined
  }

  const pairMap = mode === 'json' ? buildJsonBracketMap(value) : buildXmlBracketMap(value)
  const pairIndex = pairMap.get(targetIndex)

  if (pairIndex === undefined) {
    return undefined
  }

  return new Set([targetIndex, pairIndex])
}
