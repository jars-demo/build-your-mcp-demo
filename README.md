# Build Your Own MCP

A hands-on workshop: build **Jotter**, a small, real MCP (Model Context Protocol) server in
TypeScript, then test it, debug it, connect it to Claude Code, Claude Desktop, Cursor and VS
Code, and get it ready to publish.

**Workshop site:** <https://buildyourmcp.jishanahmed.in>

## What you learn

- What MCP is, and when it is the right tool
- The three primitives: tools, resources and prompts
- Input validation with zod, and errors a model can act on
- Safe local storage: a write queue and atomic writes
- Testing with a real MCP client over an in-memory transport
- Debugging with MCP Inspector
- stdio and Streamable HTTP transports
- Connecting to Claude Code, Claude Desktop, Cursor and VS Code
- Security habits and publishing to npm with a `bin`

## Quick start

You need Node.js 22 and git.

```bash
git clone https://github.com/jars-demo/build-your-mcp-demo.git
cd build-your-mcp-demo/server
npm ci
npm test
npm run inspect   # builds, then opens MCP Inspector
```

Connect it to Claude Code:

```bash
npm run build
claude mcp add jotter -e JOTTER_NOTES_FILE=$HOME/notes.json -- node /absolute/path/to/server/dist/main.js
```

Configs for the other clients are in [chapter 10](workshop/10-connect-clients.md).

## Chapters

| # | Chapter | Time |
| --- | --- | --- |
| 01 | [Why MCP, and what we build](workshop/01-why-mcp.md) | 10 min |
| 02 | [Set up and meet the Inspector](workshop/02-setup-and-inspector.md) | 15 min |
| 03 | [Your first tool](workshop/03-first-tool.md) | 20 min |
| 04 | [Validating input](workshop/04-validating-input.md) | 15 min |
| 05 | [Resources](workshop/05-resources.md) | 15 min |
| 06 | [Prompts](workshop/06-prompts.md) | 10 min |
| 07 | [State and storage](workshop/07-state-and-storage.md) | 15 min |
| 08 | [Testing with an in-memory client](workshop/08-testing.md) | 20 min |
| 09 | [Transports: stdio and Streamable HTTP](workshop/09-transports.md) | 20 min |
| 10 | [Connect to Claude Code, Cursor and VS Code](workshop/10-connect-clients.md) | 15 min |
| 11 | [Security and shipping](workshop/11-security-and-shipping.md) | 20 min |

## Repo layout

```text
server/      jotter-mcp, the MCP server (own package.json, src/, test/)
frontend/    the workshop site (Next.js)
workshop/    the chapters, one Markdown file each
docs/        architecture, facilitator guide, changelog
```

## Develop

```bash
# server
cd server && npm ci && npm run typecheck && npm test && npm run build

# site (reads ../workshop and ../server/src at build time)
cd frontend && npm ci && npm run dev
npm run verify                                   # lint, types, format, unit tests, build
E2E_BASE_URL=http://localhost:3105 npm run test:e2e   # with `npx next start -p 3105` running
```

## Deploy the site

Import the repo in Vercel and set **Root Directory** to `frontend`. Keep "Include files outside
the root directory" on, because the site reads `workshop/` and `server/src/` at build time.

## Server settings

| Variable | Default | Meaning |
| --- | --- | --- |
| `JOTTER_NOTES_FILE` | `~/.jotter/notes.json` | Where notes are stored. Must end in `.json`. |
| `JOTTER_HTTP_HOST` | `127.0.0.1` | Host for `--http` mode |
| `JOTTER_HTTP_PORT` | `3333` | Port for `--http` mode |

## More from JARS Demo

[TypeScript](https://typescript.jishanahmed.in) ·
[FastAPI](https://fastapi.jishanahmed.in) ·
[gRPC](https://grpc.jishanahmed.in) ·
[OpenTelemetry](https://otel.jishanahmed.in) ·
[Local AI](https://local-ai.jishanahmed.in) ·
[MCP vs API](https://mcp-vs-api.jishanahmed.in) ·
[Cognee](https://cognee.jishanahmed.in) ·
[FalkorDB](https://falkordb.jishanahmed.in) ·
[GitHub Actions](https://githubactions.jishanahmed.in) ·
[JARS Skills](https://skills.jishanahmed.in)

## License

[MIT](LICENSE)
