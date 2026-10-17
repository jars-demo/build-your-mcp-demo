import Link from 'next/link'

import { CodeBlock } from '@/components/CopyButton'
import { ProtocolDiagram } from '@/components/ProtocolDiagram'
import { extractRegistration, readRepoFile } from '@/lib/code'
import { CLIENTS, FEATURES, MORE, PRIMITIVES, QUICKSTART, REPO_URL } from '@/lib/site'
import { CHAPTERS } from '@/lib/workshop'

const total = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0)

const primitives = PRIMITIVES.map((primitive) => ({
  ...primitive,
  code: extractRegistration(readRepoFile(primitive.file), primitive.call),
}))

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] font-semibold tracking-[0.16em] text-accent-text uppercase">
      {children}
    </span>
  )
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <header className="mb-8 flex max-w-2xl flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="text-[16.5px] leading-relaxed text-ink-2">{body}</p>
    </header>
  )
}

export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-24 px-4 pt-14 pb-28 sm:pt-20">
      <section className="flex flex-col gap-10">
        <div className="rise flex max-w-3xl flex-col gap-5">
          <Eyebrow>
            A JARS Demo workshop · {CHAPTERS.length} chapters · about {total} minutes
          </Eyebrow>
          <h1 className="font-display text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-7xl">
            Build your own <span className="text-gradient">MCP server.</span>
          </h1>
          <p className="max-w-2xl text-[17px] leading-relaxed text-ink-2 sm:text-lg">
            The Model Context Protocol lets any AI client use your tools and data. In this workshop
            you build Jotter, a small, real MCP server in TypeScript, test it, debug it, plug it
            into Claude Code, Cursor and VS Code, and get it ready to share.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/workshop/01-why-mcp"
              className="plug inline-flex h-11 items-center gap-2 rounded-full bg-accent-text px-5 font-medium text-white transition-colors hover:bg-ink"
            >
              Start the workshop
              <span className="plug-wiggle" aria-hidden="true">
                →
              </span>
            </Link>
            <a
              href="#quickstart"
              className="inline-flex h-11 items-center rounded-full bg-surface px-5 font-medium text-ink shadow-soft transition-colors hover:bg-surface-2"
            >
              Quick start
            </a>
          </div>
        </div>
        <div className="rise min-w-0" style={{ '--delay': '120ms' } as React.CSSProperties}>
          <ProtocolDiagram />
        </div>
      </section>

      <section id="build" className="scroll-mt-24">
        <SectionTitle
          eyebrow="What you build"
          title="Jotter: notes your AI can use."
          body="A notes server that stores JSON in a local file. No accounts, no cloud, nothing to sign up for. Small enough to read in one sitting, real enough to keep using."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <Link
                href={`/workshop/${feature.chapter}`}
                className="card lift flex h-full flex-col gap-2 rounded-panel p-5"
              >
                <span className="font-display text-lg font-semibold tracking-tight">
                  {feature.title}
                </span>
                <span className="text-[15px] leading-relaxed text-muted">{feature.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="primitives" className="scroll-mt-24">
        <SectionTitle
          eyebrow="The three primitives"
          title="Tools, resources and prompts."
          body="Every MCP server is built from these three. The difference is who decides when they are used. The code below is read straight from server/src at build time."
        />
        <div className="flex flex-col gap-4">
          {primitives.map((primitive) => (
            <article
              key={primitive.name}
              className="card grid min-w-0 gap-4 rounded-panel p-4 sm:p-6 lg:grid-cols-[16rem_1fr]"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  {primitive.name}
                </h3>
                <span className="w-fit rounded-full bg-accent-wash px-2.5 py-1 text-[12px] font-semibold text-accent-text">
                  {primitive.who}
                </span>
                <p className="text-[15px] leading-relaxed text-muted">{primitive.body}</p>
                <Link
                  href={`/workshop/${primitive.chapter}`}
                  className="text-[14px] font-medium text-accent-text underline underline-offset-4"
                >
                  Chapter {primitive.chapter.slice(0, 2)}
                </Link>
              </div>
              <div className="min-w-0">
                <CodeBlock code={primitive.code} lang={primitive.file} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="chapters" className="scroll-mt-24">
        <SectionTitle
          eyebrow="The workshop"
          title={`${CHAPTERS.length} short chapters.`}
          body="Each one is hands-on and ends with a way to check it worked and an exercise. Do them in order, or jump to what you need."
        />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={`/workshop/${chapter.slug}`}
                className="card lift flex h-full items-start gap-4 rounded-panel p-5"
              >
                <span className="font-mono text-sm font-semibold text-accent-text tabular-nums">
                  {chapter.number}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold tracking-tight">{chapter.title}</span>
                  <span className="text-[13px] text-muted">{chapter.minutes} minutes</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="quickstart" className="scroll-mt-24">
        <SectionTitle
          eyebrow="Quick start"
          title="Running in two minutes."
          body="You need Node.js 22 and git. The last command opens MCP Inspector, where you can call every tool by hand."
        />
        <CodeBlock code={QUICKSTART} />
      </section>

      <section id="connect" className="scroll-mt-24">
        <SectionTitle
          eyebrow="Plug it in"
          title="Connect it to your client."
          body="Build once with npm run build, then point your client at server/dist/main.js. Use absolute paths. Jotter is not published to npm, so these run your local copy."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {CLIENTS.map((snippet) => (
            <div key={snippet.client} className="flex min-w-0 flex-col gap-2">
              <h3 className="flex flex-wrap items-baseline gap-x-2 font-semibold">
                {snippet.client}
                <span className="font-mono text-[12px] font-normal text-muted">
                  {snippet.where}
                </span>
              </h3>
              <CodeBlock code={snippet.code} lang={snippet.lang} />
            </div>
          ))}
        </div>
      </section>

      <section id="more" className="scroll-mt-24">
        <SectionTitle
          eyebrow="More from JARS Demo"
          title="Keep building."
          body="Free, hands-on workshops in the same style. Each one ships a real project."
        />
        <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
          {MORE.map((workshop) => (
            <li key={workshop.name}>
              <a
                href={workshop.href}
                className="card lift flex h-full flex-col gap-1 rounded-card p-4"
              >
                <span className="font-semibold">{workshop.name}</span>
                <span className="text-[13px] text-muted">{workshop.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[15px] text-muted">
          Found a bug or want a chapter?{' '}
          <a className="text-accent-text underline underline-offset-4" href={`${REPO_URL}/issues`}>
            Open an issue
          </a>
          .
        </p>
      </section>
    </div>
  )
}
