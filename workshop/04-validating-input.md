# Validating input

> Describe every argument with zod, so bad input is refused with a clear message before your code runs.

**Time:** 15 minutes

## Goal

Write input schemas that guide the model, block bad data, and produce error messages the model can act on.

## The model is not a type checker

The model fills in arguments from a JSON Schema. It usually gets them right. Sometimes it sends a number as a string, an empty title, or a made-up id. Your server must never trust the arguments.

The SDK does the checking for you. You describe each argument with zod, and the SDK:

1. turns the shape into JSON Schema in the `tools/list` response, so the model knows the rules
2. parses every call against it before your handler runs
3. returns a tool error with your message if parsing fails

## Jotter's rules

```ts
// server/src/schemas.ts
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
```

A few habits worth copying:

- **Trim, then check.** `.trim().min(1)` refuses a title of only spaces.
- **Cap everything.** Lengths and counts have a maximum. A model in a loop can send a lot of text.
- **Defaults make arguments optional.** `body` and `tags` have defaults, so only `title` is required.
- **Messages are instructions.** "Give the note a title" tells the model exactly what to fix.
- **`.describe()` is documentation the model reads.** Add an example.

## Shapes you reuse

Ids and tags have strict formats:

```ts
// server/src/schemas.ts
export const NoteId = z
  .string()
  .regex(/^[a-f0-9]{8}$/, 'A note id is 8 lowercase hex characters, like 3f9a1c2e')
  .describe('The note id, as returned by add_note or search_notes')
```

A strict id format is also a security control. An id like `../../etc/passwd` is refused at the door, long before it reaches storage.

`Tag` lowercases before it checks, so `Health` and `health` are the same tag:

```ts
// server/src/schemas.ts
export const Tag = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{1,30}$/, 'A tag is 1 to 30 letters, digits or dashes')
```

## What the model sees

Call `add_note` with `{ "title": "" }` and the result is:

```json
{
  "content": [
    {
      "type": "text",
      "text": "MCP error -32602: Input validation error: Invalid arguments for tool add_note: Give the note a title at title"
    }
  ],
  "isError": true
}
```

## Check it works

```bash
npm test -- -t "refuses bad input"
```

Six bad inputs are tested in `server/test/tools.test.ts`: missing title, blank title, too long, bad tag, too many tags, and a number instead of a string.

## Exercise

Add an optional `pinned` boolean to `add_note`, defaulting to `false`. Store it on the note. Then try calling `add_note` in the Inspector with `"pinned": "yes"` and read the error. Add a test for it.
