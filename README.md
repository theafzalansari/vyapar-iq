# VyaparIQ 🚀
> **AI-Powered Business Copilot for Small Businesses (AIVORA 2K26)**

VyaparIQ is an intelligent financial copilot designed to empower small business owners (SMEs) with automated bookkeeping, hybrid deterministic anomaly detection, and grounded AI insights.

---

## 🏗️ Architecture & Ownership

- **Backend, Database & AI Logic**:
  - Runtime: Node.js + Express (TypeScript)
  - Database: MongoDB + Mongoose ODM
  - Authentication: Clerk (`@clerk/express`)
  - Validation: Zod
  - AI Approach: Hybrid (Deterministic financial analytics & anomaly heuristics + grounded LLM explanations)
- **Frontend UI/UX**:
  - React + Vite + TypeScript (Maintained by **Srushti Patil** via a standalone starter ZIP; no Git repository access required).

---

## 📁 Project Structure

```
vyapar-iq/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB Mongoose connection & lifecycle
│   │   │   └── env.ts              # Zod-validated environment config
│   │   ├── middleware/
│   │   │   ├── auth.ts             # Clerk Express authentication & route protection
│   │   │   ├── errorHandler.ts     # Global JSON error handling (Zod, Mongoose, 500)
│   │   │   └── validate.ts         # Schema validation middleware for body/query/params
│   │   ├── models/
│   │   │   ├── Transaction.ts      # Mongoose Transaction model with compound indexes
│   │   │   └── ImportBatch.ts      # Mongoose ImportBatch model for CSV tracking
│   │   ├── routes/
│   │   │   ├── health.routes.ts    # GET /api/health endpoint
│   │   │   └── index.ts            # Route aggregation & /api/auth/me protected route
│   │   ├── schemas/
│   │   │   ├── transaction.schema.ts  # Zod schemas (create, update, query, CSV row)
│   │   │   ├── importBatch.schema.ts  # Zod schemas for batch tracking
│   │   │   └── copilot.schema.ts      # Zod schemas for AI copilot chat
│   │   ├── types/
│   │   │   ├── api.types.ts        # Common ApiResponse<T>, errors, pagination
│   │   │   ├── contracts.types.ts  # Public API contracts (CSV, Dashboard, Anomalies, Copilot)
│   │   │   └── express.d.ts        # Express Request augmentation (req.userId)
│   │   ├── app.ts                  # Express application setup, CORS, Helmet, Clerk
│   │   └── server.ts               # Server startup listener & graceful shutdown
│   ├── tests/
│   │   ├── health.test.ts          # Health check & 404 handler tests
│   │   ├── schemas.test.ts         # Zod schemas validation tests
│   │   └── auth.test.ts            # Clerk route protection & auth tests
│   ├── .env.example                # Documented environment variables template
│   ├── .gitignore                  # Backend-specific ignore list
│   ├── package.json
│   └── tsconfig.json
├── .gitignore                      # Root Git ignore list
├── package.json                    # Monorepo root scripts
└── README.md                       # Setup and documentation
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | Backend server port | `5000` | No |
| `NODE_ENV` | App environment (`development`, `production`, `test`) | `development` | No |
| `MONGODB_URI` | MongoDB connection string (Local or Atlas) | `mongodb://localhost:27017/vyapariq` | Yes (for data persistence) |
| `CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (`pk_test_...`) | — | Yes (for production auth) |
| `CLERK_SECRET_KEY` | Clerk Secret Key (`sk_test_...`) | — | Yes (for production auth) |
| `FRONTEND_URL` | Allowed CORS frontend origin | `http://localhost:5173` | No |
| `GEMINI_API_KEY` | Google Gemini API Key | — | Yes (for AI Copilot features) |
| `GEMINI_MODEL` | Gemini Model identifier | `gemini-3.5-flash` | No |

> **Development Mode Fallback:** If Clerk keys are not yet configured, the server boots normally, and protected routes can be tested locally using the header `x-mock-user-id: <user_id>`.

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Node.js >= 18 (Tested on Node v24.13.1)
- npm >= 9 (Tested on npm 11.8.0)
- MongoDB instance running locally (or MongoDB Atlas connection string)

