/**
 * Auth gate: Sign in with ChatGPT (device code) or API key.
 */

import { useState, useEffect } from 'react'

export function AuthGate() {
  const [mode, setMode] = useState<'choose' | 'deviceCode' | 'apiKey'>('choose')
  const [userCode, setUserCode] = useState('')
  const [verificationUrl, setVerificationUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const api = window.pico
    if (!api) return
    const unsub = api.deviceAuth.onCode(({ userCode: code, verificationUrl: url }) => {
      setUserCode(code)
      setVerificationUrl(url)
    })
    return unsub
  }, [])

  const handleSignInWithChatGPT = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await window.pico!.auth.signInWithChatGPT()
      if (result.success) {
        setMode('choose')
      } else {
        setError(result.error ?? 'Sign-in failed')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignInWithApiKey = async () => {
    setError('')
    if (!apiKey.trim()) {
      setError('Enter your API key')
      return
    }
    setLoading(true)
    try {
      const result = await window.pico!.auth.signInWithApiKey(apiKey.trim())
      if (result.success) {
        setMode('choose')
      } else {
        setError(result.error ?? 'Invalid API key')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'deviceCode') {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">Sign in with ChatGPT</h2>
        <p className="mt-2 text-sm text-neutral-400">
          {userCode ? 'Open the link below, enter the code, and complete sign-in.' : 'Requesting device code...'}
        </p>
        {userCode && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs text-neutral-500">Verification URL</p>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-sm text-blue-400 hover:underline"
              >
                {verificationUrl}
              </a>
            </div>
            <div>
              <p className="text-xs text-neutral-500">One-time code</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded bg-neutral-800 px-3 py-2 font-mono text-lg tracking-wider text-neutral-100">
                  {userCode}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(userCode)}
                  className="rounded bg-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-600"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSignInWithChatGPT}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Waiting...' : 'Retry'}
          </button>
          <button
            onClick={() => setMode('choose')}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Back
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    )
  }

  if (mode === 'apiKey') {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">Use API key</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Get your key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            platform.openai.com
          </a>
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="mt-4 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
        />
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSignInWithApiKey}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Sign in'}
          </button>
          <button
            onClick={() => setMode('choose')}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Back
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-100">Pico</h1>
        <p className="mt-2 text-sm text-neutral-400">Design runtime for coding agents</p>
      </div>
      <div className="mt-8 space-y-3">
        <button
          onClick={async () => {
            setMode('deviceCode')
            setError('')
            const result = await window.pico!.auth.signInWithChatGPT()
            if (!result.success && result.error) setError(result.error)
          }}
          disabled={loading}
          className="w-full rounded-lg bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-100 hover:bg-neutral-700 disabled:opacity-50"
        >
          Sign in with ChatGPT
        </button>
        <button
          onClick={() => setMode('apiKey')}
          className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          Use API key
        </button>
      </div>
      {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
    </div>
  )
}
