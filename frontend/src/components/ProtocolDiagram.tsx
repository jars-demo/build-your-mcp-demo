'use client'

import { useState } from 'react'

import { EXCHANGES } from '@/lib/site'

// The hero diagram: client, protocol, your server, your data. Pick a message to see a real
// request and response from Jotter travel along the wire.

const CLIENTS = ['Claude Code', 'Cursor', 'VS Code']

export function ProtocolDiagram() {
  const [active, setActive] = useState(0)
  const exchange = EXCHANGES[active] ?? EXCHANGES[0]!

  return (
    <figure
      aria-label="How an MCP client talks to your server"
      className="card flex min-w-0 flex-col gap-5 rounded-panel p-4 sm:p-6"
    >
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_auto]">
        <Box label="Client" tone="plain">
          <ul className="flex flex-wrap gap-1.5">
            {CLIENTS.map((client) => (
              <li
                key={client}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink-2"
              >
                {client}
              </li>
            ))}
          </ul>
        </Box>
        <Wire label="JSON-RPC" />
        <Box label="Your server" tone="accent">
          <span className="font-mono text-[13px] font-semibold">jotter</span>
          <span className="text-[12px] text-muted">3 tools · 2 resources · 1 prompt</span>
        </Box>
        <Wire label="fs" />
        <Box label="Your data" tone="plain">
          <span className="font-mono text-[13px]">notes.json</span>
        </Box>
      </div>

      <div role="tablist" aria-label="Messages" className="flex flex-wrap gap-1.5">
        {EXCHANGES.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            id={`tab-${i}`}
            aria-selected={i === active}
            aria-controls="exchange-panel"
            onClick={() => setActive(i)}
            className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors ${
              i === active
                ? 'bg-ink text-canvas'
                : 'bg-surface-2 text-ink-2 hover:bg-accent-wash hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id="exchange-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        key={active}
        className="swap grid min-w-0 gap-3 lg:grid-cols-2"
      >
        <Message title={`Client sends ${exchange.method}`} body={exchange.request} />
        <Message title="Jotter replies" body={exchange.response} />
      </div>
      <figcaption className="text-[13px] text-muted">
        Real messages from the workshop server, captured with the MCP SDK client. The JSON-RPC
        envelope is left out.
      </figcaption>
    </figure>
  )
}

function Box({
  label,
  tone,
  children,
}: {
  label: string
  tone: 'plain' | 'accent'
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-card p-3 ${
        tone === 'accent'
          ? 'bg-accent-wash shadow-[0_0_0_1.5px_var(--accent)]'
          : 'bg-canvas shadow-[0_0_0_1px_var(--hairline)]'
      }`}
    >
      <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

function Wire({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:w-20 sm:flex-col sm:gap-1">
      <span className="wire-v h-5 w-0.5 sm:hidden" aria-hidden="true" />
      <span className="wire hidden h-0.5 w-full sm:block" aria-hidden="true" />
      <span className="font-mono text-[11px] text-accent-text">{label}</span>
      <span className="pulse size-1.5 rounded-full bg-accent" aria-hidden="true" />
    </div>
  )
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-card bg-code-bg text-code-ink">
      <div className="px-4 pt-3 font-mono text-[12px] text-code-muted">{title}</div>
      <pre className="overflow-x-auto px-4 pt-2 pb-4 font-mono text-[12.5px] leading-relaxed">
        <code>{body}</code>
      </pre>
    </div>
  )
}
