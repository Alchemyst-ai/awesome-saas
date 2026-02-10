'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

export type DocSection = {
  id: string;
  title: string;
  description: string;
  content: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const CHAT_STATE_KEY = 'rzpay-docs-chat-state-v1';

const defaultMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Ask anything about the current documentation section. I can explain flows, APIs, and quick integration steps.',
  },
];

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function renderInline(text: string): React.ReactNode {
  const chunks = text.split(/(`[^`]+`|\[[^\]]+\]\([^\)]+\))/g);

  return chunks.map((chunk, index) => {
    if (!chunk) {
      return null;
    }

    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code key={index} className="doc-inline-code">
          {chunk.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = chunk.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="doc-link"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <Fragment key={index}>{chunk}</Fragment>;
  });
}

function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(
        <pre key={`code-${index}`} className="doc-code-block">
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );

      index += 1;
      continue;
    }

    if (line === '---') {
      blocks.push(<hr key={`hr-${index}`} className="doc-divider" />);
      index += 1;
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      const depth = line.match(/^#+/)?.[0].length ?? 1;
      const text = line.replace(/^#{1,4}\s+/, '');

      if (depth === 1) {
        blocks.push(
          <h1 key={`h1-${index}`} className="doc-h1">
            {renderInline(text)}
          </h1>,
        );
      } else if (depth === 2) {
        blocks.push(
          <h2 key={`h2-${index}`} className="doc-h2">
            {renderInline(text)}
          </h2>,
        );
      } else {
        blocks.push(
          <h3 key={`h3-${index}`} className="doc-h3">
            {renderInline(text)}
          </h3>,
        );
      }

      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, '').trim());
        index += 1;
      }

      blocks.push(
        <ul key={`ul-${index}`} className="doc-list">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, '').trim());
        index += 1;
      }

      blocks.push(
        <ol key={`ol-${index}`} className="doc-list doc-list-numbered">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.startsWith('>')) {
      blocks.push(
        <blockquote key={`quote-${index}`} className="doc-quote">
          {renderInline(line.replace(/^>\s?/, ''))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    const paragraphLines: string[] = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith('```') &&
      !/^#{1,4}\s+/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      lines[index] !== '---' &&
      !lines[index].startsWith('>')
    ) {
      paragraphLines.push(lines[index].trimEnd());
      index += 1;
    }

    blocks.push(
      <p key={`p-${index}`} className="doc-paragraph">
        {renderInline(paragraphLines.join(' '))}
      </p>,
    );
  }

  return blocks;
}

