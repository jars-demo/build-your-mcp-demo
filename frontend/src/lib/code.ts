import fs from 'node:fs'
import path from 'node:path'

// Code on the site is read from the real server at build time, so it can never drift.

const REPO = path.join(process.cwd(), '..')

export function readRepoFile(file: string): string {
  // The files this reads are listed in outputFileTracingIncludes in next.config.ts.
  return fs
    .readFileSync(path.join(/*turbopackIgnore: true*/ REPO, file), 'utf8')
    .replace(/\r\n/g, '\n')
}

// Pulls one `server.registerX(\n    'name', ...\n  )` call out of a server file and removes the
// shared indent. Returns an empty string if the call is not found (a unit test guards this).
export function extractRegistration(source: string, name: string): string {
  const lines = source.split('\n')
  const nameLine = lines.findIndex((line) => line.trim() === `'${name}',`)
  if (nameLine < 1 || !/^\s+server\.register\w+\($/.test(lines[nameLine - 1] ?? '')) return ''
  const end = lines.findIndex((line, i) => i > nameLine && line === '  )')
  if (end === -1) return ''
  return lines
    .slice(nameLine - 1, end + 1)
    .map((line) => line.slice(2))
    .join('\n')
}
