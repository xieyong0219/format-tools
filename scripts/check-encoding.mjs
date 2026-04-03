import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'release',
  'src-tauri/target',
])

const ignoredFiles = new Set([
  'scripts/check-encoding.mjs',
])

const textExtensions = new Set([
  '.css',
  '.gitignore',
  '.gitattributes',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.rs',
  '.svg',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.yml',
  '.yaml',
])

const suspiciousTokens = [
  '鏍煎紡',
  '鍘嬬缉',
  '瀵煎叆',
  '褰撳墠',
  '杈撳叆',
  '杈撳嚭',
  '鍔熷痉',
  '鍒囨崲',
  '澶勭悊',
  '銆',
  '鈥',
]

function shouldIgnoreDirectory(relativePath) {
  const normalizedPath = relativePath.split(path.sep).join('/')

  return Array.from(ignoredDirectories).some(
    (directory) => normalizedPath === directory || normalizedPath.startsWith(`${directory}/`),
  )
}

function isTextFile(filePath) {
  const baseName = path.basename(filePath)
  const extension = path.extname(filePath)
  return textExtensions.has(extension) || textExtensions.has(baseName)
}

async function collectFiles(currentPath, bucket) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(currentPath, entry.name)
    const relativePath = path.relative(projectRoot, absolutePath)
    const normalizedRelativePath = relativePath.split(path.sep).join('/')

    if (entry.isDirectory()) {
      if (!shouldIgnoreDirectory(relativePath)) {
        await collectFiles(absolutePath, bucket)
      }
      continue
    }

    if (entry.isFile() && isTextFile(absolutePath)) {
      if (!ignoredFiles.has(normalizedRelativePath)) {
        bucket.push(absolutePath)
      }
    }
  }
}

function analyzeFile(filePath, content) {
  const issues = []

  if (content.charCodeAt(0) === 0xfeff) {
    issues.push('contains a UTF-8 BOM')
  }

  if (content.includes('\ufffd')) {
    issues.push('contains replacement characters')
  }

  const matchedTokens = suspiciousTokens.filter((token) => content.includes(token))
  if (matchedTokens.length > 0) {
    issues.push(`contains suspicious mojibake tokens: ${matchedTokens.join(', ')}`)
  }

  return issues
}

const files = []
await collectFiles(projectRoot, files)

const failures = []

for (const filePath of files) {
  const content = await fs.readFile(filePath, 'utf8')
  const issues = analyzeFile(filePath, content)

  if (issues.length > 0) {
    failures.push({
      file: path.relative(projectRoot, filePath),
      issues,
    })
  }
}

if (failures.length > 0) {
  console.error('Encoding check failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure.file}`)
    for (const issue of failure.issues) {
      console.error(`  - ${issue}`)
    }
  }
  process.exit(1)
}

console.log(`Encoding check passed for ${files.length} text files.`)
