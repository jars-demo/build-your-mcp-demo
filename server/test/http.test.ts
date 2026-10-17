import { readFile, rm } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import path from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { SERVER_INFO } from '../src/server.js'
import { createHttpServer } from '../src/http.js'
import { NoteStore } from '../src/store.js'
import { call, tempDir, textOf } from './helpers.js'

let dir: string
let base: string
let close: () => Promise<void>

beforeAll(async () => {
  dir = await tempDir()
  const http = createHttpServer(new NoteStore(path.join(dir, 'notes.json')))
  await new Promise<void>((resolve) => http.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(http.address() as AddressInfo).port}`
  close = () => new Promise((resolve) => http.close(() => resolve()))
})

afterAll(async () => {
  await close()
  await rm(dir, { recursive: true, force: true })
})

describe('Streamable HTTP', () => {
  it('serves real MCP clients, and state lives in the notes file', async () => {
    const first = new Client({ name: 'http-test', version: '0.0.0' })
    await first.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)))
    expect(first.getServerVersion()).toMatchObject(SERVER_INFO)
    await call(first, 'add_note', { title: 'Over HTTP' })
    await first.close()

    const second = new Client({ name: 'http-test', version: '0.0.0' })
    await second.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)))
    expect(textOf(await call(second, 'search_notes', { query: 'http' }))).toContain('Over HTTP')
    await second.close()
  })

  it('returns 404 off /mcp and 405 for GET', async () => {
    expect((await fetch(`${base}/`)).status).toBe(404)
    expect((await fetch(`${base}/mcp`)).status).toBe(405)
  })

  it('refuses requests from another origin (DNS rebinding)', async () => {
    const response = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
      body: '{}',
    })
    expect(response.status).toBe(403)
  })
})

describe('package', () => {
  it('reports the same version as package.json', async () => {
    const pkg = JSON.parse(await readFile(path.join(import.meta.dirname, '..', 'package.json'), 'utf8'))
    expect(SERVER_INFO.version).toBe(pkg.version)
  })
})
