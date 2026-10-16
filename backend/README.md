# VyaparIQ - Backend (API & Deterministic Engine)
> **AI-Powered Business Copilot for Small Businesses (AIVORA 2K26)**

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Build & Tests
```bash
npm run build
npm test
```

---

## 📡 API Endpoints

### 1. Health & Auth
- **`GET /api/health`** (Public): System health and MongoDB connection state.
- **`GET /api/auth/me`** (Protected): Verification of authenticated Clerk user identity.

### 2. Transactions & CSV Ingestion (Milestone 2)
- **`GET /api/transactions/template`** (Public): Download CSV ingestion template.
- **`POST /api/transactions/import`** (Protected): Ingest multipart CSV statement.
- **`GET /api/transactions`** (Protected): Paginated transactions scoped to authenticated user.

### 3. Deterministic Financial Analytics (Milestone 3)
- **`GET /api/analytics/summary`** (Protected): Cumulative income, expenses, net balance, transaction counts, and currency.
  - Query params: `startDate`, `endDate`.
- **`GET /api/analytics/trends`** (Protected): Chronologically grouped income, expenses, and net cashflow.
  - Query params: `groupBy` (`day` | `month`), `startDate`, `endDate`.
- **`GET /api/analytics/categories`** (Protected): Income & expense breakdown by category with percentage share.
  - Query params: `type` (`income` | `expense` | `all`), `startDate`, `endDate`.
  - Uncategorized records (null, empty, whitespace) are mapped to `"Uncategorized"`.

### 4. Explainable Hybrid Anomaly Detection (Milestone 4)
- **`GET /api/anomalies`** (Protected): List detected anomalies scoped to the authenticated user.
  - Query params: `severity` (`critical` | `high` | `medium` | `low`), `type`, `isResolved` (`true` | `false`), `startDate`, `endDate`, `recompute` (`true` | `false`).
- **`POST /api/anomalies/detect`** (Protected): Trigger anomaly scan or force recompute.
- **`PATCH /api/anomalies/:id/resolve`** (Protected): Update audit review status and resolution notes.

### 5. Gemini Business AI Copilot (Milestone 5)
- **`POST /api/copilot/chat`** (Protected): Conversational grounded financial query engine.
  - Rate limited to 30 requests/minute per authenticated user.
  - Grounded strictly in deterministic metrics and verified anomalies.
  - Mitigates prompt injection via XML boundary isolation and strict input sanitization.

---

## 🧮 Anomaly Scoring Formula & Rules

Every anomaly finding generates a deterministic, transparent risk score ($0.0 \le \text{score} \le 1.0$) and an evidence map:

| Rule ID | Name | Trigger Condition | Scoring Formula / Weights | Severity Band |
|---|---|---|---|---|
| `DUPLICATE_OR_NEAR_DUPLICATE_PAYMENT` | Duplicate Payment | Same amount within 24h & high description similarity | $0.50 \times \text{timeFactor} + 0.35 \times \text{descFactor} + 0.15 \times \text{amountFactor}$ (Boosted to $\ge 0.88$ if $\le 15$ min) | Critical ($\le 15$m) / High / Medium |
| `UNUSUAL_EXPENSE_SPIKE` | Expense Spike | Category $Z$-score $\ge 2.0$ & Multiplier $M \ge 2.2\times$ (leave-one-out baseline) | $0.40 \times \min(1, \frac{Z}{4}) + 0.45 \times \min(1, \frac{M}{5}) + 0.15 \times \text{amountFactor}$ | Critical ($\ge 0.85$) / High |
| `REPEATED_TRANSACTION_BURST` | Repeated Bursts | $\ge 3$ transactions with same amount within 24h | Fixed $0.72$ for 3 transactions; $0.85$ for $\ge 4$ | High / Critical |
| `HIGH_VALUE_UNRECONCILED` | Missing Reference | Single expense $> ₹15,000$ lacking invoice/cheque reference | Fixed $0.65$ base score | Medium |
| `NEGATIVE_CASHFLOW_VELOCITY` | Outflow Velocity | Rolling 7-day outflow $> 1.8\times$ inflow (and net negative $> ₹10,000$) | Fixed $0.80$ base score | High |

