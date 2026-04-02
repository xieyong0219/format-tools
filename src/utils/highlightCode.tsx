import type { CSSProperties, ReactNode } from 'react'
import type { FormatterMode } from '../types'

const BRACKET_COLORS = ['#ef4444', '#8b5cf6', '#14b8a6', '#f59e0b', '#06b6d4', '#ec4899']

function getBracketColor(depth: number): string {
  return BRACKET_COLORS[depth % BRACKET_COLORS.length]
}

function tokenSpan(text: string, color: string, key: string, active = false) {
  const style: CSSProperties = { color }

  if (active) {
    style.background = 'rgba(59, 130, 246, 0.14)'
    style.boxShadow = '0 0 0 1px rgba(59, 130, 246, 0.24) inset'
    style.borderRadius = '6px'
  }

  return (
    <span key={key} style={style}>
      {text}
    </span>
  )
}

function plainSpan(text: string, key: string) {
  return <span key={key}>{text}</span>
}

function findNextNonWhitespace(text: string, start: number) {
  for (let index = start; index < text.length; index += 1) {
    const char = text[index]
    if (!/\s/.test(char)) {
      return char
    }
  }
  return ''
}

function highlightJson(text: string, activeBracketIndices?: Set<number>): ReactNode[] {
  const tokens: ReactNode[] = []
  let index = 0
  let depth = 0

  while (index < text.length) {
    const char = text[index]

    if (char === '"') {
      let end = index + 1
      let escaped = false

      while (end < text.length) {
        const nextChar = text[end]
        if (nextChar === '"' && !escaped) {
          end += 1
          break
        }
        escaped = nextChar === '\\' ? !escaped : false
        end += 1
      }

      const raw = text.slice(index, end)
      const nextToken = findNextNonWhitespace(text, end)
      const color = nextToken === ':' ? '#9333ea' : '#2fb357'
      tokens.push(tokenSpan(raw, color, `json-string-${index}`))
      index = end
      continue
    }

    if (char === '{' || char === '[') {
      const color = getBracketColor(depth)
      tokens.push(tokenSpan(char, color, `json-open-${index}`, activeBracketIndices?.has(index)))
      depth += 1
      index += 1
      continue
    }

    if (char === '}' || char === ']') {
      depth = Math.max(depth - 1, 0)
      const color = getBracketColor(depth)
      tokens.push(tokenSpan(char, color, `json-close-${index}`, activeBracketIndices?.has(index)))
      index += 1
      continue
    }

    if (/[0-9-]/.test(char)) {
      let end = index + 1
      while (end < text.length && /[0-9.eE+-]/.test(text[end])) {
        end += 1
      }
      tokens.push(tokenSpan(text.slice(index, end), '#f97316', `json-number-${index}`))
      index = end
      continue
    }

    if (text.startsWith('true', index) || text.startsWith('false', index)) {
      const word = text.startsWith('true', index) ? 'true' : 'false'
      tokens.push(tokenSpan(word, '#ef4444', `json-bool-${index}`))
      index += word.length
      continue
    }

    if (text.startsWith('null', index)) {
      tokens.push(tokenSpan('null', '#64748b', `json-null-${index}`))
      index += 4
      continue
    }

    if (char === ':' || char === ',') {
      tokens.push(tokenSpan(char, '#94a3b8', `json-punc-${index}`))
      index += 1
      continue
    }

    tokens.push(plainSpan(char, `json-plain-${index}`))
    index += 1
  }

  return tokens
}

function highlightXml(text: string, activeBracketIndices?: Set<number>): ReactNode[] {
  const tokens: ReactNode[] = []
  let index = 0
  let depth = 0

  while (index < text.length) {
    const char = text[index]

    if (char !== '<') {
      let end = index
      while (end < text.length && text[end] !== '<') {
        end += 1
      }
      const plainText = text.slice(index, end)
      const color = plainText.trim() ? '#2fb357' : 'inherit'
      tokens.push(tokenSpan(plainText, color, `xml-text-${index}`))
      index = end
      continue
    }

    const isClosing = text[index + 1] === '/'
    const isDeclaration = text[index + 1] === '?'
    const isComment = text.startsWith('<!--', index)

    if (isComment) {
      const end = text.indexOf('-->', index)
      const finalEnd = end === -1 ? text.length : end + 3
      tokens.push(tokenSpan(text.slice(index, finalEnd), '#94a3b8', `xml-comment-${index}`))
      index = finalEnd
      continue
    }

    if (isClosing) {
      depth = Math.max(depth - 1, 0)
    }

    const bracketColor = getBracketColor(depth)
    tokens.push(tokenSpan('<', bracketColor, `xml-open-${index}`, activeBracketIndices?.has(index)))
    index += 1

    if (isClosing) {
      tokens.push(tokenSpan('/', bracketColor, `xml-close-slash-${index}`))
      index += 1
    } else if (isDeclaration) {
      tokens.push(tokenSpan('?', bracketColor, `xml-decl-${index}`))
      index += 1
    }

    let tagEnd = index
    while (tagEnd < text.length && /[^\s/>?]/.test(text[tagEnd])) {
      tagEnd += 1
    }
    const tagName = text.slice(index, tagEnd)
    tokens.push(tokenSpan(tagName, '#1d4ed8', `xml-tag-${index}`))
    index = tagEnd

    while (index < text.length && text[index] !== '>' && text[index] !== '?') {
      if (/\s/.test(text[index])) {
        tokens.push(plainSpan(text[index], `xml-space-${index}`))
        index += 1
        continue
      }

      if (text[index] === '/') {
        tokens.push(tokenSpan('/', bracketColor, `xml-self-${index}`))
        index += 1
        continue
      }

      let attrEnd = index
      while (attrEnd < text.length && /[^\s=/>]/.test(text[attrEnd])) {
        attrEnd += 1
      }
      const attrName = text.slice(index, attrEnd)
      tokens.push(tokenSpan(attrName, '#9333ea', `xml-attr-${index}`))
      index = attrEnd

      if (text[index] === '=') {
        tokens.push(tokenSpan('=', '#94a3b8', `xml-eq-${index}`))
        index += 1
      }

      if (text[index] === '"' || text[index] === "'") {
        const quote = text[index]
        let valueEnd = index + 1
        while (valueEnd < text.length && text[valueEnd] !== quote) {
          valueEnd += 1
        }
        valueEnd = Math.min(valueEnd + 1, text.length)
        tokens.push(tokenSpan(text.slice(index, valueEnd), '#2fb357', `xml-value-${index}`))
        index = valueEnd
      }
    }

    if (text[index] === '?') {
      tokens.push(tokenSpan('?', bracketColor, `xml-end-question-${index}`))
      index += 1
    }

    if (text[index] === '>') {
      tokens.push(tokenSpan('>', bracketColor, `xml-end-${index}`, activeBracketIndices?.has(index)))
      index += 1
    }

    if (!isClosing && !isDeclaration) {
      const previousChar = text[index - 2]
      if (previousChar !== '/') {
        depth += 1
      }
    }
  }

  return tokens
}

export function renderHighlightedCode(
  mode: FormatterMode,
  value: string,
  activeBracketIndices?: Set<number>,
) {
  if (!value) {
    return null
  }

  return mode === 'json'
    ? highlightJson(value, activeBracketIndices)
    : highlightXml(value, activeBracketIndices)
}
