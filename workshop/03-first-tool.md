# Your first tool

> Register a tool with a name, a description and a handler, and return content the model can read.

**Time:** 20 minutes

## Goal

Understand every part of a tool registration, and how a tool reports success and failure.

## Anatomy of a tool

Open `server/src/tools.ts`. Here is `search_notes`:

```ts
// server/src/tools.ts
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
```

Each part has a job:

- **name** (`search_notes`) is what the model calls. Use snake_case verbs. Keep it stable: renaming breaks saved configs.
- **title** is for humans, in client menus.
- **description** is for the model. It is the most important line you write. Say what it does, when to use it, and what comes back.
- **inputSchema** lists the arguments. The SDK turns it into JSON Schema and checks every call. Chapter 4 covers it.
- **annotations** are hints for the client. `readOnlyHint` says the tool changes nothing. Clients may skip the confirmation step for read-only tools.
- **the handler** gets typed, validated arguments and returns a result.

## What a tool returns

A result has a `content` array. Text is the most common part. Images, audio and links to resources are also allowed.

A tool can also return `structuredContent`, typed JSON for programs, if it declares an `outputSchema`. `add_note` does:

```ts
// server/src/tools.ts
      inputSchema: addNoteInput,
      outputSchema: { id: z.string(), title: z.string() },
```

The SDK checks that the structured content matches the schema before it leaves the server.

## Errors are results too

If a tool fails, return a result with `isError: true`. The model reads the message and can try again with better arguments. A thrown protocol error, by contrast, often just shows the user a red box.

```ts
// server/src/tools.ts
function failure(text: string): CallToolResult {
  return { content: [{ type: 'text', text }], isError: true }
}
```

`delete_note` uses it when the id does not exist:

```ts
// server/src/tools.ts
        if (!(await store.delete(id))) return failure(`No note with id ${id}.`)
```

Every handler runs inside `safely`, which turns unexpected errors into a generic message. Chapter 11 explains why that matters.

## Write good descriptions

The model only sees names, descriptions and schemas. Compare:

- Weak: `"Searches."`
- Strong: `"Find notes whose title, body or tags contain the query. Newest first. Use an empty query to list recent notes."`

The strong one tells the model when to call it and how to list everything. Fewer wrong calls, fewer retries.

## Check it works

```bash
npm test -- -t search_notes
```

Then in the Inspector, add two notes with the tag `trip` and call `search_notes` with `{ "tag": "trip", "limit": 1 }`. You get the newest one only.

## Exercise

Add a fourth tool, `count_notes`, that returns how many notes exist. It takes no input: leave out `inputSchema`, and the handler receives only the `extra` argument. Mark it `readOnlyHint: true`. Add a test in `server/test/tools.test.ts` and update the tool list test.
