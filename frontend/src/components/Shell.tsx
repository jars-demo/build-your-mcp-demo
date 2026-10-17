import Link from 'next/link'

import { REPO_URL } from '@/lib/site'

import { BackToTop } from './BackToTop'

// Navigation and footer, shared by every page.

export function LogoMark({ size = 28 }: { size?: number }) {
  // A plug about to meet its socket: your server plugging into any client.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0f1222" />
      <rect x="5" y="10" width="9" height="12" rx="2.5" fill="#7c3aed" />
      <rect x="14" y="12.5" width="4" height="2" rx="1" fill="#ece9f7" />
      <rect x="14" y="17.5" width="4" height="2" rx="1" fill="#ece9f7" />
      <rect
        x="20"
        y="9"
        width="7"
        height="14"
        rx="2.5"
        fill="none"
        stroke="#ece9f7"
        strokeWidth="2"
      />
    </svg>
  )
}

const NAV = [
  { href: '/#primitives', label: 'Primitives' },
  { href: '/workshop', label: 'Workshop' },
]

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-3 z-30 px-3 sm:top-4 sm:px-4">
        <nav
          aria-label="Main"
          className="glass-strong mx-auto flex h-13 max-w-5xl items-center justify-between gap-2 rounded-full pr-2 pl-3 sm:pl-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full font-display text-[17px] font-semibold tracking-[-0.02em]"
          >
            <LogoMark />
            <span className="hidden sm:inline">Build Your Own MCP</span>
          </Link>
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-85"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <LogoMark size={20} />
            Build Your Own MCP, a JARS Demo workshop
          </span>
          <span>
            MIT licensed ·{' '}
            <a className="hover:text-ink" href={REPO_URL}>
              GitHub
            </a>
          </span>
        </div>
      </footer>
      <BackToTop />
    </>
  )
}
