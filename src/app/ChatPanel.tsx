/* eslint-disable react-refresh/only-export-components */
/**
 * ChatPanel - Chat-style UI with messages above, input at bottom.
 * Supports @agent and @pico mentions to direct requests.
 */

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

export type ChatRole = 'user' | 'agent' | 'pico'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  ts: number
}

function highlightMentions(text: string): ReactNode {
  const parts: ReactNode[] = []
  const re = /(@agent|@pico)(?=\s|$)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index))
    }
    const mention = m[1]!
    parts.push(
      <span
        key={m.index}
        className={
          mention === '@agent'
            ? 'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-blue-600/40 text-blue-200 border border-blue-500/50'
            : 'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-emerald-600/40 text-emerald-200 border border-emerald-500/50'
        }
      >
        {mention}
      </span>
    )
    lastIndex = m.index + mention.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length > 1 ? parts : text
}

export function parseMention(text: string): { target: 'agent' | 'pico' | null; body: string } {
  const t = text.trim()
  const agentMatch = t.match(/^@agent\s+(.+)$/is)
  if (agentMatch) return { target: 'agent', body: agentMatch[1]!.trim() }
  const picoMatch = t.match(/^@pico\s+(.+)$/is)
  if (picoMatch) return { target: 'pico', body: picoMatch[1]!.trim() }
  if (t.startsWith('@agent')) return { target: 'agent', body: t.slice(6).trim() }
  if (t.startsWith('@pico')) return { target: 'pico', body: t.slice(5).trim() }
  return { target: null, body: t }
}

export interface ChatPanelProps {
  hasRun: boolean
  prompt: string
  onPromptChange: (v: string) => void
  onSend: (raw: string) => void
  onCancel: () => void
  loading: boolean
  improving: boolean
  runId: string | null
  messages: ChatMessage[]
}

export function ChatPanel({
  hasRun,
  prompt,
  onPromptChange,
  onSend,
  onCancel,
  loading,
  improving,
  runId,
  messages,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const showMentions = prompt.endsWith('@') || (prompt.includes('@') && /@\w*$/.test(prompt))

  const insertMention = (mention: string) => {
    const before = prompt.replace(/@\w*$/, '')
    onPromptChange(before + mention + ' ')
    inputRef.current?.focus()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length])

  const handleSend = () => {
    const raw = prompt.trim()
    if (!raw) return
    onSend(raw)
    onPromptChange('')
  }

  const showCancel = runId && (loading || improving)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-neutral-500 text-xs space-y-2 py-4">
            <p>Describe what to build. Use @agent or @pico to direct requests.</p>
            <p className="text-neutral-600">
              Examples:
              <br />
              • Build a todo app
              <br />
              • @pico improve the spacing
              <br />
              • @agent add dark mode
            </p>
          </div>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-neutral-800 p-3 space-y-2">
        {!hasRun && (
          <p className="text-amber-400/90 text-[10px]">Open in Electron (npm run dev) to use chat.</p>
        )}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Message… @agent or @pico to direct"
            rows={2}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-relaxed text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
              if (e.key === 'Escape' && showMentions) {
                e.preventDefault()
                onPromptChange(prompt.replace(/@\w*$/, ''))
              }
            }}
          />
          {showMentions && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => insertMention('@agent')}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-800 text-blue-300"
              >
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-600/40 text-blue-200">@agent</span>
                <span className="text-neutral-400 text-xs">Generate or modify</span>
              </button>
              <button
                type="button"
                onClick={() => insertMention('@pico')}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-800 text-emerald-300"
              >
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-600/40 text-emerald-200">@pico</span>
                <span className="text-neutral-400 text-xs">Design improvements</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={loading || improving || !hasRun || !prompt.trim()}
            title={!hasRun ? 'Open in Electron' : !prompt.trim() ? 'Enter a message' : undefined}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
          {showCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-neutral-600 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              title="Cancel (Ctrl+C)"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const label =
    message.role === 'agent'
      ? 'Agent'
      : message.role === 'pico'
        ? 'Pico'
        : 'You'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-blue-600/30 text-blue-100 border border-blue-800/50'
            : message.role === 'pico'
              ? 'bg-emerald-950/50 text-emerald-200 border border-emerald-800/50'
              : 'bg-neutral-800/80 text-neutral-200 border border-neutral-700'
        }`}
      >
        <p className="text-[10px] font-mono uppercase tracking-wide opacity-70 mb-0.5">{label}</p>
        <p className="whitespace-pre-wrap break-words">{highlightMentions(message.content)}</p>
      </div>
    </div>
  )
}
