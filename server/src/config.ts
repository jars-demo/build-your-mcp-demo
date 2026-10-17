import os from 'node:os'
import path from 'node:path'

// The only place that reads environment variables. Everything else gets a Config.

export type Config = {
  notesFile: string
  httpHost: string
  httpPort: number
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    notesFile: resolveNotesFile(env.JOTTER_NOTES_FILE),
    httpHost: env.JOTTER_HTTP_HOST?.trim() || '127.0.0.1',
    httpPort: parsePort(env.JOTTER_HTTP_PORT),
  }
}

// The notes file is chosen by the person running the server, never by the model. It must be a
// .json file, and it is resolved to an absolute path once, at start up.
export function resolveNotesFile(raw: string | undefined, home = os.homedir()): string {
  const chosen = raw?.trim() ? raw.trim() : path.join(home, '.jotter', 'notes.json')
  const file = path.resolve(chosen)
  if (path.extname(file).toLowerCase() !== '.json') {
    throw new Error('JOTTER_NOTES_FILE must point to a .json file')
  }
  return file
}

export function parsePort(raw: string | undefined): number {
  if (!raw?.trim()) return 3333
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('JOTTER_HTTP_PORT must be a whole number from 1 to 65535')
  }
  return port
}
