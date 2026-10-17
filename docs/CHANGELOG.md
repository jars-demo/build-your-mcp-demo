# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-10-17

### Added

- Jotter, an MCP server for notes in a local JSON file, built on `@modelcontextprotocol/sdk`
  1.32.0 and zod 4.
- Tools `add_note`, `search_notes` and `delete_note` with zod input validation, annotations and
  safe tool errors.
- Resources `notes://all` and the `notes://{id}` template with listing and id completion.
- The `summarize_notes` prompt, with notes fenced as data.
- stdio and stateless Streamable HTTP transports from one `jotter-mcp` command, with Host and
  Origin checks for HTTP.
- Tests through the SDK in-memory transport and a real HTTP client.
- Eleven workshop chapters, from why MCP to security and publishing.
- The workshop site with a protocol diagram of real messages, code read from the server at build
  time, client setup snippets, and a back to top button.
- CI for the server and the site, and Dependabot with a 14 day cooldown.
