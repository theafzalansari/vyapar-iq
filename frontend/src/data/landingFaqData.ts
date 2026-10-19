export interface FaqItem {
  id: string;
  topicNumber: number;
  question: string;
  answer: string;
  category: 'Platform Overview' | 'Ingestion & Data' | 'Reconciliation & Anomalies' | 'AI & Analytics' | 'Security & Getting Started';
  keywords: string[];
}

export const LANDING_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    topicNumber: 1,
    question: 'What is VyaparIQ?',
    category: 'Platform Overview',
    keywords: ['vyapariq', 'what is vyapariq', 'vyapariq overview', 'platform overview', 'aivora', 'about vyapariq'],
    answer:
      'VyaparIQ is an AI-powered financial intelligence and audit copilot developed for AIVORA 2K26 (AI for Business). Built with React, Vite, TypeScript, Express, and MongoDB, it provides automated CSV transaction reconciliation, explainable deterministic anomaly detection, interactive counterparty network graphs, an evidence-grounded AI copilot, and audit-ready PDF/CSV compliance reports.',
  },
  {
    id: 'faq-2',
    topicNumber: 2,
    question: 'Who is it designed for?',
    category: 'Platform Overview',
    keywords: ['who is it for', 'target audience', 'users', 'msme', 'business owners', 'accountants', 'auditors', 'bookkeepers'],
    answer:
      'VyaparIQ is designed for Indian MSMEs, small business owners, finance operators, bookkeepers, and internal auditors who need transparent, automated ledger auditing, cash flow intelligence, and fraud-risk heuristics without the overhead or complexity of enterprise ERP software.',
  },
  {
    id: 'faq-3',
    topicNumber: 3,
    question: 'What problems does it solve?',
    category: 'Platform Overview',
    keywords: ['problems', 'solves', 'pain points', 'benefits', 'why use', 'manual auditing', 'duplicate payments'],
    answer:
      'VyaparIQ replaces error-prone, manual spreadsheet auditing. It automatically resolves fragmented bank statements, detects rapid duplicate disbursements, exposes suspicious vendor payment loops, calculates rolling cash burn trajectories, and eliminates guesswork with grounded financial conversational insights.',
  },
  {
    id: 'faq-4',
    topicNumber: 4,
    question: 'How does transaction ingestion work?',
    category: 'Ingestion & Data',
    keywords: ['transaction ingestion', 'upload', 'import', 'how to upload', 'csv ingestion', 'drag drop'],
    answer:
      'Users upload standard CSV bank or bookkeeping statements directly via drag-and-drop or file selection. The backend parser cleans numeric amounts, parses variable date formats, enforces schema rules, and computes a cryptographic SHA-256 batch hash to guarantee idempotent uploads (preventing duplicate statement re-importation).',
  },
  {
    id: 'faq-5',
    topicNumber: 5,
    question: 'What CSV data can users upload?',
    category: 'Ingestion & Data',
    keywords: ['csv data', 'columns', 'format', 'template', 'headers', 'csv upload', 'required fields'],
    answer:
      'VyaparIQ accepts standard transaction CSVs containing transaction date, amount, description, transaction type (credit/debit), category, and counterparty/merchant name. A standardized CSV template (vyapariq_transactions_template.csv) is available for direct download within the platform.',
  },
  {
    id: 'faq-6',
    topicNumber: 6,
    question: 'How does financial reconciliation work?',
    category: 'Reconciliation & Anomalies',
    keywords: ['financial reconciliation', 'reconcile', 'calculations', 'net cash flow', 'cash burn', 'burn rate'],
    answer:
      'The deterministic analytics engine aggregates all verified transaction rows across date boundaries. It computes total inflow, total outflow, net balance, operating burn rate, expense category distributions, and 30-day cash flow trajectory lines without black-box estimation.',
  },
  {
    id: 'faq-7',
    topicNumber: 7,
    question: 'What are findings and anomalies?',
    category: 'Reconciliation & Anomalies',
    keywords: ['findings', 'anomalies', 'what are findings', 'discrepancies', 'alerts', 'severity'],
    answer:
      'Findings are specific transaction irregularities detected across your ledger, graded into Critical, High, Medium, and Low severity. Common examples include duplicate disbursements sent to the same vendor within minutes, irregular volume bursts, and unusual weekend payouts.',
  },
  {
    id: 'faq-8',
    topicNumber: 8,
    question: 'How does anomaly detection work?',
    category: 'Reconciliation & Anomalies',
    keywords: ['how anomaly detection works', 'rules', 'heuristics', 'detection engine', 'scoring', 'explainable'],
    answer:
      'VyaparIQ uses an explainable deterministic heuristic engine rather than opaque predictive models. Ingested transactions are evaluated against explicit accounting rules (e.g., time-window duplicate thresholds, frequency deviations, and high-value spikes), producing actionable evidence summaries and confidence scores.',
  },
  {
    id: 'faq-9',
    topicNumber: 9,
    question: 'What is the Counterparty Graph?',
    category: 'AI & Analytics',
    keywords: ['counterparty graph', 'network graph', 'nodes', 'edges', 'visualization', 'vendor links'],
    answer:
      'The Counterparty Graph is an interactive topological visualization that maps financial relationships between your business, vendors, and counterparties. It highlights transaction frequencies, payment volumes, and flagged loops with responsive zoom, pan, and node inspector controls.',
  },
  {
    id: 'faq-10',
    topicNumber: 10,
    question: 'What does Business Copilot do?',
    category: 'AI & Analytics',
    keywords: ['business copilot', 'copilot', 'ai assistant', 'chat', 'grounded answers', 'financial questions'],
    answer:
      'Business Copilot is an evidence-grounded conversational financial copilot. It allows business operators to ask natural language questions about cash flow trends, vendor concentrations, pending anomalies, and expense drivers, citing exact ledger rows and mathematical calculations.',
  },
  {
    id: 'faq-11',
    topicNumber: 11,
    question: 'Does Business Copilot use Google Gemini?',
    category: 'AI & Analytics',
    keywords: ['google gemini', 'gemini', 'gemini-2.5-flash', 'llm', 'ai model', 'genai'],
    answer:
      'Yes. In the authenticated Business Copilot route (/copilot), the backend connects to Google Gemini (gemini-2.5-flash via @google/genai SDK) when configured with a valid GEMINI_API_KEY. If no API key is provided, the copilot gracefully falls back to deterministic rule-based analysis. Note that this landing-page FAQ widget runs entirely locally and does not invoke Gemini.',
  },
  {
    id: 'faq-12',
    topicNumber: 12,
    question: 'What can Audit Reports generate?',
    category: 'AI & Analytics',
    keywords: ['audit reports', 'generate reports', 'report preview', 'statutory report', 'compliance'],
    answer:
      'The Audit Reports module generates formal financial compliance reports containing verified merchant metadata, audit periods, total inflow/outflow balance sheets, categorized expense breakdowns, unresolved anomaly registers, and itemized transaction verification trails with statutory disclaimers.',
  },
  {
    id: 'faq-13',
    topicNumber: 13,
    question: 'Which exports are available?',
    category: 'Ingestion & Data',
    keywords: ['exports', 'download', 'pdf', 'csv export', 'export reports', 'formats'],
    answer:
      'VyaparIQ supports one-click server-side PDF generation (formatted with custom table layouts via PDFKit) and CSV data exports for ledger transactions, detected anomaly findings, and summary balance sheets.',
  },
  {
    id: 'faq-14',
    topicNumber: 14,
    question: 'Does VyaparIQ have light and dark themes?',
    category: 'Platform Overview',
    keywords: ['light dark theme', 'theme', 'dark mode', 'light mode', 'styling', 'colors'],
    answer:
      'Yes. VyaparIQ features a cohesive Precision Forensic Core design system with fully accessible Light and Dark themes. The theme toggle is permanently accessible in the top navigation bar and persists across user sessions via local storage.',
  },
  {
    id: 'faq-15',
    topicNumber: 15,
    question: 'How is company data protected?',
    category: 'Security & Getting Started',
    keywords: ['data protection', 'security', 'privacy', 'isolation', 'tenant', 'safe'],
    answer:
      'Company data is strictly isolated per authenticated user ID across all MongoDB database queries and API endpoints. User Alpha cannot view or access User Beta ledgers. Session tokens are signed via Clerk JWTs, and statement uploads use SHA-256 fingerprinting to prevent replay.',
  },
  {
    id: 'faq-16',
    topicNumber: 16,
    question: 'Does it use Clerk authentication?',
    category: 'Security & Getting Started',
    keywords: ['clerk', 'authentication', 'sign in', 'sign up', 'login', 'credentials', 'auth'],
    answer:
      'Yes. Production authentication and identity management are powered by Clerk (@clerk/clerk-react and @clerk/express). It secures all protected application routes (/dashboard, /transactions, /findings, /copilot, etc.) with encrypted sessions, profile management, and JWT verification.',
  },
  {
    id: 'faq-17',
    topicNumber: 17,
    question: 'Does it store data in MongoDB?',
    category: 'Security & Getting Started',
    keywords: ['mongodb', 'database', 'persistence', 'mongoose', 'storage', 'data store'],
    answer:
      'Yes. VyaparIQ persists users, transactions, audit logs, and anomaly resolution states in MongoDB through Mongoose schemas, with indexed queries ensuring fast retrieval and strict tenant isolation.',
  },
  {
    id: 'faq-18',
    topicNumber: 18,
    question: 'Does an anomaly prove fraud?',
    category: 'Reconciliation & Anomalies',
    keywords: ['prove fraud', 'fraud', 'legal proof', 'statutory', 'disclaimer', 'illicit conduct', 'false positive'],
    answer:
      'No. Anomalies represent statistical heuristics and reconciliation flags designed for human review by business owners and certified accountants. An anomaly highlights an irregular pattern (such as duplicate entries or burst expenditures) but does NOT constitute legal or statutory proof of fraud or illicit activity.',
  },
  {
    id: 'faq-19',
    topicNumber: 19,
    question: 'How does a new user get started?',
    category: 'Security & Getting Started',
    keywords: ['get started', 'how to start', 'onboarding', 'new user', 'create account', 'setup'],
    answer:
      'Getting started takes under two minutes: click "Sign Up" on the landing page to create your secure Clerk account, navigate to "General Ledger" to download the CSV template, upload your business statement, and view your automated reconciliation dashboard immediately.',
  },
  {
    id: 'faq-20',
    topicNumber: 20,
    question: 'Is sample data available?',
    category: 'Ingestion & Data',
    keywords: ['sample data', 'demo data', 'test data', 'synthetic dataset', 'example csv'],
    answer:
      'Yes. The repository includes synthetic transaction fixture datasets (synthetic_anomalies_test.csv) with realistic vendors, normal operating expenses, and injected reconciliation anomalies. You can also download the sample CSV template directly from the landing page or transactions page.',
  },
];

