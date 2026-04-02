import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const packageJson = JSON.parse(await fs.readFile(path.join(projectRoot, 'package.json'), 'utf8'))
const releaseDir = path.join(projectRoot, 'release')
const sourceBinary = path.join(projectRoot, 'src-tauri', 'target', 'release', 'json_xml_formatter.exe')
const versionedArtifact = path.join(releaseDir, `format-tools-v${packageJson.version}-portable.exe`)
const latestArtifact = path.join(releaseDir, 'format-tools-latest-portable.exe')
const manifestPath = path.join(releaseDir, 'portable-release.json')

function run(command) {
  execSync(command, {
    cwd: projectRoot,
    stdio: 'inherit',
  })
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

run('npm run clean')
run('npm run verify')
run('npx tauri build --no-bundle')

await fs.mkdir(releaseDir, { recursive: true })

const binary = await fs.readFile(sourceBinary)
await fs.copyFile(sourceBinary, versionedArtifact)
await fs.copyFile(sourceBinary, latestArtifact)

const manifest = {
  version: packageJson.version,
  builtAt: new Date().toISOString(),
  sourceBinary: path.relative(projectRoot, sourceBinary),
  artifacts: [
    {
      path: path.relative(projectRoot, versionedArtifact),
      sha256: sha256(binary),
    },
    {
      path: path.relative(projectRoot, latestArtifact),
      sha256: sha256(binary),
    },
  ],
}

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('\nPortable release artifacts:')
for (const artifact of manifest.artifacts) {
  console.log(`- ${artifact.path}`)
}
