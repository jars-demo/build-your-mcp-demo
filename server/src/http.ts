import { createServer, type IncomingMessage, type Server } from 'node:http'

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { log } from './log.js'
import { createJotterServer } from './server.js'
import type { NoteStore } from './store.js'

// Streamable HTTP in stateless mode: every POST to /mcp gets a fresh server and transport, so
// there are no sessions to track. The notes file is the only shared state.

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]'])

export function createHttpServer(store: NoteStore): Server {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found. MCP lives at /mcp.')
      return
    }
    if (!isLocalRequest(req)) {
      res.writeHead(403, { 'content-type': 'text/plain' }).end('Only local clients may connect.')
      return
    }
    if (req.method !== 'POST') {
      res.writeHead(405, { allow: 'POST', 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'This server is stateless. Use POST.' },
          id: null,
        }),
      )
      return
    }

    const started = Date.now()
    const server = createJotterServer(store)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    res.on('close', () => {
      void transport.close()
      void server.close()
      log('info', 'http_request', { status: res.statusCode, ms: Date.now() - started })
    })
    try {
      await server.connect(transport)
      await transport.handleRequest(req, res)
    } catch (error) {
      log('error', 'http_failed', { error: error instanceof Error ? error.name : 'unknown' })
      if (!res.headersSent) res.writeHead(500).end()
    }
  })
}

// DNS rebinding defence: a web page on another site can make your browser call
// http://127.0.0.1, but it cannot fake the Host header or hide its Origin.
export function isLocalRequest(req: IncomingMessage): boolean {
  const host = hostname(req.headers.host)
  if (!host || !LOCAL_HOSTS.has(host)) return false
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return LOCAL_HOSTS.has(hostname(new URL(origin).host) ?? '')
  } catch {
    return false
  }
}

function hostname(host: string | undefined): string | undefined {
  if (!host) return undefined
  if (host.startsWith('[')) return host.slice(0, host.indexOf(']') + 1)
  return host.split(':')[0]?.toLowerCase()
}
