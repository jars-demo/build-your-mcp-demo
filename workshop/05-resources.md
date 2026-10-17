# Resources

> Expose read-only data at a URI, with a static resource for all notes and a template for one note.

**Time:** 15 minutes

## Goal

Know when to use a resource instead of a tool, and register both a fixed resource and a URI template with listing and completion.

## Tool or resource?

A tool is something the model chooses to do. A resource is data the app or user chooses to attach. If your client has an "attach" or "@" menu, resources show up there.

Rule of thumb: if reading it has no side effects and a person might want to pick it, make it a resource. If the model needs to fetch it mid-task, a read-only tool like `search_notes` is the better fit. Many servers offer both.

## A fixed resource

```ts
// server/src/resources.ts
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
```

The URI scheme (`notes://`) is yours to choose. Pick one that is short and unlikely to clash.

## A template for many resources

You cannot register one resource per note at start up, because notes come and go. A `ResourceTemplate` matches a pattern instead:

```ts
// server/src/resources.ts
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
```

- `list` lets `resources/list` show one entry per note, so users can browse them.
- `complete` powers autocomplete when a user types part of an id.

## Reading one note

The read callback gets the URI and the matched variables. Treat the variables like any other untrusted input:

```ts
// server/src/resources.ts
    async (uri, variables) => {
      const id = NoteId.safeParse(variables.id)
      const note = id.success ? await store.get(id.data) : undefined
      if (!note) throw new McpError(ErrorCode.InvalidParams, `No note at ${uri.href}`)
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: toMarkdown(note) }] }
    },
```

Unlike tools, a missing resource is a protocol error. There is no model in the loop to retry, so a clear error for the app is right.

## Check it works

```bash
npm test -- -t resources
```

In the Inspector, open **Resources**. You see `notes://all` and one entry per note. Open **Resource Templates**, type the start of an id, and watch it complete.

## Exercise

Add a third resource, `notes://tags`, that returns every tag with its count as JSON, like `{ "trip": 2, "health": 1 }`. Register it before the template, and add a test that reads it.
