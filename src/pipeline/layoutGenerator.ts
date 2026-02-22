import type { IntentJSON, DesignDecisions, LayoutNode } from '../types/pipeline'
import { callLLM, extractJSON } from '../lib/llm'

const SYSTEM_PROMPT = `You are a UI engineer building the main content area of an application.
You receive the parsed Intent and the structural Design Decisions.
Your job is to generate the JSON tree for the Main Content area using the available UI components.

AVAILABLE COMPONENTS:
- Header: { title: string, subtitle?: string }
- Tabs: { tabs: string[], activeTab?: number } - Use to organize dense dashboards statically. Must wrap other elements in children.
- Card: { title?: string } - A container for other elements
- StatBlock: { items: string[] } - A grid of metric cards
- MetricCard: { label: string, value: string, trend?: string, trendDirection?: 'up' | 'down' | 'neutral' }
- KPIRow: { items?: { label: string, value: string }[] }
- ChartBlock: { title?: string, type?: 'line' | 'bar' | 'pie' }
- ActivityFeed: { title?: string, events?: string[] }
- DataTable: { title?: string, columns?: string[], rows?: string[][] }
- Button: { label: string, variant?: 'primary' | 'secondary' | 'outline' }
- Input: { placeholder?: string, type?: 'text' | 'number' | 'email', value?: string }
- FormGroup: { label: string } - Must wrap an Input
- Badge: { label: string, variant?: 'success' | 'warning' | 'error' | 'neutral' } - Use for status indicators, especially inside DataTables or Cards
- Divider: { spacing?: 'none' | 'sm' | 'md' | 'lg' } - Use to separate distinct sections

RULES:
1. Return ONLY valid JSON representing an array of LayoutNode objects for the main content area.
2. The root should just be the children of the MainContent area (an array of nodes).
3. **Data Hydration**: You MUST provide high-quality, realistic, domain-specific mock data in the props. Do NOT use generic placeholders like "Item 1" or "Value".
4. Structure the UI logically to achieve the "coreTasks" from the intent. Use Tabs if the tasks are complex and distinct.
5. You can nest components inside Card, Tabs, or FormGroup using the "children" array.

JSON SCHEMA:
Array of objects, where each object has:
{
  "component": "Header" | "Tabs" | "Card" | "StatBlock" | "MetricCard" | "KPIRow" | "ChartBlock" | "ActivityFeed" | "DataTable" | "Button" | "Input" | "FormGroup" | "Badge" | "Divider",
  "props": { ... relevant props based on component ... },
  "children": [ ... nested nodes if applicable ... ] // optional
}

EXAMPLE OUTPUT:
[
  {
    "component": "Header",
    "props": { "title": "SaaS Analytics", "subtitle": "Monthly performance overview" }
  },
  {
    "component": "Tabs",
    "props": { "tabs": ["Overview", "Users", "Settings"] },
    "children": [
      {
        "component": "Card",
        "props": { "title": "Account Status" },
        "children": [
          { "component": "Badge", "props": { "label": "Active", "variant": "success" } },
          { "component": "Divider", "props": { "spacing": "sm" } },
          { "component": "Button", "props": { "label": "Manage Billing", "variant": "secondary" } }
        ]
      }
    ]
  }
]`

export async function generateLayoutVariables(intent: IntentJSON, decisions: DesignDecisions): Promise<LayoutNode[]> {
  const userContent = `Return ONLY valid JSON array.\n\nINPUT:\n${JSON.stringify({ intent, decisions }, null, 2)}`
  const text = await callLLM(SYSTEM_PROMPT, userContent)

  const parseLayoutPayload = (raw: string): LayoutNode[] => {
    const cleanJson = extractJSON(raw)
    const parsed = JSON.parse(cleanJson) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error('Layout payload is not an array')
    }
    return parsed as LayoutNode[]
  }

  try {
    return parseLayoutPayload(text)
  } catch {
    const retryText = await callLLM(
      SYSTEM_PROMPT,
      `Your previous output was invalid. Return ONLY valid JSON array of LayoutNode objects.\n\nINPUT:\n${JSON.stringify({ intent, decisions }, null, 2)}`
    )

    try {
      return parseLayoutPayload(retryText)
    } catch {
      throw new Error(`Layout generator returned invalid JSON after retry: ${retryText}`)
    }
  }
}
