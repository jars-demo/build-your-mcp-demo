# Architecture

This repo holds three things that ship together: the example MCP server, the workshop chapters,
and the workshop site.

```text
server/      jotter-mcp, the MCP server (TypeScript, official SDK, zod)
workshop/    the chapters, one Markdown file each (the source of truth for the site)
frontend/    the workshop site (Next.js), deployed to Vercel with Root Directory = frontend
docs/        this file, the facilitator guide and the changelog
```

## The server

```text
Client (Claude Code, Cursor, VS Code, Inspector)
   |  JSON-RPC over stdio or Streamable HTTP
   v
main.ts        picks a transport from the --http flag
http.ts        stateless Streamable HTTP, Host and Origin checks, one server per request
server.ts      createJotterServer(store): registers everything, knows nothing about transports
tools.ts       add_note, search_notes, delete_note (safe errors via safely())
resources.ts   notes://all and the notes://{id} template
prompts.ts     summarize_notes
schemas.ts     zod input rules shared by tools, resources and prompts
store.ts       NoteStore: one JSON file, write queue, atomic rename, validated reads
config.ts      the only reader of environment variables
log.ts         JSON lines to stderr (never stdout)
```

Design rules:

- **Transports never change behaviour.** Tests use the in-memory transport, clients use stdio or
  HTTP, and all of them call `createJotterServer`.
- **The model never chooses a path.** The notes file comes from `JOTTER_NOTES_FILE`, read once.
- **Errors the model sees are short and safe.** Only `StoreError` messages pass through.
- **Logs carry ids and counts, never note text.**

## The site

- `frontend/src/lib/workshop.ts` reads `../workshop/*.md` at build time. Every chapter page is
  prerendered.
- `frontend/src/lib/code.ts` reads `../server/src/*.ts` at build time. The home page shows real
  `registerTool`, `registerResource` and `registerPrompt` calls, so it cannot drift.
- `next.config.ts` traces from the repo root and includes those files explicitly.

## Keeping docs and code in sync

The frontend unit tests check that:

- there are 11 chapters, numbered in order, each with Goal, Check it works and Exercise
- every `server/...` file a chapter mentions exists
- every code block that starts with `// server/src/<file>.ts` appears word for word in that file
- every client snippet points at the real `bin` entry

Change the server, run `npm test` in `frontend/`, and fix any chapter that no longer matches.
