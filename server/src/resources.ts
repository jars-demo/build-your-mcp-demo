import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'

import { NoteId } from './schemas.js'
import type { Note, NoteStore } from './store.js'

// Resources are read-only data the client can show or attach. They have URIs. The client
// decides when to read them. The model does not call them like tools.

export function registerResources(server: McpServer, store: NoteStore): void {
  server.registerResource(
    'all-notes',
    'notes://all',
    {
      title: 'All notes',
      description: 'Every note, newest first, as JSON.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(await store.list(), null, 2),
        },
      ],
    }),
  )

  server.registerResource(
    'note',
    new ResourceTemplate('notes://{id}', {
      list: async () => ({
        resources: (await store.list()).map((note) => ({
          uri: `notes://${note.id}`,
          name: note.title,
          mimeType: 'text/markdown',
        })),
      }),
      complete: {
        id: async (value) =>
          (await store.list()).map((note) => note.id).filter((id) => id.startsWith(value)),
      },
    }),
    {
      title: 'One note',
      description: 'A single note as Markdown.',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const id = NoteId.safeParse(variables.id)
      const note = id.success ? await store.get(id.data) : undefined
      if (!note) throw new McpError(ErrorCode.InvalidParams, `No note at ${uri.href}`)
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: toMarkdown(note) }] }
    },
  )
}

export function toMarkdown(note: Note): string {
  const tags = note.tags.length ? `\n\nTags: ${note.tags.join(', ')}` : ''
  return `# ${note.title}\n\n${note.body}${tags}\n\nSaved ${note.createdAt}\n`
}
