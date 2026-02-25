/**
 * LayoutShell - Sidebar + dual columns (Codex | Pico)
 * Top: Output tabs (Preview | Code | Files)
 * Bottom: Stream console
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { StreamEvent } from '../types/stream'
import { StreamAndTerminal } from './StreamAndTerminal.tsx'
import { DiffView } from './DiffView.tsx'
import { ChatPanel, parseMention, type ChatMessage } from './ChatPanel.tsx'
import { diffLines } from 'diff'
import { CodeDisplay } from './CodeDisplay.tsx'

const hasRun = typeof window !== 'undefined' && window.pico?.run
const isDesktop = typeof window !== 'undefined' && !!window.pico

type LogEntry = StreamEvent

interface PicoState {
  agentStatus: 'idle' | 'running' | 'done'
  picoStatus: 'idle' | 'reviewing' | 'done'
  agentPreviewUrl: string
  picoPreviewUrl: string
  agentLogs: LogEntry[]
  picoLogs: LogEntry[]
  agentView: 'ui' | 'code'
  picoView: 'ui' | 'code'
}

export function LayoutShell() {
  const menuHandlersRef = useRef<{
    run: () => Promise<void>
    improve: () => Promise<void>
    cancel: () => void
    pickFolder: () => Promise<void>
    exportCode: () => Promise<void>
    openPreferences: () => void
  } | null>(null)

  const [prompt, setPrompt] = useState('')
  const [runId, setRunId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [improving, setImproving] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [baselineCode, setBaselineCode] = useState('')
  const [improvedCode, setImprovedCode] = useState('')
  const [picoInstruction, setPicoInstruction] = useState('')
  const [critic, setCritic] = useState<{ score?: Record<string, number>; verdict?: string } | null>(null)
  const [archetype, setArchetype] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [agentView, setAgentView] = useState<'ui' | 'code'>('ui')
  const [picoView, setPicoView] = useState<'ui' | 'code'>('ui')
  const [workspacePath, setWorkspacePath] = useState<string | null>(null)
  const [workspaceFiles, setWorkspaceFiles] = useState<Record<string, string>>({})
  const [workspaceFileList, setWorkspaceFileList] = useState<string[]>([])
  const [selectedWorkspaceFile, setSelectedWorkspaceFile] = useState<string | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [originalPrompt, setOriginalPrompt] = useState('')
  const agentMessageAddedRef = useRef<string | null>(null)
  const streamFilter = new Set(['status', 'tool', 'code', 'error', 'preview'])

  const [baselinePort, setBaselinePort] = useState<number | null>(null)
  const [improvedPort, setImprovedPort] = useState<number | null>(null)

  const [displayedBaselineCode, setDisplayedBaselineCode] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (loading) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => setDisplayedBaselineCode(baselineCode), 400)
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
      }
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setDisplayedBaselineCode(baselineCode)
  }, [baselineCode, loading])
  const effectiveBaselineCode = loading ? displayedBaselineCode : baselineCode

  const handleAddEvent = useCallback((e: { runId: string; ts: number; source: string; kind: string; stage: string; message?: string; meta?: Record<string, unknown> }) => {
    setEvents((prev) => [...prev.slice(-199), e as StreamEvent])
    if ((e.kind === 'status' || e.kind === 'tool') && e.meta?.baselineCode) {
      setBaselineCode(String(e.meta.baselineCode))
      if (e.kind === 'status' && !e.meta?.improvedCode && agentMessageAddedRef.current !== e.runId) {
        agentMessageAddedRef.current = e.runId
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'agent', content: 'Generated baseline.', ts: Date.now() }])
      }
    }
    if (e.kind === 'status' && e.meta?.improvedCode) {
      setImprovedCode(String(e.meta.improvedCode))
      setCritic((e.meta.critic2 ?? e.meta.critic1) as { score?: Record<string, number>; verdict?: string })
      if (e.meta.archetype) setArchetype(String(e.meta.archetype))
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'pico', content: 'Applied design improvements.', ts: Date.now() }])
    }
    if (e.kind === 'code' && e.source === 'pico' && typeof e.meta?.codexInstruction === 'string') {
      setPicoInstruction(e.meta.codexInstruction)
    }
    if (e.kind === 'preview' && e.meta?.port != null) {
      const side = e.meta.side as string
      if (side === 'baseline') setBaselinePort(Number(e.meta.port))
      if (side === 'improved') setImprovedPort(Number(e.meta.port))
    }
  }, [])

  useEffect(() => {
    if (!hasRun) return
    const unsub = window.pico!.run.onEvent(handleAddEvent)
    return unsub
  }, [handleAddEvent])

  useEffect(() => {
    if (!window.pico?.workspace) return
    window.pico.workspace.getSelectedPath().then((path) => {
      setWorkspacePath(path)
    })
  }, [])

  const refreshWorkspaceSnapshot = useCallback(async () => {
    if (!workspacePath || !window.pico?.workspace) {
      setWorkspaceFiles({})
      return
    }

    const fileList = await window.pico.workspace.listFiles(workspacePath)
    const candidates = prioritizeWorkspaceFiles(fileList)
    if (candidates.length === 0) {
      setWorkspaceFiles({})
      return
    }

    const readPairs = await Promise.all(
      candidates.map(async (relativePath: string) => {
        const content = await window.pico!.workspace.readFile({ rootPath: workspacePath, relativePath })
        return [relativePath, content] as const
      }),
    )

    const next: Record<string, string> = {}
    for (const [relativePath, content] of readPairs) {
      if (typeof content === 'string' && content.length > 0) next[relativePath] = content
    }

    setWorkspaceFiles(next)
  }, [workspacePath])

  useEffect(() => {
    void refreshWorkspaceSnapshot()
  }, [refreshWorkspaceSnapshot])

  useEffect(() => {
    if (!workspacePath || !window.pico?.workspace) return
    if (!loading && !improving) return
    const timer = window.setInterval(() => {
      void refreshWorkspaceSnapshot()
    }, 1200)
    return () => window.clearInterval(timer)
  }, [workspacePath, loading, improving, refreshWorkspaceSnapshot])

  const refreshWorkspaceFileList = useCallback(async () => {
    if (!workspacePath || !window.pico?.workspace) {
      setWorkspaceFileList([])
      return
    }
    const list = await window.pico.workspace.listFiles(workspacePath)
    setWorkspaceFileList(list)
  }, [workspacePath])

  useEffect(() => {
    void refreshWorkspaceFileList()
  }, [refreshWorkspaceFileList])

  const handleWorkspaceFileClick = useCallback(
    async (relativePath: string) => {
      if (!workspacePath || !window.pico?.workspace) return
      const content = await window.pico.workspace.readFile({ rootPath: workspacePath, relativePath })
      if (typeof content === 'string') {
        setWorkspaceFiles((prev) => ({ ...prev, [relativePath]: content }))
        setSelectedWorkspaceFile(relativePath)
      }
    },
    [workspacePath]
  )

  const handleRun = async (genPrompt: string) => {
    if (!genPrompt.trim() || !hasRun) return
    if (runId && window.pico?.run) {
      await window.pico.run.cancel(runId)
    }
    setError('')
    setLoading(true)
    setEvents([])
    setBaselineCode('')
    setImprovedCode('')
    setPicoInstruction('')
    setCritic(null)
    setBaselinePort(null)
    setImprovedPort(null)
    setArchetype(null)
    agentMessageAddedRef.current = null
    setOriginalPrompt(genPrompt)
    try {
      const { runId: id } = await window.pico!.run.start({
        prompt: genPrompt,
        directionCount: 1,
        workspacePath: workspacePath ?? undefined,
      })
      setRunId(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start run')
    } finally {
      setLoading(false)
    }
  }

  const handlePickFolder = async () => {
    if (!window.pico?.workspace) return
    setWorkspaceLoading(true)
    try {
      const path = await window.pico.workspace.pickFolder()
      if (path) setWorkspacePath(path)
    } finally {
      setWorkspaceLoading(false)
    }
  }

  const handleImprove = async () => {
    if (!baselineCode || !originalPrompt.trim() || !runId || !hasRun) return
    setError('')
    setImproving(true)
    setImprovedCode('')
    setPicoInstruction('')
    setCritic(null)
    setImprovedPort(null)
    setArchetype(null)
    try {
      const result = await window.pico!.run.improve({
        runId,
        baselineCode,
        prompt: originalPrompt,
      })
      if (!result.success) setError(result.error ?? 'Improve failed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Improve failed')
    } finally {
      setImproving(false)
    }
  }

  const handleCancel = useCallback(() => {
    if (runId && window.pico?.run) {
      window.pico.run.cancel(runId)
      setRunId(null)
    }
  }, [runId])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (runId && (loading || improving)) {
          e.preventDefault()
          handleCancel()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [runId, loading, improving, handleCancel])

  const handleApplyPicoFixes = () => {
    if (improvedCode) {
      const codeToApply = improvedCode
      setBaselineCode(codeToApply)
      setImprovedCode('')
      setPicoInstruction('')
      setCritic(null)
      setBaselinePort(null)
      setImprovedPort(null)
      if (runId && window.pico?.preview) {
        void window.pico.preview.refreshBaseline({ runId, code: codeToApply, workspacePath })
      }
    }
  }

  const handleExport = async () => {
    const codeToExport = improvedCode || baselineCode
    if (!codeToExport || !window.pico?.export) return
    setExportStatus('idle')
    const result = await window.pico.export.toWorkspace({ 'App.tsx': codeToExport })
    setExportStatus(result.success ? 'success' : 'error')
    if (result.error) setError(result.error)
    setTimeout(() => setExportStatus('idle'), 2000)
  }

  const handleSend = useCallback(
    (raw: string) => {
      const { target, body } = parseMention(raw)
      const userContent = target ? `@${target} ${body}` : raw
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: userContent, ts: Date.now() }])

      if (target === 'pico') {
        if (baselineCode && runId && originalPrompt.trim()) void handleImprove()
        return
      }
      if (target === 'agent' || !target) {
        const genPrompt = body || raw
        if (genPrompt.trim()) void handleRun(genPrompt)
      }
    },
    [baselineCode, runId, originalPrompt, handleImprove, handleRun]
  )

  menuHandlersRef.current = {
    run: () => (prompt.trim() ? handleRun(prompt) : Promise.resolve()),
    improve: () => handleImprove(),
    cancel: handleCancel,
    pickFolder: handlePickFolder,
    exportCode: handleExport,
    openPreferences: () => setLeftSidebarOpen(true),
  }

  useEffect(() => {
    if (!window.pico?.menu) return
    return window.pico.menu.onAction((action: string) => {
      const handlers = menuHandlersRef.current
      if (!handlers) return

      if (action === 'generate') {
        void handlers.run()
        return
      }
      if (action === 'improve') {
        void handlers.improve()
        return
      }
      if (action === 'cancel') {
        handlers.cancel()
        return
      }
      if (action === 'pick-output-folder') {
        void handlers.pickFolder()
        return
      }
      if (action === 'export') {
        void handlers.exportCode()
        return
      }
      if (action === 'preferences') {
        handlers.openPreferences()
      }
    })
  }, [])

  const handleNewDirection = () => {
    if (prompt.trim() && hasRun) {
      setBaselineCode('')
      setImprovedCode('')
      setPicoInstruction('')
      setCritic(null)
      setBaselinePort(null)
      setImprovedPort(null)
      setArchetype(null)
      handleRun(prompt)
    }
  }

  const filteredEvents = events.filter((e: StreamEvent) => streamFilter.has(e.kind))
  const codexEvents = filteredEvents.filter((e) => e.source === 'codex' || e.source === 'system')
  const picoEvents = filteredEvents.filter((e) => e.source === 'pico' || e.source === 'system')
  const baselinePreviewUrl = baselinePort ? `http://localhost:${baselinePort}` : ''
  const improvedPreviewUrl = improvedPort ? `http://localhost:${improvedPort}` : ''
  const baselinePatchLines = useMemo(
    () => getChangedLineNumbers(baselineCode, improvedCode, 'source'),
    [baselineCode, improvedCode],
  )
  const improvedPatchLines = useMemo(
    () => getChangedLineNumbers(baselineCode, improvedCode, 'target'),
    [baselineCode, improvedCode],
  )

  const outputFiles = Object.keys(workspaceFiles).length > 0 ? workspaceFiles : null
  const agentFiles = outputFiles ?? (effectiveBaselineCode ? { 'App.tsx': effectiveBaselineCode } : {})
  const picoFiles = outputFiles ?? (improvedCode ? { 'App.tsx': improvedCode } : picoInstruction ? { 'PICO_INSTRUCTIONS.md': picoInstruction } : {})

  const uiState: PicoState = {
    agentStatus: loading ? 'running' : baselineCode ? 'done' : 'idle',
    picoStatus: improving ? 'reviewing' : improvedCode ? 'done' : 'idle',
    agentPreviewUrl: baselinePreviewUrl,
    picoPreviewUrl: improvedPreviewUrl,
    agentLogs: codexEvents,
    picoLogs: picoEvents,
    agentView,
    picoView,
  }

  return (
    <div className="h-dvh flex min-h-0 flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      {showDiff && baselineCode && improvedCode && (
        <DiffView
          baseline={baselineCode}
          improved={improvedCode}
          filename="App.tsx"
          onClose={() => setShowDiff(false)}
        />
      )}
      {isDesktop && <DesktopTitleBar />}

      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left sidebar */}
      {leftSidebarOpen ? (
        <aside className="w-[280px] shrink-0 border-r border-neutral-800 bg-neutral-950/70 flex flex-col min-h-0 overflow-y-auto">
          <div className="shrink-0 flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <h1 className="text-sm font-semibold tracking-wide text-neutral-200">Pico</h1>
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              title="Close sidebar"
            >
              <span aria-hidden>‹</span>
            </button>
          </div>
        <div className="p-4 border-b border-neutral-800 space-y-2">
          <button
            onClick={() => void handleImprove()}
            disabled={!baselineCode || improving || loading}
            className="w-full rounded-lg border border-emerald-600 bg-emerald-950/50 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {improving ? 'Reviewing…' : 'Improve'}
          </button>
        </div>
        <div className="p-4 border-b border-neutral-800 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">Workspace</p>
          <button
            onClick={handlePickFolder}
            disabled={workspaceLoading}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
          >
            {workspaceLoading ? 'Picking folder...' : 'Pick output folder'}
          </button>
          <p className="break-all text-[11px] text-neutral-500">
            {workspacePath ?? 'No folder selected. Agent uses current app workspace.'}
          </p>
        </div>
        {workspacePath && (
          <div className="border-b border-neutral-800">
            <p className="shrink-0 px-4 py-2 text-[11px] font-mono uppercase tracking-wide text-neutral-500">
              Files
            </p>
            <div className="max-h-64 overflow-y-auto px-2 pb-4">
              {workspaceFileList.length === 0 ? (
                <p className="px-2 text-xs text-neutral-500">No files</p>
              ) : (
                <ul className="space-y-0.5">
                  {workspaceFileList.map((file) => (
                    <li key={file}>
                      <button
                        type="button"
                        onClick={() => void handleWorkspaceFileClick(file)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono truncate block hover:bg-neutral-800 ${
                          selectedWorkspaceFile === file ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400'
                        }`}
                        title={file}
                      >
                        {file}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {archetype && (
          <div className="p-4 border-b border-neutral-800">
            <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">Archetype</p>
            <span className="mt-1 inline-block rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
              {archetype}
            </span>
          </div>
        )}
        <div className="p-4 border-b border-neutral-800">
          <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">Actions</p>
          <div className="mt-2 space-y-1 text-xs text-neutral-400">
            <button
              onClick={handleNewDirection}
              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-800 hover:text-neutral-200"
            >
              New directions
            </button>
            <button
              onClick={handleApplyPicoFixes}
              disabled={!improvedCode}
              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Pico fixes
            </button>
            <button
              onClick={() => setShowDiff(true)}
              disabled={!baselineCode || !improvedCode}
              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Diff view
            </button>
            <button
              onClick={handleExport}
              disabled={!baselineCode && !improvedCode}
              className="w-full text-left px-2 py-1 rounded hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportStatus === 'success' ? 'Exported!' : exportStatus === 'error' ? 'Export failed' : 'Export'}
            </button>
          </div>
        </div>
        {critic?.score && (
          <div className="p-4 border-b border-neutral-800">
            <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">Scores</p>
            <div className="mt-2 space-y-2">
              {Object.entries(critic.score).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center gap-2">
                  <span className="text-neutral-500 text-xs capitalize shrink-0">{key.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-16 h-1 bg-neutral-700 rounded-full shrink-0">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      />
                    </div>
                    <span className="text-xs shrink-0 w-6">{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </aside>
      ) : (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          className="shrink-0 w-9 border-r border-neutral-800 bg-neutral-950/70 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
          title="Open sidebar"
        >
          <span aria-hidden>›</span>
        </button>
      )}

      <div className="flex-1 flex min-w-0 min-h-0 overflow-hidden flex-col relative">
        {error && (
          <div className="absolute top-2 left-2 right-2 z-20 flex items-center gap-3 rounded-lg border border-red-700/80 bg-red-950/90 px-4 py-3 text-sm text-red-200 shadow-lg">
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              className="shrink-0 rounded px-2 py-1 text-red-400 hover:bg-red-900/50 hover:text-red-100"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex flex-1 min-h-0 overflow-hidden flex-col">
          <div className="flex flex-1 min-h-0 overflow-hidden">
          <Column
            title="Agent"
            subtitle="Baseline output"
            code={effectiveBaselineCode}
            events={uiState.agentLogs}
            status={uiState.agentStatus}
            previewUrl={uiState.agentPreviewUrl}
            files={agentFiles}
            view={uiState.agentView}
            onViewChange={setAgentView}
            patchLines={baselinePatchLines}
            emptyCodeHint="Generate to see baseline code"
            emptyPreviewHint="Generate to see UI preview"
            workspacePath={workspacePath}
            terminalSide="baseline"
            selectedFile={outputFiles ? selectedWorkspaceFile ?? undefined : undefined}
            onFileChange={outputFiles ? setSelectedWorkspaceFile : undefined}
          />
          <div className="w-px shrink-0 bg-neutral-800" />
          <Column
            title="Pico"
            subtitle="Design opinions applied"
            code={improvedCode}
            events={uiState.picoLogs}
            status={uiState.picoStatus}
            previewUrl={uiState.picoPreviewUrl}
            files={picoFiles}
            view={uiState.picoView}
            onViewChange={setPicoView}
            patchLines={improvedPatchLines}
            emptyCodeHint="Click Improve to see improved code"
            emptyPreviewHint="Click Improve to see UI preview"
            workspacePath={workspacePath}
            terminalSide="improved"
            selectedFile={outputFiles ? selectedWorkspaceFile ?? undefined : undefined}
            onFileChange={outputFiles ? setSelectedWorkspaceFile : undefined}
          />
          </div>
        </div>
      </div>

      {/* Right sidebar - Chat */}
      {rightSidebarOpen ? (
        <aside className="w-[280px] shrink-0 border-l border-neutral-800 bg-neutral-950/70 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">Chat</p>
            <button
              onClick={() => setRightSidebarOpen(false)}
              className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              title="Close sidebar"
            >
              <span aria-hidden>›</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ChatPanel
              hasRun={!!hasRun}
              prompt={prompt}
              onPromptChange={setPrompt}
              onSend={handleSend}
              onCancel={handleCancel}
              loading={loading}
              improving={improving}
              runId={runId}
              messages={messages}
            />
          </div>
        </aside>
      ) : (
        <button
          onClick={() => setRightSidebarOpen(true)}
          className="shrink-0 w-9 border-l border-neutral-800 bg-neutral-950/70 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
          title="Open prompt panel"
        >
          <span aria-hidden>‹</span>
        </button>
      )}

      </div>
    </div>
  )
}

function DesktopTitleBar() {
  return (
    <header
      className="flex h-8 items-center border-b border-neutral-800 bg-neutral-950/95 px-2"
      style={{ ['WebkitAppRegion' as string]: 'drag' }}
    >
      <div className="w-[68px]" />
      <div className="flex-1 text-center">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-neutral-400">PICO DESKTOP</p>
      </div>
      <div className="w-[68px]" />
    </header>
  )
}

function prioritizeWorkspaceFiles(fileList: string[]): string[] {
  const preferred = ['src/App.tsx', 'src/main.tsx', 'index.html']
  const allowed = fileList.filter((file) => /\.(tsx?|jsx?|css|html|json|md)$/i.test(file))
  const unique = new Set<string>()
  const ordered: string[] = []

  for (const pref of preferred) {
    if (allowed.includes(pref)) {
      unique.add(pref)
      ordered.push(pref)
    }
  }

  for (const file of allowed) {
    if (unique.has(file)) continue
    unique.add(file)
    ordered.push(file)
  }

  return ordered.slice(0, 60)
}

function Column({
  title,
  subtitle,
  code,
  events,
  status,
  previewUrl,
  files,
  view,
  onViewChange,
  patchLines,
  emptyCodeHint = 'Output code will appear here',
  emptyPreviewHint = 'Output preview will appear here',
  workspacePath,
  terminalSide = 'baseline',
  selectedFile: selectedFileProp,
  onFileChange,
}: {
  title: string
  subtitle: string
  code: string
  events: StreamEvent[]
  status: 'idle' | 'running' | 'reviewing' | 'done'
  previewUrl: string
  files: Record<string, string>
  view: 'ui' | 'code'
  onViewChange: (view: 'ui' | 'code') => void
  patchLines: Set<number>
  emptyCodeHint?: string
  emptyPreviewHint?: string
  workspacePath?: string | null
  terminalSide?: 'baseline' | 'improved'
  selectedFile?: string
  onFileChange?: (file: string) => void
}) {
  const fileNames = Object.keys(files)
  const [activeFile, setActiveFile] = useState(fileNames[0] ?? '')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const selectedFile = selectedFileProp ?? (fileNames.includes(activeFile) ? activeFile : (fileNames[0] ?? ''))
  const displayedCode = files[selectedFile] ?? code
  const handleFileSelect = (file: string) => {
    setActiveFile(file)
    onFileChange?.(file)
  }
  const isHTML = displayedCode.trim().startsWith('<!') || displayedCode.trim().startsWith('<html')

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-neutral-950">
      <div className="shrink-0 flex min-h-14 items-center justify-between border-b border-neutral-800 px-4 py-2">
        <div>
          <p className="text-sm font-medium tracking-wide text-neutral-200">{title}</p>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1">
            <ViewButton active={previewMode === 'desktop'} onClick={() => setPreviewMode('desktop')}>
              Desktop
            </ViewButton>
            <ViewButton active={previewMode === 'mobile'} onClick={() => setPreviewMode('mobile')}>
              Mobile
            </ViewButton>
          </div>
          <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1">
            <ViewButton active={view === 'ui'} onClick={() => onViewChange('ui')}>
              UI
            </ViewButton>
            <ViewButton active={view === 'code'} onClick={() => onViewChange('code')}>
              Code
            </ViewButton>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {view === 'ui' && (
          <div className="flex-1 min-h-0">
            {previewUrl ? (
              <PreviewViewport url={previewUrl} mode={previewMode} title={`${title} preview`} />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center text-neutral-600 text-sm">
                {code ? 'Preview starting...' : emptyPreviewHint}
              </div>
            )}
          </div>
        )}
        {view === 'code' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-neutral-950">
            {fileNames.length > 1 && (
              <div className="shrink-0 border-b border-neutral-800 px-3 py-2">
                <select
                  value={selectedFile}
                  onChange={(e) => handleFileSelect(e.target.value)}
                  className="max-w-xs rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs font-mono text-neutral-200 focus:border-blue-500 focus:outline-none"
                >
                  {fileNames.map((file) => (
                    <option key={file} value={file}>
                      {file}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {displayedCode ? (
              <div className="flex-1 overflow-auto p-3">
                <div className="rounded-lg border border-neutral-800 overflow-hidden">
                  <CodeDisplay
                    code={displayedCode}
                    language={isHTML ? 'html' : 'tsx'}
                    patchLines={patchLines}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center text-neutral-600 text-sm">
                {emptyCodeHint}
              </div>
            )}
          </div>
        )}
      </div>
      <StreamAndTerminal events={events} workspacePath={workspacePath} terminalSide={terminalSide} />
    </div>
  )
}

function PreviewViewport({ url, mode, title }: { url: string; mode: 'desktop' | 'mobile'; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const baseWidth = 390
  const baseHeight = 844

  useEffect(() => {
    if (mode === 'desktop') return
    const element = containerRef.current
    if (!element) return

    const update = () => {
      const { clientWidth, clientHeight } = element
      const next = Math.min(clientWidth / baseWidth, clientHeight / baseHeight)
      setScale(Number.isFinite(next) ? Math.max(0.1, next) : 1)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [mode])

  if (mode === 'desktop') {
    return (
      <div className="h-full w-full overflow-hidden bg-neutral-950">
        <iframe src={url} className="h-full w-full border-0" title={title} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-neutral-950">
      <div className="flex h-full items-start justify-center pt-3">
        <div
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className="overflow-hidden rounded-md border border-neutral-800 bg-white shadow-2xl"
        >
          <iframe src={url} className="h-full w-full border-0" title={title} />
        </div>
      </div>
    </div>
  )
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-11 px-2 py-1 rounded text-xs font-semibold tracking-wide transition-colors ${
        active ? 'bg-neutral-700 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: 'idle' | 'running' | 'reviewing' | 'done' }) {
  if (status === 'idle') return null

  const style =
    status === 'done'
      ? 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50'
      : 'text-amber-300 bg-amber-950/40 border-amber-800/50'
  return <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style}`}>{status}</span>
}

function getChangedLineNumbers(sourceCode: string, targetCode: string, focus: 'source' | 'target'): Set<number> {
  if (!sourceCode || !targetCode) return new Set<number>()
  const parts = diffLines(sourceCode, targetCode)
  const changed = new Set<number>()
  let sourceLine = 1
  let targetLine = 1

  for (const part of parts) {
    const count = part.value.split('\n').length - (part.value.endsWith('\n') ? 1 : 0)
    if (part.added) {
      if (focus === 'target') {
        for (let i = 0; i < count; i += 1) changed.add(targetLine + i)
      }
      targetLine += count
      continue
    }
    if (part.removed) {
      if (focus === 'source') {
        for (let i = 0; i < count; i += 1) changed.add(sourceLine + i)
      }
      sourceLine += count
      continue
    }
    sourceLine += count
    targetLine += count
  }

  return changed
}
