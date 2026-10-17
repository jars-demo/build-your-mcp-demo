import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { parsePort, resolveNotesFile } from '../src/config.js'
import { NoteStore, StoreError } from '../src/store.js'
import { tempDir } from './helpers.js'

let dir: string

beforeEach(async () => {
  dir = await tempDir()
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('NoteStore', () => {
  it('treats a missing file as no notes, and creates folders on first write', async () => {
    const store = new NoteStore(path.join(dir, 'deep', 'er', 'notes.json'))
    expect(await store.list()).toEqual([])
    await store.add({ title: 'First', body: '', tags: [] })
    const saved = JSON.parse(await readFile(store.file, 'utf8')) as { version: number }
    expect(saved.version).toBe(1)
  })

  it('never loses a write when calls overlap', async () => {
    const store = new NoteStore(path.join(dir, 'notes.json'))
    await Promise.all(
      Array.from({ length: 25 }, (_, i) => store.add({ title: `Note ${i}`, body: '', tags: [] })),
    )
    expect(await store.list()).toHaveLength(25)
  })

  it('picks a new id when the generator repeats itself', async () => {
    const ids = ['aaaaaaaa', 'aaaaaaaa', 'bbbbbbbb']
    const store = new NoteStore(path.join(dir, 'notes.json'), { newId: () => ids.shift() ?? 'x' })
    await store.add({ title: 'One', body: '', tags: [] })
    const second = await store.add({ title: 'Two', body: '', tags: [] })
    expect(second.id).toBe('bbbbbbbb')
  })

  it('refuses a file that is JSON but not a notes file', async () => {
    const file = path.join(dir, 'notes.json')
    await writeFile(file, JSON.stringify({ notes: 'nope' }), 'utf8')
    await expect(new NoteStore(file).list()).rejects.toThrow(StoreError)
  })

  it('keeps working after a failed write', async () => {
    const file = path.join(dir, 'notes.json')
    await writeFile(file, '[', 'utf8')
    const store = new NoteStore(file)
    await expect(store.add({ title: 'x', body: '', tags: [] })).rejects.toThrow(StoreError)
    await rm(file)
    await expect(store.add({ title: 'y', body: '', tags: [] })).resolves.toMatchObject({
      title: 'y',
    })
  })
})

describe('config', () => {
  it('defaults the notes file to ~/.jotter/notes.json', () => {
    expect(resolveNotesFile(undefined, '/home/ada')).toBe(
      path.resolve('/home/ada', '.jotter', 'notes.json'),
    )
  })

  it('resolves a relative path and refuses anything but .json', () => {
    expect(path.isAbsolute(resolveNotesFile('my-notes.json'))).toBe(true)
    expect(() => resolveNotesFile('/etc/passwd')).toThrow(/\.json/)
  })

  it('validates the port', () => {
    expect(parsePort(undefined)).toBe(3333)
    expect(parsePort('8080')).toBe(8080)
    expect(() => parsePort('99999')).toThrow()
    expect(() => parsePort('abc')).toThrow()
  })
})
