# Connect to Claude Code, Cursor and VS Code

> Plug your server into real clients and watch a model use your tools.

**Time:** 15 minutes

## Goal

Have Jotter running inside at least one AI client, and know how to debug a server that will not connect.

## Build first

Clients run the compiled JavaScript, so build once:

```bash
cd server
npm run build
```

Every config below needs the absolute path to `server/dist/main.js`. On Windows, use forward slashes or doubled backslashes in JSON.

## Claude Code

```bash
claude mcp add jotter -e JOTTER_NOTES_FILE=$HOME/notes.json -- node /path/to/build-your-mcp-demo/server/dist/main.js
```

Everything after `--` is the command Claude Code spawns. `-e` sets an environment variable. Add `--scope project` to save it in `.mcp.json` so your team shares it, or `--scope user` for every project.

For the HTTP server (`npm run start:http` in another terminal):

```bash
claude mcp add --transport http jotter http://127.0.0.1:3333/mcp
```

Check it with `claude mcp list`, or `/mcp` inside a session.

## Claude Desktop

Edit `claude_desktop_config.json` (Settings, then Developer, then Edit Config) and restart the app:

```json
{
  "mcpServers": {
    "jotter": {
      "command": "node",
      "args": ["/path/to/build-your-mcp-demo/server/dist/main.js"],
      "env": { "JOTTER_NOTES_FILE": "/path/to/notes.json" }
    }
  }
}
```

## Cursor

Create `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "jotter": {
      "command": "node",
      "args": ["/path/to/build-your-mcp-demo/server/dist/main.js"],
      "env": { "JOTTER_NOTES_FILE": "/path/to/notes.json" }
    }
  }
}
```

## VS Code

Create `.vscode/mcp.json`. Note the top-level key is `servers`, and each server has a `type`:

```json
{
  "servers": {
    "jotter": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/build-your-mcp-demo/server/dist/main.js"],
      "env": { "JOTTER_NOTES_FILE": "/path/to/notes.json" }
    }
  }
}
```

Open Copilot Chat in agent mode and pick the Jotter tools from the tools menu.

## Try it

Ask: "Make a note to book flights to Lisbon, tag it trip." Then: "What trip notes do I have?" Then: "Delete that note." The client should ask you to confirm the delete, because the tool is marked `destructiveHint: true`.

## When it will not connect

| Symptom | Likely cause |
| --- | --- |
| Server shows as failed straight away | Wrong path, or you did not run `npm run build` |
| Connects, then drops on the first call | Something wrote to stdout. Log to stderr. |
| `node` not found | The client has a smaller PATH. Use the full path to node. |
| Tools missing after a change | Restart the server in the client. Lists are read at connect time. |
| Works in Inspector, not in the client | Compare the env vars. The client does not load your shell profile. |

Claude Desktop and VS Code show server logs (stderr) in their MCP output panels. Read them first.

## Check it works

In your client, ask the model to list your notes. It calls `search_notes` and you see the result. `notes.json` on disk changes when you add one.

## Exercise

Connect the same server to two clients at once, pointing at the same `JOTTER_NOTES_FILE`. Add a note in one and find it from the other.
