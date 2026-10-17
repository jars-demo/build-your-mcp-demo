# Security and shipping

> Lock the server down, then package it so anyone can run it with one command.

**Time:** 20 minutes

## Goal

Apply the security habits every MCP server needs, and publish a versioned package with a `bin`.

## Your server runs with the user's power

A local MCP server runs as the user. If a model can be tricked into calling it, the trick runs with the user's files and keys. Treat every argument, every note and every web page your tools touch as untrusted.

## The checklist

1. **Validate every input.** Schemas with lengths, counts and formats (chapter 4). Ids have a strict pattern.
2. **Least privilege.** Offer the smallest set of tools that does the job. Jotter cannot read any file except its own, because no tool takes a path.
3. **Mark destructive tools.** `destructiveHint: true` on `delete_note` lets clients ask before running it. Say "cannot be undone" in the description.
4. **No secrets or internals in output.** Errors the model sees are short and safe:

```ts
// server/src/tools.ts
async function safely(tool: string, run: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await run()
  } catch (error) {
    if (error instanceof StoreError) return failure(error.message)
    log('error', 'tool_failed', { tool, error: error instanceof Error ? error.name : 'unknown' })
    return failure('Jotter hit an unexpected error. The server log has details.')
  }
}
```

5. **Logs carry ids, not content.** `note_added` logs the id and the tag count, never the note text.
6. **Path safety.** If you must accept paths, resolve them with `path.resolve`, then check the result is inside an allowed folder. Never join user input onto a path and trust it.
7. **Secrets come from env, never from arguments.** If your server calls an API, read the key from an environment variable the user sets in the client config. Never return it in a result.
8. **Fence untrusted text in prompts** (chapter 6), and do not let tool output change which tools run.
9. **HTTP: bind to localhost, check Host and Origin, add auth before going remote** (chapter 9).
10. **Pin dependencies.** Exact versions and a lockfile. This repo's Dependabot waits 14 days before proposing an update.

## Package it

The important parts of `server/package.json`:

```json
{
  "name": "jotter-mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": { "jotter-mcp": "dist/main.js" },
  "files": ["dist"],
  "scripts": {
    "prepublishOnly": "npm run typecheck && npm test && npm run build"
  }
}
```

- `bin` makes `npx jotter-mcp` work. The entry file starts with `#!/usr/bin/env node`.
- `files` ships only `dist`, not tests or source maps you did not mean to share.
- `prepublishOnly` refuses to publish if the types or tests fail.

Check what would ship before you publish:

```bash
npm run build
npm pack --dry-run
```

## Versioning

Use semantic versioning, and treat your tool list as your public API:

| Change | Version bump |
| --- | --- |
| Fix a bug, improve a description | Patch: 0.1.0 to 0.1.1 |
| Add a tool, resource, prompt or optional argument | Minor: 0.1.0 to 0.2.0 |
| Rename or remove a tool, or make an argument required | Major: 0.x to 1.0.0 |

Keep `SERVER_INFO.version` in `server/src/server.ts` equal to the package version. A test in `server/test/http.test.ts` checks it.

## Publish

Jotter is a workshop server, so this repo does not publish it. For your own server:

```bash
npm login
npm version minor
npm publish --access public
```

Then anyone can use it with no clone and no build:

```bash
claude mcp add my-server -- npx -y my-mcp-server
```

Pin a version in shared configs (`npx -y my-mcp-server@1.2.0`), so an update never changes a team's tools without review.

## Check it works

- `npm pack --dry-run` lists only `dist/` files, `package.json`, and the README.
- `npm test` still passes.

## Exercise

Take the list you wrote in chapter 1. Build that server: copy `server/` into a new folder, rename the package, swap `NoteStore` for your data source, and replace the tools. Keep the tests. Connect it to your client. You now have your own MCP server.
