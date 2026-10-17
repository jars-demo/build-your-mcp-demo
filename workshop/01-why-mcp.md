# Why MCP, and what we build

> MCP is a standard plug between AI clients and your tools and data, and today you build one.

**Time:** 10 minutes

## Goal

Know what problem the Model Context Protocol solves, the words it uses, and what Jotter, the server you build in this workshop, will do by the end.

## The problem

Every AI client wants to use your tools and your data. Without a standard, you write one plugin for Claude, another for Cursor, another for VS Code, and they all drift apart.

MCP fixes that the way USB fixed cables. You write one server. Any client that speaks MCP can plug into it.

## The words

| Word | What it means |
| --- | --- |
| Host | The app the user works in: Claude Code, Claude Desktop, Cursor, VS Code. |
| Client | The part of the host that holds one connection to one server. |
| Server | Your program. It offers tools, resources and prompts. |
| Transport | How messages travel: stdio for a local process, Streamable HTTP for a remote one. |
| JSON-RPC | The message format. Every request has a method, like `tools/call`, and params. |

A session starts with `initialize`. The client and server agree a protocol version and say what they support. After that the client can list and call what the server offers.

## The three primitives

- **Tools** are actions. The model decides when to call them. Example: `add_note`.
- **Resources** are read-only data with a URI. The app decides when to read them. Example: `notes://all`.
- **Prompts** are templates. The user picks them, often from a slash menu. Example: `summarize_notes`.

The difference is who is in control. Keep that in mind and the rest of MCP is easy to place.

## What we build

Jotter is a notes server. It stores notes in one JSON file on your machine. No accounts and no cloud.

By the end it has:

- three tools: `add_note`, `search_notes`, `delete_note`
- two resources: `notes://all` and `notes://{id}`
- one prompt: `summarize_notes`
- input validation on every call
- tests that run a real MCP client in memory
- stdio and Streamable HTTP transports
- a package you can publish to npm

The finished code is in `server/src/`. Each chapter quotes it, and a test keeps the quotes honest.

## When MCP is the wrong tool

If only your own app calls the function, a normal function or HTTP API is simpler. MCP earns its place when you want many AI clients to use the same capability, or you want the user to choose which tools their assistant can reach.

## Check it works

You are ready for the next chapter if you can answer these out loud:

- Who decides when a tool runs? When a resource is read? When a prompt is used?
- What is the first message in every MCP session?

## Exercise

Pick one tool or data source from your own work, like a ticket tracker, a wiki or a database. Write down one tool, one resource and one prompt it could offer over MCP. Keep the list. You will build it in chapter 11.