export default function DocsChatClient({
  sections,
  initialSectionId,
}: {
  sections: DocSection[];
  initialSectionId?: string;
}) {
  const router = useRouter();
  const [activeSectionId, setActiveSectionId] = useState(
    initialSectionId ?? sections[0]?.id ?? '',
  );
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRestoredChatState, setHasRestoredChatState] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const persistChatState = (next?: {
    isAssistantOpen?: boolean;
    messages?: Message[];
    input?: string;
  }) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(
      CHAT_STATE_KEY,
      JSON.stringify({
        isAssistantOpen: next?.isAssistantOpen ?? isAssistantOpen,
        messages: next?.messages ?? messages,
        input: next?.input ?? input,
      }),
    );
  };

  useEffect(() => {
    if (initialSectionId) {
      setActiveSectionId(initialSectionId);
    }
  }, [initialSectionId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.sessionStorage.getItem(CHAT_STATE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        isAssistantOpen?: boolean;
        messages?: Message[];
        input?: string;
      };
      if (typeof parsed.isAssistantOpen === 'boolean') {
        setIsAssistantOpen(parsed.isAssistantOpen);
      }
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        setMessages(parsed.messages);
      }
      if (typeof parsed.input === 'string') {
        setInput(parsed.input);
      }
    } catch {
      // Ignore invalid persisted state.
    } finally {
      setHasRestoredChatState(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasRestoredChatState) {
      return;
    }
    persistChatState();
  }, [hasRestoredChatState, input, isAssistantOpen, messages]);

  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];

  const renderedDoc = useMemo(() => {
    if (!activeSection) {
      return null;
    }
    return renderMarkdown(activeSection.content);
  }, [activeSection]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading || !activeSection) {
      return;
    }
    setIsAssistantOpen(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextualInput = `[Section: ${activeSection.title}] ${userMessage.content}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: contextualInput }),
      });

      if (!response.ok) {
        throw new Error('Unable to fetch assistant response');
      }

      const data = await response.json();
      const resolvedSectionId =
        typeof data.sectionId === 'string'
          ? sections.find((section) => section.id === data.sectionId)?.id
          : undefined;
      if (resolvedSectionId) {
        setActiveSectionId(resolvedSectionId);
        persistChatState({ isAssistantOpen: true });
        router.push(`/${resolvedSectionId}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: data.text || 'No response generated for this query.',
        },
      ]);

      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-system`,
          role: 'system',
          content: 'Could not connect to the assistant right now. Please retry.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="docs-shell">
      <header className="docs-topbar">
        <div>
          <p className="docs-eyebrow">Razorpay Documentation</p>
          <div className="mt-[0.35rem] flex items-center justify-between gap-3 max-sm:items-start">
            <h1 className="docs-title !m-0">Developer Guide + Embedded Assistant</h1>
            <button
              type="button"
              className="rounded-lg border border-[rgb(19,38,68)] bg-[rgb(19,38,68)] px-4 py-2 text-sm font-bold leading-none text-white transition hover:bg-[rgb(27,52,90)]"
              onClick={() => setIsAssistantOpen(true)}
            >
              Ask AI
            </button>
          </div>
        </div>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <h2 className="sidebar-title">Sections</h2>
          <nav className="sidebar-nav" aria-label="Documentation sections">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSectionId(section.id);
                  persistChatState({ isAssistantOpen });
                  router.push(`/${section.id}`);
                }}
                className={cn(
                  'sidebar-link',
                  section.id === activeSection.id && 'sidebar-link-active',
                )}
              >
                <span className="sidebar-link-title">{section.title}</span>
                <span className="sidebar-link-desc">{section.description}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="docs-main" aria-live="polite">
          <article className="doc-card">{renderedDoc}</article>
        </main>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[60] bg-[rgba(7,23,45,0.45)] transition-opacity duration-200',
          isAssistantOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsAssistantOpen(false)}
        aria-hidden={!isAssistantOpen}
      />

      <aside
        className={cn(
          'fixed right-0 top-0 z-[70] h-dvh w-[min(430px,94vw)] transform bg-white transition-transform duration-200',
          isAssistantOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!isAssistantOpen}
        aria-label="Assistant"
      >
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] border-l border-[var(--color-doc-border)] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-doc-border)] p-4">
            <div>
              <h2 className="m-0 text-[1.07rem] text-[rgb(19,38,68)]">Assistant</h2>
              <p className="mt-1 text-xs text-[var(--color-doc-muted)]">
                Context-aware to: {activeSection.title}
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-[rgb(19,38,68)] px-3 py-2 text-xs font-bold leading-none text-[rgb(19,38,68)] hover:bg-[rgba(19,38,68,0.08)]"
              onClick={() => setIsAssistantOpen(false)}
              aria-label="Close assistant"
            >
              Close
            </button>
          </div>

          <div className="grid min-h-0 gap-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'rounded-xl border p-3',
                  message.role === 'user' && 'border-[rgba(19,38,68,0.25)] bg-[rgba(19,38,68,0.08)]',
                  message.role === 'assistant' && 'border-[#dce7f8] bg-white',
                  message.role === 'system' && 'border-[#ffd7d7] bg-[#fff3f3]',
                )}
              >
                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.05em] text-[var(--color-doc-muted)]">
                  {message.role === 'user'
                    ? 'You'
                    : message.role === 'assistant'
                      ? 'Assistant'
                      : 'System'}
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-[0.92rem] leading-[1.58]">
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="rounded-xl border border-[#dce7f8] bg-white p-3">
                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.05em] text-[var(--color-doc-muted)]">
                  Assistant
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-[0.92rem] leading-[1.58]">
                  Generating response...
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-2 border-t border-[var(--color-doc-border)] p-3"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a question
            </label>
            <textarea
              id="assistant-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`Ask about ${activeSection.title}`}
              rows={3}
              className="w-full resize-y rounded-md border border-[#cadcf8] bg-[#fbfdff] p-3 text-[var(--color-doc-text)] outline-none focus:border-[rgb(19,38,68)]"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="rounded-md bg-[rgb(19,38,68)] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!input.trim() || isLoading}
            >
              Send
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
