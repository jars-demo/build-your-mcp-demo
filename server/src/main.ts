#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { loadConfig } from './config.js'
import { createHttpServer } from './http.js'
import { log } from './log.js'
import { createJotterServer } from './server.js'
import { NoteStore } from './store.js'

// The entry point behind the jotter-mcp command.
//   jotter-mcp          talk MCP over stdin and stdout (what most clients spawn)
//   jotter-mcp --http   serve Streamable HTTP on http://127.0.0.1:3333/mcp

const config = loadConfig()
const store = new NoteStore(config.notesFile)

if (process.argv.includes('--http')) {
  const http = createHttpServer(store)
  http.listen(config.httpPort, config.httpHost, () => {
    log('info', 'jotter_ready', { transport: 'http', host: config.httpHost, port: config.httpPort })
  })
} else {
  await createJotterServer(store).connect(new StdioServerTransport())
  log('info', 'jotter_ready', { transport: 'stdio' })
}