/**
 * Normalizes query string for fuzzy and keyword matching.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'of', 'and', 'or', 'to',
  'can', 'does', 'it', 'my', 'how', 'do', 'i', 'tell', 'me', 'about', 'there',
]);

/**
 * Searches the 20 FAQ items using token overlap, question match, and keyword scoring.
 */
export function matchFaqQuery(userQuery: string): FaqItem | null {
  const normalized = normalizeText(userQuery);
  if (!normalized) return null;

  const rawTokens = normalized.split(' ').filter((t) => t.length > 2);
  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const queryTokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
  if (queryTokens.length === 0) return null;

  let bestMatch: FaqItem | null = null;
  let highestScore = 0;

  for (const item of LANDING_FAQ_ITEMS) {
    let score = 0;
    const normalizedQuestion = normalizeText(item.question);

    // Exact question match
    if (normalizedQuestion === normalized) {
      score += 200;
    } else if (normalizedQuestion.includes(normalized) || normalized.includes(normalizedQuestion)) {
      score += 100;
    }

    // Token match in question
    for (const token of queryTokens) {
      if (normalizedQuestion.includes(token)) {
        score += 25;
      }
    }

    // Keyword match
    for (const kw of item.keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalized.includes(normalizedKw)) {
        score += 40;
      }
      for (const token of queryTokens) {
        if (normalizedKw.includes(token)) {
          score += 15;
        }
      }
    }

    // Partial answer match for specific terms
    const normalizedAnswer = normalizeText(item.answer);
    for (const token of queryTokens) {
      if (normalizedAnswer.includes(token)) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold: at least a reliable keyword/token match
  return highestScore >= 25 ? bestMatch : null;
}
