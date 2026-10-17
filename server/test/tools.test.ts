import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { call, connect, type Harness, textOf } from './helpers.js'

let h: Harness

beforeEach(async () => {
  h = await connect()
})

afterEach(async () => {
  await h.close()
})

describe('tool list', () => {
  it('advertises the three tools with schemas and hints', async () => {
    const { tools } = await h.client.listTools()
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'add_note',
      'delete_note',
      'search_notes',
    ])
    const add = tools.find((tool) => tool.name === 'add_note')
    expect(add?.inputSchema.required).toEqual(['title'])
    expect(add?.outputSchema?.properties).toHaveProperty('id')
    const del = tools.find((tool) => tool.name === 'delete_note')
    expect(del?.annotations?.destructiveHint).toBe(true)
  })
})

describe('add_note', () => {
  it('saves a note and returns its id as text and structured content', async () => {
    const result = await call(h.client, 'add_note', {
      title: '  Call the dentist ',
      body: 'Before Friday',
      tags: ['Health'],
    })
    expect(result.isError).toBeFalsy()
    expect(textOf(result)).toBe('Saved note 00000001: Call the dentist')
    expect(result.structuredContent).toEqual({ id: '00000001', title: 'Call the dentist' })
    expect(await h.store.get('00000001')).toMatchObject({ tags: ['health'], body: 'Before Friday' })
  })

  it('fills in an empty body and no tags', async () => {
    await call(h.client, 'add_note', { title: 'Just a title' })
    expect(await h.store.get('00000001')).toMatchObject({ body: '', tags: [] })
  })

  it.each([
    [{}, 'title'],
    [{ title: '   ' }, 'Give the note a title'],
    [{ title: 'x'.repeat(121) }, 'under 120 characters'],
    [{ title: 'ok', tags: ['no spaces allowed'] }, 'A tag is 1 to 30'],
    [{ title: 'ok', tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }, 'at most 10 tags'],
    [{ title: 42 }, 'title'],
  ])('refuses bad input %j', async (args, message) => {
    const result = await call(h.client, 'add_note', args)
    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('Input validation error')
    expect(textOf(result)).toContain(message)
    expect(await h.store.list()).toEqual([])
  })
})

describe('search_notes', () => {
  beforeEach(async () => {
    await call(h.client, 'add_note', { title: 'Buy milk', tags: ['shopping'] })
    await call(h.client, 'add_note', { title: 'Book flights', body: 'Lisbon in May', tags: ['trip'] })
    await call(h.client, 'add_note', { title: 'Pack bags', tags: ['trip'] })
  })

  it('matches title, body and tags, newest first', async () => {
    expect(textOf(await call(h.client, 'search_notes', { query: 'lisbon' }))).toBe(
      '- 00000002: Book flights [trip]',
    )
    expect(textOf(await call(h.client, 'search_notes', { query: 'TRIP' }))).toBe(
      '- 00000003: Pack bags [trip]\n- 00000002: Book flights [trip]',
    )
  })

  it('filters by tag and respects the limit', async () => {
    const result = await call(h.client, 'search_notes', { tag: 'trip', limit: 1 })
    expect(textOf(result)).toBe('- 00000003: Pack bags [trip]')
  })

  it('says so when nothing matches', async () => {
    const result = await call(h.client, 'search_notes', { query: 'zebra' })
    expect(result.isError).toBeFalsy()
    expect(textOf(result)).toContain('No notes matched')
  })

  it('refuses a limit out of range', async () => {
    const result = await call(h.client, 'search_notes', { limit: 500 })
    expect(result.isError).toBe(true)
  })
})

describe('delete_note', () => {
  it('deletes a note once, then reports it missing', async () => {
    await call(h.client, 'add_note', { title: 'Temporary' })
    expect(textOf(await call(h.client, 'delete_note', { id: '00000001' }))).toBe(
      'Deleted note 00000001.',
    )
    const again = await call(h.client, 'delete_note', { id: '00000001' })
    expect(again.isError).toBe(true)
    expect(textOf(again)).toBe('No note with id 00000001.')
  })

  it('refuses an id that is not 8 hex characters', async () => {
    const result = await call(h.client, 'delete_note', { id: '../../etc/passwd' })
    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('8 lowercase hex characters')
  })
})

describe('errors stay safe', () => {
  it('shows a short message and never the full path when the file is broken', async () => {
    await writeFile(path.join(h.dir, 'notes.json'), '{ not json', 'utf8')
    const result = await call(h.client, 'search_notes', {})
    expect(result.isError).toBe(true)
    expect(textOf(result)).toBe('notes.json is not valid JSON. Fix it or move it away.')
    expect(textOf(result)).not.toContain(h.dir)
  })
})
