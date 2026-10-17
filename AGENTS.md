# AGENTS.md

Guidance for AI coding agents and developers working in this repository. Humans: start with
[README.md](README.md).

## What this is

Build Your Own MCP, a JARS Demo workshop. Jotter, an MCP server for notes (TypeScript, official
`@modelcontextprotocol/sdk`, zod 4), eleven Markdown chapters that teach how it is built, and a
Next.js site that renders them at <https://buildyourmcp.jishanahmed.in>.

## Map

```text
server/src/main.ts        the jotter-mcp command: stdio, or Streamable HTTP with --http
server/src/server.ts      createJotterServer(store): registers tools, resources, prompts
server/src/tools.ts       add_note, search_notes, delete_note
server/src/resources.ts   notes://all and notes://{id}
server/src/prompts.ts     summarize_notes
server/src/schemas.ts     zod input rules
server/src/store.ts       NoteStore: JSON file, write queue, atomic writes
server/src/http.ts        stateless Streamable HTTP with Host and Origin checks
server/src/config.ts      the ONLY reader of process.env
server/src/log.ts         JSON logs to stderr
server/test/              Vitest, real MCP client over InMemoryTransport and HTTP
workshop/NN-slug.md       chapters (source of truth for the site)
frontend/src/lib/         workshop.ts reads chapters, code.ts reads server source, site.ts content
frontend/tests/           unit tests (docs match code) and Playwright e2e
docs/                     architecture.md, running-the-workshop.md, CHANGELOG.md
```

## Commands

```bash
cd server && npm ci && npm run typecheck && npm test && npm run build
cd frontend && npm ci && npm run verify
cd frontend && npx next start -p 3105 & E2E_BASE_URL=http://localhost:3105 npm run test:e2e
```

## Rules

1. **Never write to stdout in the server.** stdout carries JSON-RPC in stdio mode. Use `log()`.
2. **Chapters quote real code.** A block that starts with `// server/src/<file>.ts` must match the
   file word for word. Change the code, then fix the chapter. The frontend unit tests enforce it.
3. **Chapter format:** `# Title`, `> summary`, `**Time:** N minutes`, `## Goal`, teaching
   sections, `## Check it works`, `## Exercise`.
4. **Validate every input** with zod in `schemas.ts`. Cap lengths and counts.
5. **No paths from the model.** Files come from config only. Errors shown to the model never
   contain paths or stack traces. Logs carry ids and counts, never note text.
6. **Config in one place.** Read env vars only in `server/src/config.ts`, and list each one in the
   README table.
7. **Exact versions only**, each released at least 14 days before it is added. Actions are pinned
   by commit SHA with a version comment.
8. **Mobile first.** No sideways scroll at 360px. Keep the back to top button.
9. **Writing style.** Plain English, short sentences, no em dashes anywhere.
10. **Git.** Conventional Commits, one logical change per commit. Never commit `.env` files. Never
    publish to npm or deploy unless the maintainer asks.

## Skills

Follows the [JARS Skills](https://skills.jishanahmed.in) playbooks: `env-setup`, `write-tests`,
`code-review`, `commit-style`, `changelog`, `dependency-update` and `release`.