### 2. Install Dependencies
From the repository root:
```bash
cd backend
npm install
```

### 3. Build & Run in Development
```bash
# Start backend in watch mode (tsx)
npm run dev

# Or from repository root:
npm run dev:backend
```

The server will be available at `http://localhost:5000`.

### 4. Build for Production
```bash
# Compiles TypeScript to dist/
npm run build

# Start production server
npm start
```

### 5. Run Tests
```bash
# Run unit & integration tests
npm test

# Or from repository root:
npm run test:backend
```

---

## 📡 API Endpoints

### System & Authentication
- **`GET /api/health`** (Public)
  - Returns service status, uptime, environment, and MongoDB connection state (`connected` | `disconnected` | `connecting`).
- **`GET /api/auth/me`** (Protected)
  - Requires Clerk Bearer token (or `x-mock-user-id` in dev/test mode). Returns authenticated user identity.

### Transactions & CSV Ingestion (Milestone 2)
- **`GET /api/transactions/template`** (Public)
  - Downloads a sample CSV template (`date,type,amount,category,description,reference`).
- **`POST /api/transactions/import`** (Protected)
  - Ingests transactions via `multipart/form-data` with form field name `file`.
  - Supports `?allowDuplicate=true` to override duplicate file detection.
- **`GET /api/transactions`** (Protected)
  - Fetches paginated transactions scoped strictly to the authenticated user.
  - Query parameters: `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`.

### Deterministic Financial Analytics (Milestone 3)
- **`GET /api/analytics/summary`** (Protected)
  - Returns cumulative total income, total expenses, net balance (income minus expenses), transaction counts, and currency.
  - Query parameters: `startDate`, `endDate` (optional).
  - Semantics: Ingested net balance is clearly noted and not misrepresented as a total bank balance without opening statement balance.
- **`GET /api/analytics/trends`** (Protected)
  - Returns income, expenses, and net cashflow aggregated chronologically by month or day.
  - Query parameters: `groupBy` (`day` | `month`, default `month`), `startDate`, `endDate` (optional).
- **`GET /api/analytics/categories`** (Protected)
  - Returns category totals, transaction counts, and percentage shares.
  - Query parameters: `type` (`income` | `expense` | `all`, default `all`), `startDate`, `endDate` (optional).
  - Uncategorized rows (missing, null, or whitespace) are safely aggregated as `"Uncategorized"`.

### Explainable Hybrid Anomaly Detection (Milestone 4)
- **`GET /api/anomalies`** (Protected)
  - Fetches detected anomalies scoped to the authenticated user.
  - Query parameters: `severity` (`critical` | `high` | `medium` | `low`), `type` (`duplicate_payment` | `expense_spike` | `irregular_frequency` | `unusual_merchant`), `isResolved` (`true` | `false`), `startDate`, `endDate`, `recompute` (`true` | `false`).
- **`POST /api/anomalies/detect`** (Protected)
  - Triggers or recomputes deterministic anomaly detection scan across user's transactions.
- **`PATCH /api/anomalies/:id/resolve`** (Protected)
  - Updates review status (`isResolved: true/false`) and records reviewer/auditor notes with audit timestamp.

### Gemini Business AI Copilot (Milestone 5)
- **`POST /api/copilot/chat`** (Protected)
  - Evidence-grounded conversational business intelligence powered by Google Gemini.
  - Rate-limited to 30 queries/minute per user. Scoped strictly to authenticated ledger records.
  - Returns grounded metrics, suggested follow-ups, and actionable business recommendations.

---

## 📅 Date Boundary Semantics

All analytics endpoints implement strict, inclusive date boundary filtering:
- **`startDate=YYYY-MM-DD`**: Evaluated inclusively from `00:00:00.000Z` on that day.
- **`endDate=YYYY-MM-DD`**: Evaluated inclusively through `23:59:59.999Z` on that day.
- **Validation**: Enforced via Zod. If `startDate > endDate`, returns `400 VALIDATION_ERROR` with path `startDate`.

---

## 📥 CSV Ingestion & Idempotency Specification

