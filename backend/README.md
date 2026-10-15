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
```
