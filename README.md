# Microsoft HealthSync Analytics — Public Health Analytics Platform

A fully operational, browser-native public health analytics application built with vanilla ES modules, Chart.js, and a lightweight pub/sub state management system. No build tools required.

---

## Getting Started

```bash
# Option 1: serve with npx (recommended — required for ES module imports)
npx serve .

# Option 2: Python built-in server
python3 -m http.server 8080

# Then open: http://localhost:8080
```

> **Important:** Serve files over HTTP, not `file://`, because ES modules require CORS headers.

---

## Project Structure

```
/
├── index.html                  ← App entry point
├── src/
│   ├── main.js                 ← App orchestration
│   ├── api/                    ← Async data services (mock with realistic delays)
│   │   ├── healthData.js
│   │   ├── surveillance.js     ← 5% random failure simulation
│   │   ├── social.js           ← Filter support (district, riskMin, search)
│   │   └── copilot.js          ← 10+ AI keyword-matched response scenarios
│   ├── components/             ← UI components
│   │   ├── charts.js           ← Chart.js + skeleton loading + live update
│   │   ├── alerts.js           ← Alert strip with modal, dismiss, badge
│   │   ├── copilotChat.js      ← Chat UI with history, copy, report generator
│   │   ├── interventions.js    ← Approval workflow with confirmation modals
│   │   ├── modals.js           ← Modal + drawer (focus trap, ESC, backdrop)
│   │   ├── toasts.js           ← Bottom-right toast stack
│   │   └── tabs.js             ← Fade transitions + lazy chart initialisation
│   ├── state/
│   │   └── store.js            ← Pub/sub state store (no external libraries)
│   └── utils/
│       ├── counters.js         ← Animated number counter (M/K shorthand)
│       ├── formatters.js       ← Number, date, relative time formatters
│       ├── exportCsv.js        ← CSV blob download
│       └── theme.js            ← Design token colours
├── styles/
│   ├── main.css                ← Base styles, tabs, hero, skeleton, filter bar
│   ├── components.css          ← Toasts, drawers, case UI, risk badges
│   ├── modals.css              ← Modal/drawer animations, focus trap
│   └── responsive.css          ← Media queries (1024/900/600/320px)
├── data/
│   └── mockData.js             ← All mock datasets (ES module export)
└── README.md
```

---

## Architecture

```
index.html → src/main.js
  ├── state/store.js       pub/sub state
  ├── api/*.js             async services → data/mockData.js
  ├── components/*.js      UI, subscribe to store
  └── utils/*.js           pure helpers
```

Data flow: `main.js` loads all data in parallel → stores in `store.js` → components re-render via subscriptions → 30-second auto-refresh repeats the cycle.

---

## Features

| Tab | Interactivity |
|-----|--------------|
| **Population Health** | Animated KPIs, trends chart with AI forecast, risk doughnut, chronic disease drill-down by district, SDOH bars, intervention approval workflow |
| **Disease Surveillance** | Multi-signal chart, map hotspots with tooltips, early warning log, outbreak table with 30-day trajectory drawer, CSV export |
| **Social Services** | Live search/filter bar, case detail drawers with history + notes + escalate, workflow step advancement, outcome scorecards |
| **Copilot for Health** | 10+ AI scenarios, conversation history, copy button, suggestion chips, executive report generator + PDF export |

---

## Connecting Real Data

Replace any function in `src/api/*.js` with a real `fetch()` call. The function signature stays identical — components don't need changes.

```js
// Before (mock):
export async function fetchOutbreaks() {
  await randomDelay();
  return mockData.outbreaks;
}

// After (real API):
export async function fetchOutbreaks() {
  const res = await fetch('/api/v1/outbreaks', { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

---

## Browser Compatibility

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Known Limitations

- Must be served over HTTP (ES modules don't work on `file://`)
- AI responses are keyword-matched, not a real LLM — integrate Azure OpenAI for production
- All data is mock with random variation on each 30-second refresh
- No authentication or server-side persistence
