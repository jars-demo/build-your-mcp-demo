import { z } from 'zod'

// Input rules for every tool, resource and prompt. The SDK turns these into JSON Schema for the
// client, and checks every call against them before your handler runs.

export const NoteId = z
  .string()
  .regex(/^[a-f0-9]{8}$/, 'A note id is 8 lowercase hex characters, like 3f9a1c2e')
  .describe('The note id, as returned by add_note or search_notes')

export const Tag = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{1,30}$/, 'A tag is 1 to 30 letters, digits or dashes')

export const addNoteInput = {
  title: z
    .string()
    .trim()
    .min(1, 'Give the note a title')
    .max(120, 'Keep the title under 120 characters')
    .describe('A short title, like "Call the dentist"'),
  body: z
    .string()
    .max(10_000, 'Keep the note under 10,000 characters')
    .default('')
    .describe('The note itself, in plain text or Markdown'),
  tags: z.array(Tag).max(10, 'Use at most 10 tags').default([]).describe('Optional tags'),
}

export const searchNotesInput = {
  query: z
    .string()
    .trim()
    .max(200)
    .default('')
    .describe('Words to look for in titles, bodies and tags. Empty matches every note.'),
  tag: Tag.optional().describe('Only return notes with this tag'),
  limit: z.number().int().min(1).max(50).default(10).describe('How many notes to return'),
}

export const deleteNoteInput = {
  id: NoteId,
}
