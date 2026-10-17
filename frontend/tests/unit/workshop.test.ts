import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { extractRegistration, readRepoFile } from '@/lib/code'
import { CLIENTS, FEATURES, PRIMITIVES } from '@/lib/site'
import { CHAPTERS, findChapter } from '@/lib/workshop'

const REPO = path.join(process.cwd(), '..')

describe('workshop chapters', () => {
  it('has eleven chapters numbered in order', () => {
    expect(CHAPTERS.map((chapter) => chapter.number)).toEqual(
      Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(2, '0')),
    )
  })

  it.each(CHAPTERS.map((chapter) => [chapter.slug, chapter] as const))(
    '%s has a title, summary, time and the standard sections',
    (_slug, chapter) => {
      expect(chapter.title.length).toBeGreaterThan(3)
      expect(chapter.summary.length).toBeGreaterThan(10)
      expect(chapter.minutes).toBeGreaterThan(0)
      expect(chapter.body).toMatch(/^## Goal$/m)
      expect(chapter.body).toMatch(/^## Check it works$/m)
      expect(chapter.body).toMatch(/^## Exercise$/m)
    },
  )

  it('finds chapters by slug', () => {
    expect(findChapter('03-first-tool')?.title).toBe('Your first tool')
    expect(findChapter('nope')).toBeUndefined()
  })

  it('uses no em dashes', () => {
    for (const chapter of CHAPTERS)
      expect(chapter.body, chapter.slug).not.toContain(String.fromCharCode(0x2014))
  })
})

describe('the docs match the code', () => {
  it('every server file a chapter mentions exists', () => {
    const mentioned = new Set<string>()
    for (const chapter of CHAPTERS) {
      for (const match of chapter.body.matchAll(/\b(server\/[\w/.-]+\.(?:ts|json))\b/g)) {
        mentioned.add(match[1] ?? '')
      }
    }
    expect(mentioned.size).toBeGreaterThan(8)
    for (const file of mentioned) {
      expect(fs.existsSync(path.join(REPO, file)), `${file} is mentioned but missing`).toBe(true)
    }
  })

  it('every code block labelled with a server file is quoted word for word', () => {
    let checked = 0
    for (const chapter of CHAPTERS) {
      for (const match of chapter.body.matchAll(
        /```ts\n\/\/ (server\/[\w/.-]+\.ts)\n([\s\S]*?)```/g,
      )) {
        const [, file = '', quoted = ''] = match
        expect(readRepoFile(file), `${chapter.slug} quotes ${file}`).toContain(quoted.trimEnd())
        checked++
      }
    }
    expect(checked).toBeGreaterThan(15)
  })

  it('every primitive on the home page quotes real code', () => {
    for (const primitive of PRIMITIVES) {
      const code = extractRegistration(readRepoFile(primitive.file), primitive.call)
      expect(code, primitive.call).toMatch(/^server\.register\w+\(\n/)
      expect(code).toContain(`'${primitive.call}'`)
      expect(code.trimEnd().endsWith(')')).toBe(true)
    }
  })

  it('every client snippet runs the built entry point', () => {
    const entry = JSON.parse(readRepoFile('server/package.json')).bin['jotter-mcp']
    expect(entry).toBe('dist/main.js')
    for (const snippet of CLIENTS)
      expect(snippet.code, snippet.client).toContain('server/dist/main.js')
  })

  it('every feature card links to a real chapter', () => {
    for (const feature of [...FEATURES, ...PRIMITIVES]) {
      expect(findChapter(feature.chapter), feature.chapter).toBeDefined()
    }
  })
})