### Accepted Columns
| Column | Type | Required | Description / Example |
|---|---|---|---|
| `date` | String | **Yes** | ISO-8601 (`2026-10-01`), `YYYY-MM-DD`, or `DD-MM-YYYY` |
| `type` | String | **Yes** | `income` or `expense` (case-insensitive) |
| `amount` | Number/String | **Yes** | Positive number, supports commas (e.g. `12500` or `"12,500.00"`) |
| `category` | String | **Yes** | Category name (e.g. `Sales`, `Inventory`, `Rent`, `Utilities`) |
| `description` | String | **Yes** | Transaction description (max 500 chars) |
| `reference` | String | *Optional* | Invoice, cheque, or reference code (e.g. `INV-001`, `PO-982`) |

### Idempotency & Duplicate Upload Strategy
1. **Mechanism**: Every uploaded CSV file buffer is cryptographically hashed using **SHA-256**.
2. **Behavior**: Before processing rows, the system queries `ImportBatch` for an existing batch with the same `userId` and `fileHash`.
   - If found, the request is immediately rejected with **HTTP 409 Conflict** (`code: 'DUPLICATE_UPLOAD'`), returning the previous batch ID and timestamp.
   - To deliberately re-import an identical file, clients can pass `?allowDuplicate=true` or the header `x-allow-duplicate: true`.
3. **Strategy Limitations**:
   - **Byte-sensitivity**: Changing a single space, header capitalization, or row ordering modifies the SHA-256 hash, so partial overlaps cannot be caught by file hash alone.
   - **Filename-insensitivity**: Files with different names but identical content are correctly recognized as duplicate uploads.

---

## 📜 Public API Contracts & Response Examples

