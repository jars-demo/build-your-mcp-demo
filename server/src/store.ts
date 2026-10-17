import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { z } from 'zod'

// Notes live in one JSON file. Reads are cheap; writes go through a queue so two tool calls at
// once can never lose an update, and each write lands atomically (temp file, then rename).

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
})

export type Note = z.infer<typeof NoteSchema>

export type NewNote = Pick<Note, 'title' | 'body' | 'tags'>

const FileSchema = z.object({ version: z.literal(1), notes: z.array(NoteSchema) })

// A StoreError message is safe to show to the model and the user. It never holds a full path.
export class StoreError extends Error {
  override name = 'StoreError'
}

export type StoreOptions = {
  now?: () => Date
  newId?: () => string
}

export class NoteStore {
  readonly file: string
  readonly #now: () => Date
  readonly #newId: () => string
  #queue: Promise<unknown> = Promise.resolve()

  constructor(file: string, options: StoreOptions = {}) {
    this.file = file
    this.#now = options.now ?? (() => new Date())
    this.#newId = options.newId ?? (() => randomBytes(4).toString('hex'))
  }

  async list(): Promise<Note[]> {
    const notes = await this.#read()
    return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async get(id: string): Promise<Note | undefined> {
    return (await this.#read()).find((note) => note.id === id)
  }

  async search(query: string, options: { tag?: string; limit?: number } = {}): Promise<Note[]> {
    const needle = query.trim().toLowerCase()
    const matches = (await this.list()).filter((note) => {
      if (options.tag && !note.tags.includes(options.tag)) return false
      if (!needle) return true
      return [note.title, note.body, ...note.tags].some((text) =>
        text.toLowerCase().includes(needle),
      )
    })
    return matches.slice(0, options.limit ?? 10)
  }

  add(input: NewNote): Promise<Note> {
    return this.#mutate((notes) => {
      let id = this.#newId()
      while (notes.some((note) => note.id === id)) id = this.#newId()
      const note: Note = { id, ...input, createdAt: this.#now().toISOString() }
      return { notes: [...notes, note], result: note }
    })
  }

  delete(id: string): Promise<boolean> {
    return this.#mutate((notes) => {
      const kept = notes.filter((note) => note.id !== id)
      return { notes: kept, result: kept.length !== notes.length }
    })
  }

  async #read(): Promise<Note[]> {
    let raw: string
    try {
      raw = await readFile(this.file, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw new StoreError('Jotter could not read its notes file.')
    }
    let data: unknown
    try {
      data = JSON.parse(raw)
    } catch {
      throw new StoreError(`${path.basename(this.file)} is not valid JSON. Fix it or move it away.`)
    }
    const parsed = FileSchema.safeParse(data)
    if (!parsed.success) {
      throw new StoreError(`${path.basename(this.file)} is not a Jotter notes file.`)
    }
    return parsed.data.notes
  }

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

  async #save(notes: Note[]): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true })
    const temp = `${this.file}.${process.pid}.tmp`
    await writeFile(temp, `${JSON.stringify({ version: 1, notes }, null, 2)}\n`, 'utf8')
    await rename(temp, this.file)
  }
}
