// Site-wide content. Everything here mirrors the real server in ../server; the unit tests check it.

export const REPO_URL = 'https://github.com/jars-demo/build-your-mcp-demo'
export const SITE_URL = 'https://buildyourmcp.jishanahmed.in'

export type Feature = { title: string; body: string; chapter: string }

export const FEATURES: Feature[] = [
  {
    title: 'Three tools',
    body: 'add_note, search_notes and delete_note. Each has a schema, a description and safe errors.',
    chapter: '03-first-tool',
  },
  {
    title: 'Input the model cannot break',
    body: 'zod schemas become JSON Schema for the client and are checked before your code runs.',
    chapter: '04-validating-input',
  },
  {
    title: 'Resources and a prompt',
    body: 'notes://all, notes://{id} with completion, and a summarize_notes prompt for the slash menu.',
    chapter: '05-resources',
  },
  {
    title: 'Real storage',
    body: 'A JSON file with atomic writes and a write queue, so overlapping calls never lose a note.',
    chapter: '07-state-and-storage',
  },
  {
    title: 'Tests without processes',
    body: 'A real MCP client talks to the server through an in-memory transport. No ports, no mocks.',
    chapter: '08-testing',
  },
  {
    title: 'Two transports, one server',
    body: 'stdio for local clients and Streamable HTTP for remote ones, from the same server code.',
    chapter: '09-transports',
  },
]

export type Primitive = {
  name: string
  who: string
  body: string
  file: string
  call: string
  chapter: string
}

// `call` names the registerTool, registerResource or registerPrompt call quoted from `file`.
export const PRIMITIVES: Primitive[] = [
  {
    name: 'Tools',
    who: 'The model decides',
    body: 'Actions with side effects. The model reads the description and picks the tool.',
    file: 'server/src/tools.ts',
    call: 'delete_note',
    chapter: '03-first-tool',
  },
  {
    name: 'Resources',
    who: 'The app decides',
    body: 'Read-only data with a URI. The client lists them and attaches what the user picks.',
    file: 'server/src/resources.ts',
    call: 'all-notes',
    chapter: '05-resources',
  },
  {
    name: 'Prompts',
    who: 'The user decides',
    body: 'Templates the user runs, often from a slash menu. The server fills in real data.',
    file: 'server/src/prompts.ts',
    call: 'summarize_notes',
    chapter: '06-prompts',
  },
]

export type Exchange = { label: string; method: string; request: string; response: string }

// Real requests and real responses from Jotter, captured with the SDK client over stdio.
// Only the JSON-RPC envelope (jsonrpc, id) is left out.
export const EXCHANGES: Exchange[] = [
  {
    label: 'Call a tool',
    method: 'tools/call',
    request: `{
  "name": "add_note",
  "arguments": {
    "title": "Book flights",
    "body": "Lisbon in May",
    "tags": ["trip"]
  }
}`,
    response: `{
  "content": [
    { "type": "text", "text": "Saved note 01721013: Book flights" }
  ],
  "structuredContent": { "id": "01721013", "title": "Book flights" }
}`,
  },
  {
    label: 'Read a resource',
    method: 'resources/read',
    request: `{ "uri": "notes://01721013" }`,
    response: `{
  "contents": [
    {
      "uri": "notes://01721013",
      "mimeType": "text/markdown",
      "text": "# Book flights\\n\\nLisbon in May\\n\\nTags: trip\\n\\n..."
    }
  ]
}`,
  },
  {
    label: 'Get a prompt',
    method: 'prompts/get',
    request: `{ "name": "summarize_notes", "arguments": { "tag": "trip" } }`,
    response: `{
  "description": "Summary of my notes tagged \\"trip\\"",
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "Summarize my notes tagged \\"trip\\" in five ..."
      }
    }
  ]
}`,
  },
  {
    label: 'Bad input',
    method: 'tools/call',
    request: `{ "name": "add_note", "arguments": { "title": "" } }`,
    response: `{
  "content": [
    {
      "type": "text",
      "text": "MCP error -32602: Input validation error: Invalid arguments for tool add_note: Give the note a title at title"
    }
  ],
  "isError": true
}`,
  },
]

export const QUICKSTART = `git clone https://github.com/jars-demo/build-your-mcp-demo.git
cd build-your-mcp-demo/server
npm ci
npm test
npm run inspect   # builds, then opens MCP Inspector in your browser`

export type ClientSnippet = { client: string; where: string; lang: string; code: string }

// Jotter is not on npm, so every client runs your local build. Replace the path with yours.
export const CLIENTS: ClientSnippet[] = [
  {
    client: 'Claude Code',
    where: 'Run in your terminal',
    lang: 'bash',
    code: `claude mcp add jotter -e JOTTER_NOTES_FILE=$HOME/notes.json -- node /path/to/build-your-mcp-demo/server/dist/main.js

# or, with the HTTP server running (npm run start:http)
claude mcp add --transport http jotter http://127.0.0.1:3333/mcp`,
  },
  {
    client: 'Claude Desktop',
    where: 'claude_desktop_config.json',
    lang: 'json',
    code: `{
  "mcpServers": {
    "jotter": {
      "command": "node",
      "args": ["/path/to/build-your-mcp-demo/server/dist/main.js"],
      "env": { "JOTTER_NOTES_FILE": "/path/to/notes.json" }
    }
  }
}`,
  },
  {
    client: 'Cursor',
    where: '.cursor/mcp.json',
    lang: 'json',
    code: `{
  "mcpServers": {
    "jotter": {
      "command": "node",
      "args": ["/path/to/build-your-mcp-demo/server/dist/main.js"],
      "env": { "JOTTER_NOTES_FILE": "/path/to/notes.json" }
    }
  }
}`,
  },
  {
    client: 'VS Code',
    where: '.vscode/mcp.json',
    lang: 'json',
    code: `{
  "servers": {
    "jotter": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/build-your-mcp-demo/server/dist/main.js"],
      "env": { "JOTTER_NOTES_FILE": "/path/to/notes.json" }
    }
  }
}`,
  },
]

export type Workshop = { name: string; href: string; blurb: string }

export const MORE: Workshop[] = [
  { name: 'TypeScript', href: 'https://typescript.jishanahmed.in', blurb: 'Types that pay rent' },
  { name: 'FastAPI', href: 'https://fastapi.jishanahmed.in', blurb: 'Build a real Python API' },
  { name: 'gRPC', href: 'https://grpc.jishanahmed.in', blurb: 'Contracts and streaming' },
  { name: 'OpenTelemetry', href: 'https://otel.jishanahmed.in', blurb: 'Traces, metrics, logs' },
  { name: 'Local AI', href: 'https://local-ai.jishanahmed.in', blurb: 'Models on your machine' },
  { name: 'MCP vs API', href: 'https://mcp-vs-api.jishanahmed.in', blurb: 'When to use which' },
  { name: 'Cognee', href: 'https://cognee.jishanahmed.in', blurb: 'Memory for agents' },
  { name: 'FalkorDB', href: 'https://falkordb.jishanahmed.in', blurb: 'Graphs for AI apps' },
  {
    name: 'GitHub Actions',
    href: 'https://githubactions.jishanahmed.in',
    blurb: 'CI you can trust',
  },
  { name: 'JARS Skills', href: 'https://skills.jishanahmed.in', blurb: 'Playbooks for agents' },
]
