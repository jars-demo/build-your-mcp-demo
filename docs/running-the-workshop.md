# Running the workshop

A guide for facilitators. The chapters work for self-study too.

## Formats

| Format | Length | Chapters | Notes |
| --- | --- | --- | --- |
| Lightning talk | 20 minutes | 1, then demo 3, 5, 6 and 10 | Live-code one tool, connect it to Claude Code |
| Half day | 3 hours | 1 to 10 | One break after chapter 6 |
| Full day | 6 hours | All 11, plus the chapter 11 exercise | Attendees leave with their own server |
| Self paced | About 3 hours | All 11 | Start at the site, check each chapter's "Check it works" |

## Before the day

- Ask attendees to install Node.js 22 and git, and to run `npm ci` and `npm test` in `server/`
  at home. Most setup trouble is caught that way.
- Have at least one MCP client ready: Claude Code, Claude Desktop, Cursor or VS Code.
- Run `npm run inspect` on the venue network once. The Inspector downloads on first use.
- Open the site on the projector: <https://buildyourmcp.jishanahmed.in>.

## Moments that land

- **Chapter 2:** calling `add_note` by hand in the Inspector, then reading the JSON-RPC history.
  People see that MCP is just messages.
- **Chapter 3:** rewriting a weak tool description and watching the model pick the tool
  correctly. Description quality is the biggest lever.
- **Chapter 4:** sending `"title": ""` and reading the error the model gets back.
- **Chapter 7:** removing the write queue and watching the overlap test fail.
- **Chapter 9:** adding one `console.log` to the stdio server and watching the client break.
- **Chapter 10:** asking the model to delete a note and seeing the client ask for confirmation.

## Common snags

| Snag | Fix |
| --- | --- |
| `npm ci` fails on an old Node | Install Node.js 22 or newer |
| Client says the server failed to start | Use an absolute path to `dist/main.js`, and run `npm run build` first |
| `node` not found by the client | Put the full path to the node binary in `command` |
| Client connects, then drops | Something wrote to stdout. Log with `log()` to stderr |
| Tools do not update after an edit | Rebuild, then restart the server in the client |
| Windows paths in JSON break | Use forward slashes, or double the backslashes |
| Inspector cannot reach the HTTP server | Use `http://127.0.0.1:3333/mcp` and the Streamable HTTP transport |
| HTTP returns 403 | The Host or Origin is not local. Connect to 127.0.0.1 or localhost |
| `notes.json is not valid JSON` | Someone edited the file by hand. Fix it or move it away |

## After the day

Point people at the chapter 11 exercise: build a server for their own tool or data. Ask them to
share it in an issue on the repo.
