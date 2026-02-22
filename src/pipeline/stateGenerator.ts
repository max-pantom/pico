import type { IntentJSON, DesignDecisions, LayoutNode, AppState } from '../types/pipeline'
import { callLLM, extractJSON } from '../lib/llm'

const SYSTEM_PROMPT = `You are a Senior React Engineer. 
Your job is to analyze the user's Intent, the Design Decisions, and the generated Layout Node Tree.
Based on the UI components used (like Buttons and Inputs), you must infer what React application state is needed to make the UI functional.

RULES:
1. Return ONLY valid JSON representing the "AppState" object.
2. Provide an array of "variables". These correspond to useState hooks. Provide a descriptive name, type (e.g. "string", "number", "boolean", or a more complex TypeScript array/object type), and a literal initialValue.
3. Provide an array of "handlers". These correspond to event callback functions (e.g., onClick). Provide a descriptive name, a list of parameters, and the JavaScript body logic for that function. The body logic should update the state variables you defined.

JSON SCHEMA:
{
  "variables": [
    { "name": "string", "type": "string", "initialValue": any }
  ],
  "handlers": [
    { "name": "string", "parameters": ["string"], "body": "string" }
  ]
}

EXAMPLE: 
If the UI has an Input and a Button to "Add Todo":
{
  "variables": [
    { "name": "todos", "type": "Array<{id: string, text: string}>", "initialValue": [] },
    { "name": "inputValue", "type": "string", "initialValue": "" }
  ],
  "handlers": [
    { 
      "name": "handleAddTodo", 
      "parameters": [], 
      "body": "if (!inputValue) return; setTodos([...todos, { id: String(Date.now()), text: inputValue }]); setInputValue('');" 
    }
  ]
}`

export async function generateAppState(
    intent: IntentJSON,
    decisions: DesignDecisions,
    layout: LayoutNode[]
): Promise<AppState> {
    const userContent = JSON.stringify({
        intent,
        decisions,
        layout
    }, null, 2)

    const text = await callLLM(SYSTEM_PROMPT, userContent)
    const cleanJson = extractJSON(text)

    try {
        return JSON.parse(cleanJson) as AppState
    } catch {
        throw new Error(`State generator returned invalid JSON: ${text}`)
    }
}
