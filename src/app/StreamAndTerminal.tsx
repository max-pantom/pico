import { useEffect, useRef, useState } from 'react'
import type { StreamEvent } from '../types/stream'

export function StreamAndTerminal({ events, workspacePath, terminalSide: _terminalSide = 'baseline' }: { events: StreamEvent[]; workspacePath?: string | null; terminalSide?: 'baseline' | 'improved' }) {
  void _terminalSide
  const scrollRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [terminalCommand, setTerminalCommand] = useState('')
  const [activeTab, setActiveTab] = useState<'stream' | 'terminal'>('stream')

  useEffect(() => {
    if (activeTab === 'stream') scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [events.length, activeTab])

  useEffect(() => {
    if (activeTab === 'terminal') terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' })
  }, [terminalOutput.length, activeTab])

  useEffect(() => {
    if (!window.pico?.preview) return
    const unsub = window.pico.preview.onTerminalOutput((text) => {
      setTerminalOutput((prev) => [...prev.slice(-500), text])
    })
    return unsub
  }, [])

  return (
    <div className="h-40 border-t border-neutral-800 bg-neutral-900 overflow-hidden flex flex-col shrink-0">
      <div className="shrink-0 flex border-b border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab('stream')}
          className={`px-3 py-2 text-[10px] uppercase tracking-wide ${
            activeTab === 'stream' ? 'text-neutral-200 bg-neutral-800 border-b-2 border-neutral-500' : 'text-neutral-500 hover:text-neutral-400'
          }`}
          title="Stream output. Ctrl+C to cancel run."
        >
          Stream
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-2 text-[10px] uppercase tracking-wide ${
            activeTab === 'terminal' ? 'text-neutral-200 bg-neutral-800 border-b-2 border-neutral-500' : 'text-neutral-500 hover:text-neutral-400'
          }`}
          title="Preview dev server output"
        >
          Terminal
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'stream' && (
          <div ref={scrollRef} className="h-full overflow-y-auto p-2 font-mono text-xs space-y-0.5">
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
        )}
        {activeTab === 'terminal' && (
          <div className="h-full flex flex-col min-h-0">
            <div
              ref={terminalRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-2 font-mono text-[11px] text-neutral-400 whitespace-pre-wrap break-words"
            >
              {terminalOutput.length === 0 ? (
                <div className="text-neutral-600">Codex output and run commands here</div>
              ) : (
                terminalOutput.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))
              )}
            </div>
            {window.pico?.preview?.runCommand && (
              <form
                className="shrink-0 border-t border-neutral-800 flex"
                onSubmit={(e) => {
                  e.preventDefault()
                  const cmd = terminalCommand.trim()
                  if (cmd) {
                    window.pico!.preview!.runCommand({ command: cmd, cwd: workspacePath ?? undefined })
                    setTerminalCommand('')
                  }
                }}
              >
                <span className="shrink-0 px-2 py-1.5 text-neutral-500 font-mono text-xs">$</span>
                <input
                  type="text"
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  placeholder={workspacePath ? 'Run command in output folder...' : 'Run command (uses cwd if no folder)'}
                  className="flex-1 min-w-0 bg-transparent px-2 py-1.5 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
                />
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
