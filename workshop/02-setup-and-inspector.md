# Set up and meet the Inspector

> Clone the repo, run the tests, and call your first tool by hand in MCP Inspector.

**Time:** 15 minutes

## Goal

Have the server running on your machine and know how to poke it with MCP Inspector, the debugger you will use in every chapter.

## What you need

- Node.js 22 or newer (`node --version`)
- git
- Any editor

## Get the code

```bash
git clone https://github.com/jars-demo/build-your-mcp-demo.git
cd build-your-mcp-demo/server
npm ci
npm test
```

`npm ci` installs the exact versions in `package-lock.json`. Every dependency is pinned to an exact version, so the workshop works the same for everyone.

## The layout

| Path | What lives there |
| --- | --- |
| `server/src/server.ts` | Builds the server and registers everything |
| `server/src/tools.ts` | The three tools |
| `server/src/resources.ts` | The two resources |
| `server/src/prompts.ts` | The prompt |
| `server/src/schemas.ts` | Input rules |
| `server/src/store.ts` | The JSON file store |
| `server/src/main.ts` | The `jotter-mcp` command: stdio or HTTP |
| `server/test/` | Tests that use a real MCP client |

## One function builds the server

```ts
// server/src/server.ts
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
```

`McpServer` comes from the official SDK, `@modelcontextprotocol/sdk`. The `instructions` string is sent to the client during `initialize`. Many clients show it to the model, so use it to explain how your tools fit together.

## Open the Inspector

```bash
npm run inspect
```

This builds the server, then starts MCP Inspector and tells it to run `node dist/main.js`. Open the URL it prints. Then:

1. Click **Connect**. The Inspector sends `initialize`.
2. Open **Tools** and click **List Tools**. You see `add_note`, `search_notes` and `delete_note`.
3. Pick `add_note`, type a title, and click **Run Tool**.
4. Open **Resources**, list them, and read `notes://all`. Your note is there.

The Inspector also shows every JSON-RPC message in its history panel. When something is odd, look there first.

## Where do the notes go?

By default, to `~/.jotter/notes.json`. Set `JOTTER_NOTES_FILE` to use another file. The setting is read in one place, `server/src/config.ts`.

## Check it works

- `npm test` ends with every test passing.
- In the Inspector, `add_note` returns `Saved note <id>: <title>`.
- `search_notes` with an empty query lists that note.

## Exercise

Call `add_note` in the Inspector with an empty title. Read the error. Then call `delete_note` with the id `hello`. Note how both errors come back as normal tool results with `isError: true`, not as crashes. Chapter 4 explains why.