### Severity Thresholds:
- **Critical**: Risk Score $\ge 0.85$
- **High**: $0.70 \le \text{Risk Score} < 0.85$
- **Medium**: $0.50 \le \text{Risk Score} < 0.70$
- **Low**: $\text{Risk Score} < 0.50$

### Resolution & Idempotency:
- Findings are deduplicated and tracked via an invariant SHA-256 fingerprint (`rule:userId:keys`).
- Re-scanning preserves previously resolved statuses (`isResolved: true`, `resolutionNotes`, `resolvedAt`).

---

## 📅 Date Boundary Semantics
- `startDate=YYYY-MM-DD`: Inclusive from `00:00:00.000Z`.
- `endDate=YYYY-MM-DD`: Inclusive through `23:59:59.999Z`.
- Rejects `startDate > endDate` with 400 validation error.

---

## 🧪 Testing with cURL

```bash
# 1. Summary
curl -X GET "http://localhost:5000/api/analytics/summary" -H "x-mock-user-id: user_srushti_patil"

# 2. Trends (Monthly)
curl -X GET "http://localhost:5000/api/analytics/trends?groupBy=month" -H "x-mock-user-id: user_srushti_patil"

# 3. Categories
curl -X GET "http://localhost:5000/api/analytics/categories?type=all" -H "x-mock-user-id: user_srushti_patil"

# 4. Get Anomalies (Filtered by unresolved)
curl -X GET "http://localhost:5000/api/anomalies?isResolved=false" -H "x-mock-user-id: user_srushti_patil"

# 5. Trigger Re-scan
curl -X POST "http://localhost:5000/api/anomalies/detect" -H "x-mock-user-id: user_srushti_patil"

# 6. Resolve Anomaly
curl -X PATCH "http://localhost:5000/api/anomalies/<ANOMALY_ID>/resolve" \
  -H "x-mock-user-id: user_srushti_patil" \
  -H "Content-Type: application/json" \
  -d '{"isResolved": true, "resolutionNotes": "Verified with vendor invoice #INV-982"}'

# 7. Ask Business AI Copilot
curl -X POST "http://localhost:5000/api/copilot/chat" \
  -H "x-mock-user-id: user_srushti_patil" \
  -H "Content-Type: application/json" \
  -d '{"message": "What were my top expense categories and why did Utilities spike?"}'
```

---

## 🤖 Google Gemini AI Copilot Configuration (Milestone 5)

### 1. Environment Setup
Add the following to `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```
> Obtain your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Hybrid AI Architecture & Grounding
- **Deterministic Analytics Engine**: Aggregates income, expenses, category breakdowns, and flags anomalies (duplicates, spikes, bursts).
- **Grounding Layer**: Constructs a minimal, sanitized evidence payload (`<verified_ledger_evidence>`) scoped exclusively to the authenticated user.
- **Google Gemini API**: Interprets the user query, references verified ledger metrics, explains patterns, and suggests practical business actions without hallucinating numbers.

### 3. Security & Anti-Prompt-Injection
- **User Scoping**: Every database lookup is strictly filtered by `userId`.
- **Untrusted Data Sanitization**: Transaction descriptions and references strip tag syntax (`<`, `>`) and are framed as literal text.
- **System Guardrails**: System instructions explicitly mandate that ledger data must never be executed as instructions or jailbreaks.
- **Safe Error Shielding**: Quotas, timeouts, and provider errors return structured API codes (`GEMINI_RATE_LIMITED`, `GEMINI_TIMEOUT`, `GEMINI_PROVIDER_ERROR`) without leaking keys or stack traces.

---

## 📂 Synthetic Test Dataset
A synthetic CSV test file with seeded normal baselines and injected anomalies is available at:
`backend/tests/fixtures/synthetic_anomalies_test.csv`
It contains 14 rows demonstrating:
- Clean baseline expenses & revenue
- Duplicate ₹3,200 payment within 12 minutes
- 4.5× Electricity spike in Utilities
- Repeated 3× ₹1,500 courier burst within 3 hours
- ₹28,000 unreconciled equipment expense without invoice reference


