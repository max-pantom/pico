import { CodeDisplay } from './CodeDisplay.tsx'

interface DiffViewProps {
  baseline: string
  improved: string
  filename: string
  onClose: () => void
}

export function DiffView({ baseline, improved, filename, onClose }: DiffViewProps) {
  const isHTML = baseline.trim().startsWith('<!') || baseline.trim().startsWith('<html')
  const lang = isHTML ? 'html' : 'tsx'
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950">
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <p className="text-sm font-mono text-neutral-300">{filename}</p>
        <button
          onClick={onClose}
          className="rounded-lg border border-neutral-600 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col min-w-0">
          <p className="shrink-0 text-xs text-neutral-500 mb-2">Baseline</p>
          <div className="flex-1 rounded-lg border border-neutral-800 overflow-hidden">
            <CodeDisplay code={baseline} language={lang} />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="shrink-0 text-xs text-neutral-500 mb-2">Improved</p>
          <div className="flex-1 rounded-lg border border-neutral-800 overflow-hidden">
            <CodeDisplay code={improved} language={lang} />
          </div>
        </div>
      </div>
    </div>
  )
}
