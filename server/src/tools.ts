import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

import { log } from './log.js'
import { addNoteInput, deleteNoteInput, searchNotesInput } from './schemas.js'
import { type Note, type NoteStore, StoreError } from './store.js'

// Tools are actions the model can take. Each one has a name, a description the model reads, an
// input schema the SDK enforces, and a handler that returns content.

export function registerTools(server: McpServer, store: NoteStore): void {
  server.registerTool(
    'add_note',
    {
      title: 'Add a note',
      description: 'Save a new note with a title, an optional body and optional tags.',
      inputSchema: addNoteInput,
      outputSchema: { id: z.string(), title: z.string() },
    },
    ({ title, body, tags }) =>
      safely('add_note', async () => {
        const note = await store.add({ title, body, tags })
        log('info', 'note_added', { id: note.id, tags: note.tags.length })
        return {
          content: [{ type: 'text', text: `Saved note ${note.id}: ${note.title}` }],
          structuredContent: { id: note.id, title: note.title },
        }
      }),
  )

  server.registerTool(
    'search_notes',
    {
      title: 'Search notes',
      description:
        'Find notes whose title, body or tags contain the query. Newest first. ' +
        'Use an empty query to list recent notes.',
      inputSchema: searchNotesInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ query, tag, limit }) =>
      safely('search_notes', async () => {
        const notes = await store.search(query, { tag, limit })
        const text = notes.length
          ? notes.map(describe).join('\n')
          : 'No notes matched. Try a shorter query or no tag.'
        return { content: [{ type: 'text', text }] }
      }),
  )

  server.registerTool(
    'delete_note',
    {
      title: 'Delete a note',
      description: 'Delete one note by id. This cannot be undone.',
      inputSchema: deleteNoteInput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    ({ id }) =>
      safely('delete_note', async () => {
        if (!(await store.delete(id))) return failure(`No note with id ${id}.`)
        log('info', 'note_deleted', { id })
        return { content: [{ type: 'text', text: `Deleted note ${id}.` }] }
      }),
  )
}

function describe(note: Note): string {
  const tags = note.tags.length ? ` [${note.tags.join(', ')}]` : ''
  return `- ${note.id}: ${note.title}${tags}`
}

function failure(text: string): CallToolResult {
  return { content: [{ type: 'text', text }], isError: true }
}

// A tool error is a normal result with isError set, so the model can read it and try again.
// Only StoreError messages are shown. Anything unexpected becomes a generic message, so a stack
// trace or a file path never reaches the model.
async function safely(tool: string, run: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await run()
  } catch (error) {
    if (error instanceof StoreError) return failure(error.message)
    log('error', 'tool_failed', { tool, error: error instanceof Error ? error.name : 'unknown' })
    return failure('Jotter hit an unexpected error. The server log has details.')
  }
}
