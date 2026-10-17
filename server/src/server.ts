import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { registerPrompts } from './prompts.js'
import { registerResources } from './resources.js'
import type { NoteStore } from './store.js'
import { registerTools } from './tools.js'

export const SERVER_INFO = { name: 'jotter', version: '0.1.0' } as const

// One function builds the whole server. Transports (stdio, HTTP, in-memory for tests) only
// decide how messages travel. They never change what the server can do.
export function createJotterServer(store: NoteStore): McpServer {
  const server = new McpServer(SERVER_INFO, {
    instructions:
      'Jotter keeps short notes for the user. Use search_notes before add_note to avoid ' +
      'duplicates, and confirm with the user before delete_note.',
  })
  registerTools(server, store)
  registerResources(server, store)
  registerPrompts(server, store)
  return server
}
