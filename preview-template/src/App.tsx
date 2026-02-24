const navItems = ['Docs', 'Pricing', 'FAQ', 'Status']
const highlights = [
  {
    title: 'Credits as currency',
    description: 'Every request maps to a transparent credit cost with live estimates, refunds, and caps.',
  },
  {
    title: 'Realtime ledgers',
    description: 'Stream usage events into your own dashboards with idempotent webhooks and replay.',
  },
  {
    title: 'Guardrails built-in',
    description: 'Set org limits, per-key budgets, and alert thresholds without shipping extra code.',
  },
]
const steps = [
  {
    title: 'Provision',
    description: 'Create keys, assign budgets, and attach them to workspaces or end customers.',
  },
  {
    title: 'Spend',
    description: 'Each API call debits credits based on model, payload size, and priority tier.',
  },
  {
    title: 'Reconcile',
    description: 'Sync usage every minute to keep billing and analytics perfectly aligned.',
  },
]
const tiers = [
  {
    name: 'Starter',
    price: '$99',
    credits: '120k credits',
    overage: '$0.0012 / credit',
    emphasis: false,
  },
  {
    name: 'Growth',
    price: '$349',
    credits: '550k credits',
    overage: '$0.0010 / credit',
    emphasis: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    credits: '2M+ credits',
    overage: 'Volume pricing',
    emphasis: false,
  },
]
const endpoints = [
  {
    method: 'POST',
    path: '/v1/credits/estimate',
    detail: 'Predict credit spend before you send a request.',
  },
  {
    method: 'POST',
    path: '/v1/credits/charge',
    detail: 'Charge credits and get a ledger receipt id.',
  },
  {
    method: 'GET',
    path: '/v1/usage/summary',
    detail: 'Aggregate usage by key, team, or customer.',
  },
]
const faqs = [
  {
    question: 'How do credit rates map to compute?',
    answer: 'Each endpoint publishes a base credit rate plus modifiers for payload size and priority tiers.',
  },
  {
    question: 'Do unused credits roll over?',
    answer: 'Starter and Growth plans roll credits for 60 days, Scale plans are fully custom.',
  },
  {
    question: 'Can I cap spend per customer?',
    answer: 'Yes, set caps per API key or per customer id with real-time enforcement.',
  },
]

export default function App() {
  return (
    <div className="page">
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <header className="nav">
        <div className="brand">
          <span className="brand-mark">CR</span>
          CreditRail API
        </div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">
              {item}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="ghost-button">Sign in</button>
          <button className="primary-button">Get API key</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">Credit-based billing for APIs</span>
            <h1>
              Meter every request with precision credits your developers can predict.
            </h1>
            <p>
              CreditRail gives developer teams a programmable credit ledger, usage estimates, and real-time spend controls.
              Replace flaky rate-limit math with a single credit system that scales across products.
            </p>
            <div className="cta-row">
              <button className="primary-button">Start with free sandbox</button>
              <button className="secondary-button">View docs</button>
            </div>
            <div className="hero-metrics">
              <div>
                <strong>99.99%</strong>
                <span>uptime SLA</span>
              </div>
              <div>
                <strong>40ms</strong>
                <span>avg debit latency</span>
              </div>
              <div>
                <strong>200+</strong>
                <span>teams shipping</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="credit-card">
              <div className="credit-header">
                <div>
                  <p className="eyebrow">Current balance</p>
                  <h2>72,450 credits</h2>
                </div>
                <span className="status-pill">Live</span>
              </div>
              <div className="meter">
                <div className="meter-bar" />
              </div>
              <div className="credit-grid">
                <div>
                  <p>Daily budget</p>
                  <strong>5,000</strong>
                </div>
                <div>
                  <p>Spend today</p>
                  <strong>3,210</strong>
                </div>
                <div>
                  <p>Alerts</p>
                  <strong>2 active</strong>
                </div>
              </div>
            </div>
            <div className="code-card">
              <div className="code-title">Quick charge</div>
              <pre>
                <code>{`curl https://api.creditrail.dev/v1/credits/charge \\
  -H "Authorization: Bearer $CR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "summarize",
    "credits": 24,
    "customer_id": "acme-009"
  }'`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="highlight-grid" id="docs">
          {highlights.map((item, index) => (
            <article key={item.title} className="card reveal" style={{ animationDelay: `${index * 0.1}s` }}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </section>

        <section className="flow">
          <div className="section-heading">
            <p className="eyebrow">How credits move</p>
            <h2>Build billing logic once, reuse everywhere.</h2>
            <p>
              The credit engine unifies usage tracking, budget enforcement, and reconciliation across all developer
              products.
            </p>
          </div>
          <div className="flow-steps">
            {steps.map((step, index) => (
              <div key={step.title} className="step-card reveal" style={{ animationDelay: `${index * 0.15}s` }}>
                <span className="step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="section-heading">
            <p className="eyebrow">Usage-based pricing</p>
            <h2>Predictable tiers with transparent overage.</h2>
          </div>
          <div className="pricing-grid">
            {tiers.map((tier) => (
              <article key={tier.name} className={`price-card ${tier.emphasis ? 'price-card--emphasis' : ''}`}>
                <div className="price-top">
                  <h3>{tier.name}</h3>
                  <span className="price">{tier.price}</span>
                </div>
                <p className="price-credits">{tier.credits}</p>
                <p className="price-overage">{tier.overage}</p>
                <ul className="price-list">
                  <li>Real-time ledger</li>
                  <li>Budget guardrails</li>
                  <li>Team + customer tagging</li>
                </ul>
                <button className={tier.emphasis ? 'primary-button' : 'secondary-button'}>
                  {tier.emphasis ? 'Start Growth' : 'Talk to sales'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="api-section">
          <div className="api-content">
            <div>
              <p className="eyebrow">Endpoints</p>
              <h2>Everything you need for credit metering.</h2>
              <p>
                Consistent request signatures across usage estimation, charging, and reporting, with OpenAPI specs
                maintained on every release.
              </p>
              <div className="endpoint-list">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.path} className="endpoint">
                    <span className="method">{endpoint.method}</span>
                    <div>
                      <strong>{endpoint.path}</strong>
                      <p>{endpoint.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="api-card">
              <div className="api-card-header">
                <span>Ledger response</span>
                <span className="badge">200 OK</span>
              </div>
              <pre>
                <code>{`{
  "receipt_id": "cr_24f81",
  "credits_charged": 24,
  "balance_remaining": 72450,
  "budget_status": "safe",
  "usage_window": "2025-09-10T18:24:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="stack-section">
          <div className="stack-card">
            <h3>SDKs that feel native</h3>
            <p>Type-safe clients for Node, Python, and Go with built-in retries and request signing.</p>
            <div className="stack-tags">
              <span>Node.js</span>
              <span>Python</span>
              <span>Go</span>
              <span>Rust</span>
            </div>
          </div>
          <div className="stack-card">
            <h3>Compliance ready</h3>
            <p>Audit-grade logs, SOC 2 Type II controls, and IP allowlists for enterprise teams.</p>
            <div className="stack-tags">
              <span>SOC 2</span>
              <span>PCI-friendly</span>
              <span>Regional data</span>
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2>Questions developers ask first.</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <div key={faq.question} className="faq-card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer" id="status">
        <div>
          <h2>Give your API a credit backbone.</h2>
          <p>Launch your credit ledger in hours, not weeks.</p>
        </div>
        <button className="primary-button">Request a demo</button>
      </footer>
    </div>
  )
}
