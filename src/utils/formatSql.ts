import { format } from 'sql-formatter'

const FORMAT_OPTIONS = {
  language: 'sql' as const,
  tabWidth: 2,
  linesBetweenQueries: 1,
  denseOperators: false,
}

const NO_SPACE_BEFORE = new Set([',', ';', ')', ']'])
const NO_SPACE_AFTER = new Set(['(', '[', '.'])

function shouldInsertSpace(previousChar: string, nextChar: string) {
  if (!previousChar || !nextChar) {
    return false
  }

  if (NO_SPACE_BEFORE.has(nextChar)) {
    return false
  }

  if (NO_SPACE_AFTER.has(previousChar) || nextChar === '.') {
    return false
  }

  return true
}

export function formatSql(input: string) {
  return format(input, FORMAT_OPTIONS)
}

export function compressSql(input: string) {
  let result = ''
  let pendingSpace = false
  let index = 0
  let state:
    | 'normal'
    | 'single-quote'
    | 'double-quote'
    | 'backtick'
    | 'bracket'
    | 'line-comment'
    | 'block-comment' = 'normal'

  function push(nextChar: string) {
    const previousChar = result.at(-1) ?? ''
    if (pendingSpace && shouldInsertSpace(previousChar, nextChar)) {
      result += ' '
    }

    pendingSpace = false
    result += nextChar
  }

  while (index < input.length) {
    const char = input[index]
    const nextChar = input[index + 1] ?? ''

    if (state === 'line-comment') {
      if (char === '\r' || char === '\n') {
        state = 'normal'
        pendingSpace = true
        index += 1
        continue
      }

      result += char
      index += 1
      continue
    }

    if (state === 'block-comment') {
      result += char
      if (char === '*' && nextChar === '/') {
        result += '/'
        index += 2
        state = 'normal'
        pendingSpace = true
        continue
      }

      index += 1
      continue
    }

    if (state === 'single-quote') {
      result += char
      if (char === "'" && nextChar === "'") {
        result += "'"
        index += 2
        continue
      }

      if (char === "'") {
        state = 'normal'
      }

      index += 1
      continue
    }

    if (state === 'double-quote') {
      result += char
      if (char === '"' && nextChar === '"') {
        result += '"'
        index += 2
        continue
      }

      if (char === '"') {
        state = 'normal'
      }

      index += 1
      continue
    }

    if (state === 'backtick') {
      result += char
      if (char === '`') {
        state = 'normal'
      }

      index += 1
      continue
    }

    if (state === 'bracket') {
      result += char
      if (char === ']' && nextChar === ']') {
        result += ']'
        index += 2
        continue
      }

      if (char === ']') {
        state = 'normal'
      }

      index += 1
      continue
    }

    if (/\s/.test(char)) {
      pendingSpace = true
      index += 1
      continue
    }

    if (char === '-' && nextChar === '-') {
      push('-')
      result += '-'
      index += 2
      state = 'line-comment'
      continue
    }

    if (char === '/' && nextChar === '*') {
      push('/')
      result += '*'
      index += 2
      state = 'block-comment'
      continue
    }

    if (char === "'") {
      push(char)
      state = 'single-quote'
      index += 1
      continue
    }

    if (char === '"') {
      push(char)
      state = 'double-quote'
      index += 1
      continue
    }

    if (char === '`') {
      push(char)
      state = 'backtick'
      index += 1
      continue
    }

    if (char === '[') {
      push(char)
      state = 'bracket'
      index += 1
      continue
    }

    push(char)
    index += 1
  }

  return result.trim()
}
