import { useEffect, useRef, useState } from 'react'
import type { StreamEvent } from '../types/stream'

export function StreamAndTerminal({ events }: { events: StreamEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [events.length])

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' })
  }, [terminalOutput.length])

  useEffect(() => {
    if (!window.pico?.preview) return
    const unsub = window.pico.preview.onTerminalOutput((text) => {
      setTerminalOutput((prev) => [...prev.slice(-500), text])
    })
    return unsub
  }, [])

  return (
    <div className="h-40 border-t border-neutral-800 bg-neutral-900 overflow-hidden flex shrink-0">
      <div className="flex-1 min-w-0 flex flex-col border-r border-neutral-800" tabIndex={0} title="Stream output. Ctrl+C to cancel run.">
        <div className="shrink-0 border-b border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-wide text-neutral-500">
          Stream
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
          {events.length === 0 ? (
            <div className="text-neutral-600">No events</div>
          ) : (
            events.map((e, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  e.kind === 'error' ? 'text-red-400' : e.kind === 'status' ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                <span className="shrink-0 text-neutral-600">[{e.kind}]</span>
                <span className="shrink-0">{e.stage}</span>
                <span className="truncate">{e.message ?? JSON.stringify(e.meta)}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col" tabIndex={0} title="Preview dev server output">
        <div className="shrink-0 border-b border-neutral-800 px-3 py-2 text-[10px] uppercase tracking-wide text-neutral-500">
          Terminal
        </div>
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto overflow-x-auto p-2 font-mono text-[11px] text-neutral-400 whitespace-pre-wrap break-words"
        >
          {terminalOutput.length === 0 ? (
            <div className="text-neutral-600">Runs automatically</div>
          ) : (
            terminalOutput.map((line, i) => (
              <div key={i} className="leading-relaxed">
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
