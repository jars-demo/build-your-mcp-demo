import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { createJotterServer } from '../src/server.js'
import { NoteStore } from '../src/store.js'

// Each test gets its own temp folder, a real NoteStore, and a real MCP client wired to the
// server through a linked pair of in-memory transports. No processes, no ports.

export type Harness = {
  client: Client
  store: NoteStore
  dir: string
  close: () => Promise<void>
}

export async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'jotter-'))
}

export async function connect(): Promise<Harness> {
  const dir = await tempDir()
  let n = 0
  const store = new NoteStore(path.join(dir, 'notes.json'), {
    // Predictable ids and times make the assertions readable.
    newId: () => (++n).toString(16).padStart(8, '0'),
    now: () => new Date(Date.UTC(2026, 0, 1, 0, n)),
  })
  const server = createJotterServer(store)
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'jotter-tests', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return {
    client,
    store,
    dir,
    close: async () => {
      await client.close()
      await server.close()
      await rm(dir, { recursive: true, force: true })
    },
  }
}

export async function call(
  client: Client,
  name: string,
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  return (await client.callTool({ name, arguments: args })) as CallToolResult
}

export function textOf(result: CallToolResult): string {
  return result.content.map((part) => (part.type === 'text' ? part.text : '')).join('\n')
}
