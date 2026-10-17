# State and storage

> Store notes in a JSON file that survives restarts, overlapping calls and crashes.

**Time:** 15 minutes

## Goal

Build a small store that never loses a write, and keep storage choices out of your MCP code.

## Keep the store separate

The tools never touch the file system. They call a `NoteStore` from `server/src/store.ts`. That keeps MCP code thin and lets you swap the JSON file for SQLite or an API later without touching a tool.

## Two calls at once

Clients can send tool calls in parallel. Picture two `add_note` calls:

1. Call A reads the file: 3 notes.
2. Call B reads the file: 3 notes.
3. A writes 4 notes. B writes 4 notes. One note is gone.

Jotter runs every write through a queue, so each one reads the latest file:

```ts
// server/src/store.ts
  #mutate<T>(change: (notes: Note[]) => { notes: Note[]; result: T }): Promise<T> {
    const run = this.#queue.then(async () => {
      const { notes, result } = change(await this.#read())
      await this.#save(notes)
      return result
    })
    // Keep the queue going even if this write failed.
    this.#queue = run.catch(() => undefined)
    return run
  }
```

## Atomic writes

If the process dies halfway through writing, you do not want half a JSON file. Write to a temp file, then rename it over the real one. A rename is atomic on the same disk:

```ts
// server/src/store.ts
  async #save(notes: Note[]): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true })
    const temp = `${this.file}.${process.pid}.tmp`
    await writeFile(temp, `${JSON.stringify({ version: 1, notes }, null, 2)}\n`, 'utf8')
    await rename(temp, this.file)
  }
```

The file has a `version` field. When the format changes one day, you can tell old files from new ones.

## Validate what you read, too

The file can be edited by hand or broken by another program. The store parses it with zod and throws a `StoreError` with a short, safe message if it does not fit. A missing file just means no notes yet.

## The file path comes from the user, not the model

```ts
// server/src/config.ts
export function resolveNotesFile(raw: string | undefined, home = os.homedir()): string {
  const chosen = raw?.trim() ? raw.trim() : path.join(home, '.jotter', 'notes.json')
  const file = path.resolve(chosen)
  if (path.extname(file).toLowerCase() !== '.json') {
    throw new Error('JOTTER_NOTES_FILE must point to a .json file')
  }
  return file
}
```

It is read once, at start up, from `JOTTER_NOTES_FILE`. No tool takes a path argument, so the model cannot point Jotter at any other file. That is least privilege in one line of design.

## Check it works

```bash
npm test -- -t NoteStore
```

One test fires 25 `add` calls at once and checks all 25 notes are saved.

## Exercise

Remove the queue (call the body of `#mutate` directly) and run the tests again. Watch the overlap test fail. Put the queue back. Then add an `updatedAt` field that `add` sets, and bump the file `version` to 2 with a migration for version 1 files.