Full TypeScript interfaces are exported in [backend/src/types/contracts.types.ts](file:///d:/Hackathon/vyapar-iq/backend/src/types/contracts.types.ts):

### 1. Analytics Summary (`GET /api/analytics/summary`)
```json
{
  "success": true,
  "data": {
    "totalIncome": 43500.75,
    "totalExpenses": 20550.75,
    "netBalance": 22950.0,
    "transactionCount": 7,
    "incomeCount": 3,
    "expenseCount": 4,
    "currency": "INR",
    "period": {
      "startDate": "2026-09-15T10:00:00.000Z",
      "endDate": "2026-10-16T08:00:00.000Z"
    },
    "calculationBasis": "Calculated strictly from 7 ingested transaction(s) in scope (total income minus total expenses). Does not reflect total bank balance without verified opening balance."
  }
}
```

### 2. Analytics Trends (`GET /api/analytics/trends?groupBy=month`)
```json
{
  "success": true,
  "data": {
    "groupBy": "month",
    "period": {
      "startDate": null,
      "endDate": null
    },
    "trends": [
      {
        "period": "2026-09",
        "income": 10000.0,
        "expenses": 2500.5,
        "netCashflow": 7499.5,
        "transactionCount": 2
      },
      {
        "period": "2026-10",
        "income": 33500.75,
        "expenses": 18050.25,
        "netCashflow": 15450.5,
        "transactionCount": 5
      }
    ]
  }
}
```

### 3. Analytics Categories (`GET /api/analytics/categories?type=all`)
```json
{
  "success": true,
  "data": {
    "period": { "startDate": null, "endDate": null },
    "typeFilter": "all",
    "totalIncome": 43500.75,
    "totalExpenses": 20550.75,
    "categories": [
      {
        "category": "Sales",
        "type": "income",
        "totalAmount": 35000.25,
        "transactionCount": 2,
        "percentage": 80.46
      },
      {
        "category": "Rent",
        "type": "expense",
        "totalAmount": 12000.0,
        "transactionCount": 1,
        "percentage": 58.39
      },
      {
        "category": "Uncategorized",
        "type": "expense",
        "totalAmount": 4200.0,
        "transactionCount": 1,
        "percentage": 20.44
      }
    ],
    "breakdown": {
      "income": [
        { "category": "Sales", "type": "income", "totalAmount": 35000.25, "transactionCount": 2, "percentage": 80.46 },
        { "category": "Consulting", "type": "income", "totalAmount": 8500.5, "transactionCount": 1, "percentage": 19.54 }
      ],
      "expenses": [
        { "category": "Rent", "type": "expense", "totalAmount": 12000.0, "transactionCount": 1, "percentage": 58.39 },
        { "category": "Uncategorized", "type": "expense", "totalAmount": 4200.0, "transactionCount": 1, "percentage": 20.44 },
        { "category": "Supplies", "type": "expense", "totalAmount": 2500.5, "transactionCount": 1, "percentage": 12.17 },
        { "category": "Utilities", "type": "expense", "totalAmount": 1850.25, "transactionCount": 1, "percentage": 9.0 }
      ]
    }
  }
}
```

### 4. Anomaly Detection Findings (`GET /api/anomalies`)
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "673f4...",
        "type": "duplicate_payment",
        "severity": "critical",
        "rule": "DUPLICATE_OR_NEAR_DUPLICATE_PAYMENT",
        "title": "Duplicate Payment Detected within 12 Minutes",
        "description": "Two identical payments of ₹3,200 were recorded for \"Cardboard Box Packaging Supplies\" within 12 minutes (Refs: INV-BOX-12, UPI-REF-DUP).",
        "detectedAt": "2026-10-05T13:22:00.000Z",
        "transactionIds": [
          "673f40...",
          "673f41..."
        ],
        "transactionId": "673f41...",
        "affectedAmount": 3200,
        "confidenceScore": 0.94,
        "riskScore": 0.94,
        "isResolved": false,
        "evidence": {
          "duplicateAmount": 3200,
          "descriptionMatch": true,
          "timeDeltaMinutes": 12,
          "timeDeltaHours": 0.2
        }
      }
    ],
    "summary": {
      "total": 1,
      "unresolved": 1,
      "resolved": 0,
      "critical": 1,
      "high": 0,
      "medium": 0,
      "low": 0
    }
  }
}
```

### 5. Copilot Chat Response (`POST /api/copilot/chat`)
```json
{
  "success": true,
  "data": {
    "reply": "Based on your verified ledger records, your total income is **₹50,000** and total expenses are **₹23,200**, leaving a net cash balance of **₹26,800**.\n\nYour highest expenditure category is **Packaging Supplies (₹15,000, 64.7% of total expenses)**, followed by **Utilities at ₹8,200**.\n\n⚠️ Note: An unresolved duplicate payment of ₹3,200 in Utilities was flagged on Oct 5. Reviewing this could save ₹3,200.",
    "groundedMetrics": [
      {
        "metric": "Total Income",
        "value": "₹50,000",
        "basis": "Calculated from 2 verified sales records"
      },
      {
        "metric": "Total Expenses",
        "value": "₹23,200",
        "basis": "Calculated from 3 verified expense records"
      },
      {
        "metric": "Net Balance",
        "value": "₹26,800",
        "basis": "Total Income minus Total Expenses"
      }
    ],
    "suggestedFollowUps": [
      "Which supplier accounted for the most packaging expenses?",
      "Show details of the flagged duplicate payment in Utilities",
      "What steps can reduce our recurring overhead costs?"
    ],
    "recommendedActions": [
      {
        "id": "act_review_packaging",
        "title": "Review Packaging Supplies Supplier Terms",
        "actionType": "review_transactions",
        "payload": { "category": "Packaging" }
      }
    ],
    "confidence": 0.95,
    "timestamp": "2026-10-16T07:50:00.000Z",
    "relatedAnomalies": [
      {
        "id": "6ad189ac0dea...",
        "rule": "DUPLICATE_OR_NEAR_DUPLICATE_PAYMENT",
        "type": "duplicate_payment",
        "severity": "high",
        "title": "Potential Duplicate Payment in Utilities",
        "affectedAmount": 3200,
        "isResolved": false
      }
    ]
  }
}
```

---

## 🧮 Explainable Anomaly Detection Rules & Scoring Model

Every detected anomaly generates a transparent risk score ($0.0 \le \text{Risk Score} \le 1.0$) with documented weights and empirical evidence:

| Rule Key | Anomaly Type | Deterministic Logic | Transparent Risk Scoring Formula | Severity Band |
|---|---|---|---|---|
| `DUPLICATE_OR_NEAR_DUPLICATE_PAYMENT` | `duplicate_payment` | Same user, same amount within 24h, high description similarity (Levenshtein / word token overlap). | $\text{score} = 0.50 \cdot T_{\text{factor}} + 0.35 \cdot D_{\text{factor}} + 0.15 \cdot A_{\text{factor}}$<br>• $T_{\text{factor}} \in [0.5, 1.0]$ based on $\Delta t$<br>• Exact matches $\le 15$ mins boosted to $\ge 0.88$ | Critical ($\le 15$m)<br>High ($\le 1$h)<br>Medium ($> 1$h) |
| `UNUSUAL_EXPENSE_SPIKE` | `expense_spike` | Leave-one-out statistical baseline ($Z \ge 2.0$ standard deviations AND multiplier $M \ge 2.2\times$ average for category, min 3 baseline txns). | $\text{score} = \min(0.96, \max(0.50, 0.40 \cdot \min(1, \frac{Z}{4}) + 0.45 \cdot \min(1, \frac{M}{5}) + 0.15 \cdot A_{\text{factor}}))$ | Critical ($\ge 0.85$)<br>High ($0.70 - 0.85$) |
| `REPEATED_TRANSACTION_BURST` | `irregular_frequency` | Rapid repeated transactions ($\ge 3$ within 24h) with identical amounts. | $\text{score} = 0.72$ (for 3 txns) or $0.85$ (for $\ge 4$ txns) | High / Critical |
| `HIGH_VALUE_UNRECONCILED` | `unusual_merchant` | Outlier single expense $> ₹15,000$ with missing invoice/cheque reference. | Base $\text{score} = 0.65$ | Medium |
| `NEGATIVE_CASHFLOW_VELOCITY` | `irregular_frequency` | Rolling 7-day outflow $> 1.8\times$ inflow and net burn $> ₹10,000$. | Base $\text{score} = 0.80$ | High |

### Severity Thresholds:
- **Critical**: Risk Score $\ge 0.85$
- **High**: $0.70 \le \text{Risk Score} < 0.85$
- **Medium**: $0.50 \le \text{Risk Score} < 0.70$
- **Low**: $\text{Risk Score} < 0.50$

### Audit Lifecycle & Idempotent Fingerprinting:
- Each anomaly is keyed by a deterministic SHA-256 fingerprint: `SHA256(rule + userId + sortedKeyData)`.
- Re-running scans or re-importing statements safely performs an idempotent upsert: unresolved findings are updated with fresh confidence metadata, while user reviews (`isResolved: true`, `resolutionNotes`, `resolvedAt`) are **strictly preserved**.

---

## 🧪 Testing with cURL

### 1. Financial Summary
```bash
# Using development mock user header
curl -X GET "http://localhost:5000/api/analytics/summary" \
  -H "x-mock-user-id: user_srushti_patil"

