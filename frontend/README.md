# VyaparIQ - Frontend Starter (UI/UX)
> **AI-Powered Business Copilot for Small Businesses (AIVORA 2K26 — AI for Business)**
> **Owner:** Srushti Patil (Frontend UI/UX Lead)

Welcome to the standalone frontend starter for **VyaparIQ**! This package is completely decoupled from the backend repository so you can design, iterate, and refine the UI/UX without requiring local database setups or backend services.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Production Build & Typecheck
```bash
# Verify types and create optimized production bundle
npm run build
```

---

## 🗺️ Application Architecture & Routes

The application features a clean separation between the public landing page and the authenticated business copilot application:

| Route | Type | Description |
|---|---|---|
| `/` | **Public** | High-conversion fintech SaaS landing page with hero headline, interactive dashboard preview, feature pillars, 3-step workflow, and footer. |
| `/dashboard` | **Protected** | Core executive overview with KPI quad, cashflow trends, expense breakdown, prioritized anomaly alert preview, and recent transactions. |
| `/transactions` | **Protected** | Transaction ledger table, search & filter toolbar, CSV statement ingestion modal, and downloadable template generator. |
| `/findings` | **Protected** | Anomaly audit hub displaying severity badges, confidence weights, supporting transaction hashes, and review status (with non-fraud legal disclaimers). |
| `/copilot` | **Protected** | Conversational business copilot with prompt chips, grounded metric cards, and actionable recommendations. |
| `/network` | **Protected** | Interactive SVG relationship graph illustrating counterparty cashflows, vendor-reference linkages, and cluster inspection. |
| `/reports` | **Protected** | Audit and compliance workpapers, reconciliation evidence sheet, one-click CSV export, and PDF generation preview. |

---

## 🎨 Ownership Boundaries (What Srushti Owns)

You have full creative and technical ownership over the frontend presentation and user experience:

| Directory / File | Responsibility |
|---|---|
| `src/pages/*` | Page layouts and composition (`LandingPage`, `DashboardPage`, `TransactionsPage`, `FindingsPage`, `CopilotPage`, `NetworkPage`, `ReportsPage`) |
| `src/components/*` | Reusable UI components (KPI cards, charts, modals, tables, badges, chat bubbles, network canvas) |
| `src/index.css` | Global design system, dark navy fintech palette (`#0B0F19`, `#111827`, cyan `#06B6D4`, violet `#6366F1`), glassmorphism, animations, responsive breakpoints |
| `src/mocks/*` | Offline mock data simulating backend responses (`mockDashboard`, `mockTransactions`, `mockAnomalies`, `mockCopilot`, `mockNetwork`, `mockReports`) |

*(Backend API contracts in `src/types/contracts.types.ts` are managed jointly with the backend team. Do not modify the API contracts without coordinating).*

---

## 🧪 Mock Data vs. Live Backend Mode

By default, the starter operates in **Mock Data Mode** (`VITE_USE_MOCK_DATA=true`). All pages load instant, realistic SME financial figures without needing the backend or MongoDB running.

When you want to test against the live backend:
1. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Set:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_USE_MOCK_DATA=false
   ```
3. The API client in `src/services/api.client.ts` will automatically route calls to the backend server.

---

## 🔐 Clerk Authentication

1. **Mock Dev Mode (Default)**:
   If `VITE_CLERK_PUBLISHABLE_KEY` is left blank in `.env`, the app automatically enables **Developer Mock Mode** (`user_srushti_patil`), allowing you to design and test authenticated views immediately.
2. **Live Clerk Integration**:
   When ready to test live Clerk sign-in/sign-out, obtain the publishable key from the team or your Clerk dashboard and set:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
   The application will automatically activate the official `@clerk/clerk-react` provider and render the `UserButton` widget in the top navigation.

---

## 📊 Features Still Requiring Backend Integration

The following features have complete client-side skeletons and mock implementations in place, with backend endpoints queued:

1. **Production PDF Generation (`POST /api/reports/generate-pdf`)**:
   - The `/reports` page provides instant client-side CSV exports and a high-resolution print dialog (`window.print()`).
   - Server-side Puppeteer/PDFKit compiled PDF generation is a documented backend task.
2. **Production Network Graph Clustering (`GET /api/network/graph`)**:
   - Currently rendered via SVG using structured synthetic counterparty data (`src/mocks/mockNetwork.ts`).
   - Live backend will dynamically construct graph nodes/edges from MongoDB transaction batches.
3. **LLM Live Inferences (`POST /api/copilot/chat`)**:
   - Currently handled via deterministic rule simulation and mock prompt completions in `src/mocks/mockCopilot.ts`.
   - Real LLM API key and LangChain/Gemini service orchestration is handled on the backend.

---

## 📜 Backend API Contracts to Follow

All types are defined in [`src/types/contracts.types.ts`](./src/types/contracts.types.ts):

1. **Dashboard Summary (`GET /api/dashboard/summary`)**:
   - `DashboardSummaryResponse`: `{ period, metrics: { totalRevenue, totalExpenses, netProfit, burnRateOrSavings }, cashflowTrends, topExpenseCategories, recentTransactions, anomalyAlertsCount }`
2. **Transaction Ledger (`GET /api/transactions`)**:
   - Query parameters: `page`, `limit`, `type` (`income` | `expense`), `category`, `search`, `startDate`, `endDate`.
   - Response: `{ transactions: TransactionDTO[], pagination: PaginationMeta }`
3. **CSV Statement Import (`POST /api/transactions/import`)**:
   - Multipart form field: `file` (.csv).
   - Expected columns: `date, type, amount, category, description, reference`.
   - Response: `CsvImportResponse` (`{ totalRows, importedRows, rejectedRows, status, errors, sampleTransactions }`).
4. **CSV Template Download (`GET /api/transactions/template`)**:
   - Downloads sample template CSV with headers and placeholder data.
5. **Anomaly Findings (`GET /api/anomalies`)**:
   - Response: `AnomalyListResponse` (`anomalies: AnomalyFinding[]`, `summary: { total, critical, high, medium, low }`).
6. **AI Copilot Chat (`POST /api/copilot/chat`)**:
   - Request: `{ message: string, context?: { startDate, endDate, category, anomalyId } }`
   - Response: `CopilotChatResponse` (`{ reply, groundedMetrics, suggestedFollowUps, recommendedActions, confidence }`).
