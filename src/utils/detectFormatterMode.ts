import { XMLValidator } from 'fast-xml-parser'
import type { FormatterMode } from '../types'

function looksLikeJson(value: string) {
  return value.startsWith('{') || value.startsWith('[')
}

function looksLikeXml(value: string) {
  return value.startsWith('<')
}

function isValidJson(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function isValidXml(value: string) {
  return XMLValidator.validate(value) === true
}

export function detectFormatterMode(input: string): FormatterMode | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  if (looksLikeJson(trimmed)) {
    return 'json'
  }

  if (looksLikeXml(trimmed)) {
    return 'xml'
  }

  if (isValidJson(trimmed)) {
    return 'json'
  }

  if (isValidXml(trimmed)) {
    return 'xml'
  }

  return null
}