# With date range filter
curl -X GET "http://localhost:5000/api/analytics/summary?startDate=2026-10-01&endDate=2026-10-15" \
  -H "x-mock-user-id: user_srushti_patil"

# Production Clerk Bearer token
curl -X GET "http://localhost:5000/api/analytics/summary" \
  -H "Authorization: Bearer <CLERK_JWT_SESSION_TOKEN>"
```

### 2. Cashflow Trends
```bash
# Monthly trends
curl -X GET "http://localhost:5000/api/analytics/trends?groupBy=month" \
  -H "x-mock-user-id: user_srushti_patil"

# Daily trends with date boundaries
curl -X GET "http://localhost:5000/api/analytics/trends?groupBy=day&startDate=2026-10-01&endDate=2026-10-15" \
  -H "x-mock-user-id: user_srushti_patil"
```

### 3. Category Breakdown
```bash
# All categories
curl -X GET "http://localhost:5000/api/analytics/categories?type=all" \
  -H "x-mock-user-id: user_srushti_patil"

# Expense categories only
curl -X GET "http://localhost:5000/api/analytics/categories?type=expense" \
  -H "x-mock-user-id: user_srushti_patil"
```

### 4. Anomaly Detection & Review Lifecycle
```bash
# Get all unresolved anomalies
curl -X GET "http://localhost:5000/api/anomalies?isResolved=false" \
  -H "x-mock-user-id: user_srushti_patil"

