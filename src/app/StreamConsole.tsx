import { useEffect, useRef } from 'react'
import type { StreamEvent } from '../types/stream'

export function StreamConsole({ events }: { events: StreamEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [events.length])

  return (
    <div
      className="h-48 border-t border-neutral-800 bg-neutral-900 overflow-hidden flex flex-col"
      tabIndex={0}
      title="Stream output. Ctrl+C to cancel run."
    >
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
  )
}
