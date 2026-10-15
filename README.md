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

## 📡 API Endpoints (Milestone 1)

### Public Endpoints
- **`GET /api/health`**
  - Returns service status, uptime, environment, and MongoDB connection state (`connected` | `disconnected` | `connecting`).

### Protected Endpoints
- **`GET /api/auth/me`**
  - Requires valid Clerk Bearer token in the `Authorization` header (or `x-mock-user-id` in dev/test mode).
  - Returns authenticated user ID and access confirmation.

---

## 📜 Public API Contracts

Full TypeScript interfaces are exported in [backend/src/types/contracts.types.ts](file:///d:/Hackathon/vyapar-iq/backend/src/types/contracts.types.ts):

1. **CSV Import Contract**:
   - `CsvImportResponse`: `{ batchId, fileName, totalRows, successfulRows, failedRows, errors, sampleTransactions, status }`
2. **Dashboard Summary Contract**:
   - `DashboardSummaryResponse`: `{ period, metrics: { totalRevenue, totalExpenses, netProfit, burnRateOrSavings }, cashflowTrends, topExpenseCategories, recentTransactions, anomalyAlertsCount }`
3. **Anomaly Findings Contract**:
   - `AnomalyListResponse`: List of `AnomalyFinding` items with severity (`critical` | `high` | `medium` | `low`), type (`expense_spike` | `duplicate_payment` | `negative_cashflow` etc.), confidence score, and recommended action.
4. **Copilot Chat Contract**:
   - `CopilotChatRequest`: `{ message, context?: { startDate, endDate, category, anomalyId } }`
   - `CopilotChatResponse`: `{ reply, groundedMetrics, suggestedFollowUps, recommendedActions, confidence, timestamp }`
