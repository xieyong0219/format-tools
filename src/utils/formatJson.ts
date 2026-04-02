export function formatJson(input: string) {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed, null, 2)
}

export function compressJson(input: string) {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed)
}
