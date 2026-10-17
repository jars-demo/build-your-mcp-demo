// Logs go to stderr as one JSON object per line. Never write logs to stdout: in stdio mode,
// stdout carries the JSON-RPC messages, and one stray console.log breaks the client.
// Log ids, counts and durations. Never log note text.

type Level = 'info' | 'warn' | 'error'
type Field = string | number | boolean | undefined

export function log(level: Level, event: string, fields: Record<string, Field> = {}): void {
  process.stderr.write(`${JSON.stringify({ level, event, ...fields, at: new Date().toISOString() })}\n`)
}
