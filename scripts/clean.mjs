import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

const targets = [
  path.join(projectRoot, 'dist'),
  path.join(projectRoot, 'src-tauri', 'target'),
]

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true })
}

async function removeGeneratedReleaseArtifacts() {
  const releaseDir = path.join(projectRoot, 'release')

  try {
    const entries = await fs.readdir(releaseDir, { withFileTypes: true })
    await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() &&
            (/\.exe$/i.test(entry.name) || /\.msi$/i.test(entry.name) || entry.name === 'portable-release.json'),
        )
        .map((entry) => removeIfExists(path.join(releaseDir, entry.name))),
    )
  } catch {
    // Ignore missing release directory.
  }
}

await Promise.all(targets.map(removeIfExists))
await removeGeneratedReleaseArtifacts()

console.log('Cleaned dist, src-tauri/target, and generated release artifacts.')
