import type { ValidationError } from 'fast-xml-parser'
import type { ErrorLocation, FormatterMode, ReadableErrorInfo } from '../types'

function isXmlValidationError(value: unknown): value is ValidationError {
  return typeof value === 'object' && value !== null && 'err' in value
}

function getMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return '未知错误'
}

function getLineExcerpt(input: string, line: number) {
  return input.split(/\r?\n/)[line - 1]?.trim() ?? ''
}

function getLocationFromOffset(input: string, offset: number): ErrorLocation {
  let line = 1
  let column = 1

  for (let index = 0; index < Math.min(offset, input.length); index += 1) {
    if (input[index] === '\n') {
      line += 1
      column = 1
      continue
    }

    column += 1
  }

  return {
    line,
    column,
    excerpt: getLineExcerpt(input, line),
  }
}

function getLocationFromLineColumn(input: string, line: number, column: number): ErrorLocation {
  return {
    line,
    column,
    excerpt: getLineExcerpt(input, line),
  }
}

function normalizeJsonError(error: unknown, input: string): ReadableErrorInfo {
  const rawMessage = getMessage(error)
  const lineColumnMatch = rawMessage.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  const positionMatch = rawMessage.match(/position\s+(\d+)/i)

  const location = lineColumnMatch
    ? getLocationFromLineColumn(input, Number(lineColumnMatch[1]), Number(lineColumnMatch[2]))
    : positionMatch
      ? getLocationFromOffset(input, Number(positionMatch[1]))
      : undefined

  const cleanedMessage = rawMessage
    .replace(/\s+at position\s+\d+(?:\s+\(line\s+\d+\s+column\s+\d+\))?/i, '')
    .trim()

  return {
    message: location
      ? `JSON 格式错误：${cleanedMessage}（第 ${location.line} 行，第 ${location.column} 列）`
      : `JSON 格式错误：${cleanedMessage}`,
    location,
  }
}

function normalizeXmlError(error: unknown, input: string): ReadableErrorInfo {
  if (isXmlValidationError(error)) {
    const { msg, line, col } = error.err
    const location = getLocationFromLineColumn(input, line, col)

    return {
      message: `XML 格式错误：${msg}（第 ${line} 行，第 ${col} 列）`,
      location,
    }
  }

  return {
    message: `XML 格式错误：${getMessage(error)}`,
  }
}

export function toReadableErrorInfo(
  error: unknown,
  mode: FormatterMode,
  input: string,
): ReadableErrorInfo {
  return mode === 'json' ? normalizeJsonError(error, input) : normalizeXmlError(error, input)
}

export function summarizeError(message: string, maxLength = 42) {
  if (!message) {
    return ''
  }

  if (message.length <= maxLength) {
    return message
  }

  return `${message.slice(0, maxLength - 1)}…`
}
