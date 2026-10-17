# Transports: stdio and Streamable HTTP

> Run the same server over stdio for local clients and over Streamable HTTP for remote ones.

**Time:** 20 minutes

## Goal

Know which transport to use, why stdout is sacred in stdio mode, and how to serve HTTP safely.

## Two transports, one server

The transport only moves messages. It never changes what the server can do. Jotter picks one from a flag:

```ts
// server/src/main.ts
if (process.argv.includes('--http')) {
  const http = createHttpServer(store)
  http.listen(config.httpPort, config.httpHost, () => {
    log('info', 'jotter_ready', { transport: 'http', host: config.httpHost, port: config.httpPort })
  })
} else {
  await createJotterServer(store).connect(new StdioServerTransport())
  log('info', 'jotter_ready', { transport: 'stdio' })
}
```

| | stdio | Streamable HTTP |
| --- | --- | --- |
| Who starts it | The client spawns your process | You run it, the client connects to a URL |
| Users | One | One or many |
| Best for | Local tools, files on this machine | Shared or hosted servers |
| Auth | The OS user | You must add it (OAuth, tokens) |

## stdio: never write to stdout

In stdio mode, stdout carries the JSON-RPC messages. One stray `console.log` corrupts the stream and the client disconnects with a confusing error. Log to stderr:

```ts
// server/src/log.ts
export function log(level: Level, event: string, fields: Record<string, Field> = {}): void {
  process.stderr.write(`${JSON.stringify({ level, event, ...fields, at: new Date().toISOString() })}\n`)
}
```

You can see a raw session with no client at all. Pipe in an `initialize` request:

```bash
npm run build
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"me","version":"0"}}}' | node dist/main.js
```

The reply on stdout lists the server's capabilities. The log line goes to stderr.

## Streamable HTTP, stateless

```bash
npm run start:http
```

This serves `http://127.0.0.1:3333/mcp`. Jotter runs in stateless mode: each POST gets a fresh server and transport, and the notes file is the only shared state.

```ts
// server/src/http.ts
    const server = createJotterServer(store)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
```

`sessionIdGenerator: undefined` turns sessions off. `enableJsonResponse` answers with plain JSON instead of an event stream, which is easier to debug. If you need server-to-client notifications or long-running progress, switch to stateful mode with a session id generator.

## Bind to localhost and check the Host

A local HTTP server can be reached by any web page you visit, through a trick called DNS rebinding. Jotter listens on `127.0.0.1` by default and refuses requests whose `Host` or `Origin` is not local:

```ts
// server/src/http.ts
export function isLocalRequest(req: IncomingMessage): boolean {
  const host = hostname(req.headers.host)
  if (!host || !LOCAL_HOSTS.has(host)) return false
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return LOCAL_HOSTS.has(hostname(new URL(origin).host) ?? '')
  } catch {
    return false
  }
}
```

Before you expose a server beyond your machine, add real authentication. The MCP spec uses OAuth for remote servers, and the SDK has helpers for it.

## Check it works

```bash
npm test -- -t "Streamable HTTP"
```

Then run `npm run start:http` and, in another terminal, point the Inspector at it: choose the Streamable HTTP transport and the URL `http://127.0.0.1:3333/mcp`.

## Exercise

Add a `GET /health` route to `server/src/http.ts` that returns `{ "ok": true }` without going through MCP. Keep the Host check in front of it. Add a test.
