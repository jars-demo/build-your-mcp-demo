# Testing with an in-memory client

> Test the real server through a real MCP client, with no processes, ports or mocks.

**Time:** 20 minutes

## Goal

Write fast tests that exercise your tools, resources and prompts exactly as a client would.

## Why not just test the handlers?

You could call the handler functions directly. But then you skip the parts that break most: schema conversion, validation, error mapping, and the JSON-RPC layer. Testing through a client covers all of it, and it is still fast.

## A linked pair of transports

The SDK ships `InMemoryTransport.createLinkedPair()`. It returns two transports wired to each other. Connect the server to one and a `Client` to the other:

```ts
// server/test/helpers.ts
  const server = createJotterServer(store)
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'jotter-tests', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
```

Each test also gets its own temp folder and a store with predictable ids and times:

```ts
// server/test/helpers.ts
  const store = new NoteStore(path.join(dir, 'notes.json'), {
    // Predictable ids and times make the assertions readable.
    newId: () => (++n).toString(16).padStart(8, '0'),
    now: () => new Date(Date.UTC(2026, 0, 1, 0, n)),
  })
```

Because ids are `00000001`, `00000002` and so on, assertions can compare exact strings.

## What to test

For every tool, test the happy path and the bad input. From `server/test/tools.test.ts`:

```ts
// server/test/tools.test.ts
  it('refuses an id that is not 8 hex characters', async () => {
    const result = await call(h.client, 'delete_note', { id: '../../etc/passwd' })
    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('8 lowercase hex characters')
  })
```

A good MCP test suite also checks:

- the tool list, schemas and annotations (a renamed tool breaks every client config)
- resources: list, read, missing ids, completion
- prompts: arguments and the filled messages
- storage edge cases: missing file, broken file, overlapping writes
- that errors never leak paths or stack traces

The HTTP test in `server/test/http.test.ts` starts the real HTTP server on a random port and connects with `StreamableHTTPClientTransport`.

## Check it works

```bash
npm test
```

Every test passes in about a second. Run `npm run test:watch` while you work.

## Exercise

Write a test that adds a note, deletes it, and checks that `notes://all` no longer lists it. Then write one for the `count_notes` tool from chapter 3 if you built it.