# Filter by critical severity only
curl -X GET "http://localhost:5000/api/anomalies?severity=critical" \
  -H "x-mock-user-id: user_srushti_patil"

# Trigger on-demand anomaly scan
curl -X POST "http://localhost:5000/api/anomalies/detect" \
  -H "x-mock-user-id: user_srushti_patil"

# Mark an anomaly as resolved with audit review notes
curl -X PATCH "http://localhost:5000/api/anomalies/673f41ab9c/resolve" \
  -H "x-mock-user-id: user_srushti_patil" \
  -H "Content-Type: application/json" \
  -d '{"isResolved": true, "resolutionNotes": "Verified with supplier: double debit refunded on Oct 8"}'
```

### 5. Gemini Business AI Copilot
```bash
# Ask general financial position question
curl -X POST "http://localhost:5000/api/copilot/chat" \
  -H "x-mock-user-id: user_srushti_patil" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is our net balance and what are our biggest expenses?"}'

# Ask for anomaly explanation with context
curl -X POST "http://localhost:5000/api/copilot/chat" \
  -H "x-mock-user-id: user_srushti_patil" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Why was the ₹3,200 packaging expense flagged as an anomaly?",
    "context": { "category": "Packaging" }
  }'
```

---

## 🤖 Gemini AI Copilot Architecture & Security (Milestone 5)

### 1. Hybrid Analytical Model
VyaparIQ adopts a strict separation between deterministic financial computation and generative interpretation:
```
[User Ledger Data] 
       │
       ▼ (Deterministic Execution)
[Analytics & Anomaly Engine] ───► Calculates net balance, category shares, Z-scores, duplicate timestamps
       │
       ▼ (Grounding Layer)
[Verified Evidence Payload]  ───► Sanitized JSON inside <verified_ledger_evidence> boundary
       │
       ▼ (Generative Interpretation)
[Google Gemini API]          ───► Explains patterns, cites verified grounds, suggests human business actions
       │
       ▼ (Zod Output Validation)
[Safe Structured Response]   ───► Validated reply, groundedMetrics[], recommendedActions[], suggestedFollowUps[]
```

### 2. Supported Business Inquiries
The Copilot is engineered to address core business questions grounded in verified data:
- *What are my total income, expenses, and net cash flow?*
- *Which expense categories cost the most?*
- *What unusual transactions were detected?*
- *Explain this anomaly and show its supporting evidence.*
- *What financial changes occurred during the selected period?*
- *What practical steps could help reduce expenses?*
- *Summarize the current business financial position.*

### 3. Enterprise Security & Anti-Prompt-Injection Safeguards
- **Authentication & User Scoping**: Protected by Clerk JWTs in production. Every database query filters strictly by `userId`.
- **Anti-Prompt-Injection Guardrails**: Transaction descriptions and invoice references are treated as untrusted data. HTML/XML tags are stripped, text is truncated, and system instructions explicitly command the model to ignore adversarial instructions or persona overrides embedded within ledger records.
- **No Hallucinated Financials**: Gemini is strictly instructed never to fabricate numbers or claim an anomaly constitutes fraud or criminal misconduct.
- **Shielded Error Handling**: Rate limits (429), timeouts (504), and provider issues (502/503) return clean, typed error envelopes without leaking API keys, tokens, or raw stack traces.
- **In-Memory Rate Limiter**: Enforces a limit of 30 queries/minute per user to protect against automated abuse.

---

## 📂 Synthetic Test Dataset

A reproducible synthetic CSV dataset with real-world edge cases and injected anomalies is provided for testing:
- **Location**: `backend/tests/fixtures/synthetic_anomalies_test.csv`
- **Scenarios Injected**:
  - Baseline business transactions (Sales revenue, rent, office supplies)
  - Duplicate payment: Two ₹3,200 packaging payments within 12 minutes
  - Statistical expense spike: ₹5,400 power bill in Utilities (normal baseline ~₹1,200)
  - Irregular frequency burst: Three ₹1,500 delivery courier debits within 3 hours
  - Unreconciled high-value expense: ₹28,000 equipment payment lacking an invoice reference


