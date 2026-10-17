# jotter-mcp

Jotter is a small MCP (Model Context Protocol) server for notes. It stores them in one JSON file
on your machine. It is the example server for the
[Build Your Own MCP](https://buildyourmcp.jishanahmed.in) workshop.

## What it offers

| Kind | Name | What it does |
| --- | --- | --- |
| Tool | `add_note` | Save a note with a title, optional body and tags |
| Tool | `search_notes` | Find notes by text or tag, newest first (read only) |
| Tool | `delete_note` | Delete one note by id (destructive) |
| Resource | `notes://all` | Every note as JSON |
| Resource template | `notes://{id}` | One note as Markdown, with id completion |
| Prompt | `summarize_notes` | Summarize all notes, or one tag |

## Run it

```bash
npm ci
npm run build
npm start             # stdio
npm run start:http    # Streamable HTTP on http://127.0.0.1:3333/mcp
npm run inspect       # open MCP Inspector against the stdio server
```

## Settings

| Variable | Default | Meaning |
| --- | --- | --- |
| `JOTTER_NOTES_FILE` | `~/.jotter/notes.json` | Where notes are stored. Must end in `.json`. |
| `JOTTER_HTTP_HOST` | `127.0.0.1` | Host for `--http` mode |
| `JOTTER_HTTP_PORT` | `3333` | Port for `--http` mode |

## Develop

```bash
npm run typecheck
npm test
```

Tests connect a real MCP client to the server through the SDK's in-memory transport, and start
the HTTP server on a random port.

## License

MIT
