import { access, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createReleaseManifest, releaseGateCommands } from './create-release-manifest.mjs'

const temporaryDirectories = []

async function fixture() {
  const projectRoot = await mkdtemp(path.join(tmpdir(), 'mehmetst-release-manifest-'))
  temporaryDirectories.push(projectRoot)
  await writeFile(path.join(projectRoot, 'source.txt'), 'stable source')
  const manifestPath = path.join(projectRoot, '.council', 'release', 'manifest.json')
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, '{"sentinel":true}\n')
  return { projectRoot, manifestPath }
}

async function readManifest(pathname) {
  return JSON.parse(await readFile(pathname, 'utf8'))
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('fail-closed release manifest generation', () => {
  it('leaves no active manifest when any gate exits nonzero', async () => {
    const context = await fixture()
    await expect(
      createReleaseManifest({
        ...context,
        sourceEntries: ['source.txt'],
        expectedOrigin: 'https://example.com',
        canonicalRoutes: ['/tr'],
        runGate: async ({ command }) => ({ command, exitCode: command === 'npm run lint' ? 17 : 0, stdout: 'measured', stderr: '' }),
      }),
    ).rejects.toThrow(/npm run lint.*17/)
    await expect(access(context.manifestPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('leaves no active manifest when source changes while gates run', async () => {
    const context = await fixture()
    await expect(
      createReleaseManifest({
        ...context,
        sourceEntries: ['source.txt'],
        expectedOrigin: 'https://example.com',
        canonicalRoutes: ['/tr'],
        runGate: async ({ command }) => {
          if (command === 'npm run build') {
            await mkdir(path.join(context.projectRoot, 'dist'), { recursive: true })
            await writeFile(path.join(context.projectRoot, 'dist', 'index.html'), 'artifact')
          }
          if (command.startsWith('npm audit')) await writeFile(path.join(context.projectRoot, 'source.txt'), 'changed source')
          return { command, exitCode: 0, stdout: `measured ${command}`, stderr: '' }
        },
      }),
    ).rejects.toThrow(/Source changed while release gates were running/)
    await expect(access(context.manifestPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('leaves no active manifest when all shell gates pass but dist is missing', async () => {
    const context = await fixture()
    await expect(
      createReleaseManifest({
        ...context,
        sourceEntries: ['source.txt'],
        expectedOrigin: 'https://example.com',
        canonicalRoutes: ['/tr'],
        runGate: async ({ command }) => ({ command, exitCode: 0, stdout: `measured ${command}`, stderr: '' }),
        verifyOutput: async ({ outputRoot }) => access(path.join(outputRoot, 'index.html')),
      }),
    ).rejects.toThrow()
    await expect(access(context.manifestPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('leaves no active manifest when dist changes after the verify:build gate', async () => {
    const context = await fixture()
    await expect(
      createReleaseManifest({
        ...context,
        sourceEntries: ['source.txt'],
        expectedOrigin: 'https://example.com',
        canonicalRoutes: ['/tr'],
        runGate: async ({ command }) => {
          if (command === 'npm run build') {
            await mkdir(path.join(context.projectRoot, 'dist'), { recursive: true })
            await writeFile(path.join(context.projectRoot, 'dist', 'index.html'), 'verified artifact')
          }
          if (command.startsWith('npm audit')) await writeFile(path.join(context.projectRoot, 'dist', 'index.html'), 'mutated artifact')
          return { command, exitCode: 0, stdout: `measured ${command}`, stderr: '' }
        },
        verifyOutput: async ({ outputRoot }) => {
          if ((await readFile(path.join(outputRoot, 'index.html'), 'utf8')) !== 'verified artifact') throw new Error('stale or mutated dist')
        },
      }),
    ).rejects.toThrow(/stale or mutated dist/)
    await expect(access(context.manifestPath)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('writes command exit codes and captured output only after every gate passes', async () => {
    const context = await fixture()
    const result = await createReleaseManifest({
      ...context,
      sourceEntries: ['source.txt'],
      expectedOrigin: 'https://example.com',
      canonicalRoutes: ['/tr'],
      verifyOutput: async () => ({ htmlShells: 1, sitemapRoutes: 1, expectedOrigin: 'https://example.com' }),
      runGate: async ({ command }) => {
        if (command === 'npm run build') {
          await mkdir(path.join(context.projectRoot, 'dist'), { recursive: true })
          await writeFile(path.join(context.projectRoot, 'dist', 'index.html'), 'artifact')
        }
        return { command, exitCode: 0, stdout: `measured ${command}`, stderr: '' }
      },
    })

    const manifest = await readManifest(context.manifestPath)
    expect(manifest.sourceSha256).toBe(manifest.verification.sourceSha256After)
    expect(manifest.verification.sourceSha256Before).toBe(manifest.verification.sourceSha256After)
    expect(manifest.verification.commands).toEqual(
      releaseGateCommands.map(({ command }) => ({ command, exitCode: 0, stdout: `measured ${command}`, stderr: '' })),
    )
    const expectedArtifactHash = createHash('sha256').update('index.html').update('\0').update('artifact').update('\0').digest('hex')
    expect(manifest.artifactSha256).toBe(expectedArtifactHash)
    expect(manifest.verification.finalBuildOutput).toEqual({
      htmlShells: 1,
      sitemapRoutes: 1,
      expectedOrigin: 'https://example.com',
    })
    expect(result.manifest).toEqual(manifest)
    await expect(readdir(path.dirname(context.manifestPath))).resolves.toEqual(['manifest.json'])
  })
})
