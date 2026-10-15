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

## 📜 Public API Contracts

Full TypeScript interfaces are exported in [backend/src/types/contracts.types.ts](file:///d:/Hackathon/vyapar-iq/backend/src/types/contracts.types.ts):

1. **CSV Import Contract**:
   - `CsvImportResponse`: `{ batchId, fileName, totalRows, importedRows, rejectedRows, status, errors, sampleTransactions, importedAt }`
2. **Dashboard Summary Contract**:
   - `DashboardSummaryResponse`: `{ period, metrics: { totalRevenue, totalExpenses, netProfit, burnRateOrSavings }, cashflowTrends, topExpenseCategories, recentTransactions, anomalyAlertsCount }`
3. **Anomaly Findings Contract**:
   - `AnomalyListResponse`: List of `AnomalyFinding` items with severity (`critical` | `high` | `medium` | `low`), type (`expense_spike` | `duplicate_payment` | `negative_cashflow` etc.), confidence score, and recommended action.
4. **Copilot Chat Contract**:
   - `CopilotChatRequest`: `{ message, context?: { startDate, endDate, category, anomalyId } }`
   - `CopilotChatResponse`: `{ reply, groundedMetrics, suggestedFollowUps, recommendedActions, confidence, timestamp }`
