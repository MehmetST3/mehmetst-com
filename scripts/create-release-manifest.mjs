import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { access, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadSeoBuildContract, normalizeOrigin, runBuildOutputVerification } from './verify-build-output.mjs'

export const releaseGateCommands = Object.freeze([
  { command: 'npm run lint', args: ['run', 'lint'] },
  { command: 'npm run typecheck', args: ['run', 'typecheck'] },
  { command: 'npm test', args: ['test'] },
  { command: 'npm run build', args: ['run', 'build'] },
  { command: 'npm run verify:build', args: ['run', 'verify:build'] },
  { command: 'npm audit --omit=dev --audit-level=low', args: ['audit', '--omit=dev', '--audit-level=low'] },
])

const defaultSourceEntries = Object.freeze([
  '.gitignore',
  '.vercelignore',
  'README.md',
  'eslint.config.js',
  'index.html',
  'package-lock.json',
  'package.json',
  'public',
  'scripts',
  'src',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vercel.json',
  'vite.config.ts',
])

function stripAnsi(value) {
  return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
}

function outputEvidence(value) {
  const clean = stripAnsi(value || '').trim()
  if (!clean) return ''
  const tail = clean.split(/\r?\n/).slice(-40).join('\n')
  return tail.length > 6000 ? tail.slice(-6000) : tail
}

async function hashEntries(root, entries) {
  const hash = createHash('sha256')

  async function append(relativePath) {
    const absolutePath = path.join(root, relativePath)
    const stats = await lstat(absolutePath)
    if (stats.isDirectory()) {
      const children = (await readdir(absolutePath)).sort((left, right) => left.localeCompare(right))
      for (const child of children) await append(path.join(relativePath, child))
      return
    }

    const normalizedPath = relativePath.replaceAll(path.sep, '/')
    hash.update(normalizedPath)
    hash.update('\0')
    hash.update(await readFile(absolutePath))
    hash.update('\0')
  }

  for (const entry of [...entries].sort((left, right) => left.localeCompare(right))) await append(entry)
  return hash.digest('hex')
}

async function executeGate(gate, projectRoot) {
  const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const result = spawnSync(executable, gate.args, {
    cwd: projectRoot,
    encoding: 'utf8',
    env: process.env,
    shell: process.platform === 'win32',
    windowsHide: true,
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  return {
    command: gate.command,
    exitCode: result.status ?? 1,
    stdout: outputEvidence(result.stdout),
    stderr: outputEvidence(result.error ? `${result.stderr || ''}\n${result.error.message}` : result.stderr),
  }
}

async function writeManifestAtomically(manifestPath, manifest) {
  await mkdir(path.dirname(manifestPath), { recursive: true })
  const temporaryPath = `${manifestPath}.${process.pid}.${Date.now()}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`)
    JSON.parse(await readFile(temporaryPath, 'utf8'))
    await rename(temporaryPath, manifestPath)
  } finally {
    await rm(temporaryPath, { force: true })
  }
}

export async function createReleaseManifest({
  projectRoot,
  manifestPath = path.join(projectRoot, '.council', 'release', 'manifest.json'),
  sourceEntries = defaultSourceEntries,
  expectedOrigin,
  canonicalRoutes,
  runGate = (gate) => executeGate(gate, projectRoot),
  verifyOutput = ({ outputRoot, siteOrigin }) =>
    runBuildOutputVerification({ projectRoot, outputRoot, siteUrl: siteOrigin }),
}) {
  await rm(manifestPath, { force: true })
  const contract = canonicalRoutes && expectedOrigin ? null : await loadSeoBuildContract(projectRoot)
  const routes = canonicalRoutes || contract.canonicalRoutes
  const siteOrigin = normalizeOrigin(expectedOrigin || process.env.VITE_SITE_URL || contract.fallbackSiteUrl)
  const outputRoot = path.join(projectRoot, 'dist')

  await rm(outputRoot, { recursive: true, force: true })
  const sourceSha256Before = await hashEntries(projectRoot, sourceEntries)
  const commands = []

  for (const gate of releaseGateCommands) {
    const result = await runGate(gate)
    const evidence = {
      command: gate.command,
      exitCode: Number.isInteger(result.exitCode) ? result.exitCode : 1,
      stdout: outputEvidence(result.stdout),
      stderr: outputEvidence(result.stderr),
    }
    commands.push(evidence)
    if (evidence.exitCode !== 0) throw new Error(`Release gate failed: ${gate.command} exited ${evidence.exitCode}`)
  }

  const sourceSha256AfterGates = await hashEntries(projectRoot, sourceEntries)
  if (sourceSha256Before !== sourceSha256AfterGates) {
    throw new Error(`Source changed while release gates were running: ${sourceSha256Before} -> ${sourceSha256AfterGates}`)
  }

  const finalBuildOutput = await verifyOutput({ projectRoot, outputRoot, siteOrigin, canonicalRoutes: routes })
  const sourceSha256After = await hashEntries(projectRoot, sourceEntries)
  if (sourceSha256Before !== sourceSha256After) {
    throw new Error(`Source changed during final build verification: ${sourceSha256Before} -> ${sourceSha256After}`)
  }
  await access(path.join(outputRoot, 'index.html'))
  const artifactSha256 = await hashEntries(outputRoot, ['.'])
  const manifest = {
    schema: 2,
    project: 'mehmetst-com',
    framework: 'vite-react',
    packageManager: 'npm',
    sourceSha256: sourceSha256After,
    artifactSha256,
    outputDirectory: 'dist',
    siteOrigin,
    requiredEnvironmentNames: [],
    routes: ['/', ...routes],
    deploymentAuthorized: false,
    verification: {
      sourceSha256Before,
      sourceSha256After,
      commands,
      finalBuildOutput,
    },
  }

  await writeManifestAtomically(manifestPath, manifest)
  return { manifestPath, manifest }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  const projectRoot = path.resolve(path.dirname(process.argv[1]), '..')
  try {
    const result = await createReleaseManifest({ projectRoot })
    console.log(`SOURCE_SHA256=${result.manifest.sourceSha256}`)
    console.log(`ARTIFACT_SHA256=${result.manifest.artifactSha256}`)
    console.log(`MANIFEST=${result.manifestPath}`)
    console.log('RELEASE_MANIFEST_VERIFIED')
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
