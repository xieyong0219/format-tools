import { XMLValidator } from 'fast-xml-parser'
import xmlFormatter from 'xml-formatter'

const PRETTY_OPTIONS = {
  indentation: '  ',
  lineSeparator: '\n',
  collapseContent: true,
  whiteSpaceAtEndOfSelfclosingTag: true,
  throwOnFailure: true,
  strictMode: true,
  attributeQuotes: 'double' as const,
}

const MINIFY_OPTIONS = {
  collapseContent: true,
  whiteSpaceAtEndOfSelfclosingTag: false,
  throwOnFailure: true,
  strictMode: true,
  attributeQuotes: 'double' as const,
}

function validateXml(input: string) {
  const result = XMLValidator.validate(input)
  if (result !== true) {
    throw result
  }
}

export function formatXml(input: string) {
  validateXml(input)
  return xmlFormatter(input, PRETTY_OPTIONS)
}

export function compressXml(input: string) {
  validateXml(input)
  return xmlFormatter.minify(input, MINIFY_OPTIONS)
}
