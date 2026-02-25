/**
 * CodeDisplay - Memoized code viewer with syntax highlighting.
 * Uses plain text for large files (>300 lines) to avoid performance issues.
 */

import { memo, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const LARGE_CODE_LINE_THRESHOLD = 300

const defaultLineStyle: React.CSSProperties = { display: 'block', width: '100%', background: 'transparent' }
const highlightLineStyle: React.CSSProperties = { display: 'block', width: '100%', background: 'rgba(245, 158, 11, 0.16)' }

export const CodeDisplay = memo(function CodeDisplay({
  code,
  language,
  patchLines = new Set(),
}: {
  code: string
  language: 'tsx' | 'html'
  patchLines?: Set<number>
}) {
  const lineCount = code.split('\n').length
  const usePlainText = lineCount > LARGE_CODE_LINE_THRESHOLD
  const linePropsFn = useCallback(
    (lineNumber: number) => ({
      style: patchLines.has(lineNumber) ? highlightLineStyle : defaultLineStyle,
    }),
    [patchLines]
  )

  if (usePlainText) {
    return (
      <pre className="overflow-x-auto p-3 text-xs font-mono text-neutral-300 bg-[#121214] m-0 min-h-full">
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      showLineNumbers
      customStyle={{
        margin: 0,
        fontSize: '12px',
        background: '#121214',
        minHeight: '100%',
      }}
      lineProps={linePropsFn}
    >
      {code}
    </SyntaxHighlighter>
  )
})
