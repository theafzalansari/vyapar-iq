import { CopilotChatResponse } from '../types/contracts.types';

export const mockCopilotSamplePrompts = [
  'What was our biggest expense category in the last 15 days?',
  'Why did electricity expenses jump this month?',
  'Are there any unaddressed duplicate payments?',
  'Calculate our estimated profit margin for October',
  'What should I prioritize before releasing supplier payments?',
];

export const mockDefaultCopilotResponse = (message: string): CopilotChatResponse => {
  const lower = message.toLowerCase();

  if (lower.includes('expense') || lower.includes('biggest') || lower.includes('category')) {
    return {
      reply: 'Based on your transaction records for October 2026, **Inventory Restocking** represents your largest expenditure at **₹48,000 (48.8% of total expenses)** across 6 purchase orders, followed by **Commercial Rent at ₹22,000 (22.4%)**.',
      groundedMetrics: [
        { metric: 'Top Expense Category', value: 'Inventory (₹48,000)', basis: 'Calculated from 10 transactions in Oct 2026' },
        { metric: 'Total Operating Costs', value: '₹98,250', basis: '6.4% lower than Sept historical average' },
      ],
      suggestedFollowUps: [
        'Break down inventory purchases by vendor',
        'Check upcoming vendor payment due dates',
      ],
      recommendedActions: [
        {
          id: 'act_01',
          title: 'Review Inventory Supplier Terms',
          actionType: 'review_transactions',
          payload: { category: 'Inventory Restocking' },
        },
      ],
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('duplicate') || lower.includes('anomaly') || lower.includes('warning')) {
    return {
      reply: 'We flagged a potential **duplicate payment anomaly on 9th Oct**: two consecutive payments of ₹3,200 were made for "Packaging Boxes Restock" (INV-BOX-12 and UPI-REF-091) within 15 minutes. One remains unresolved.',
      groundedMetrics: [
        { metric: 'Potential Overpayment', value: '₹3,200', basis: 'Identical amount & vendor detected in batch' },
      ],
      suggestedFollowUps: [
        'How do I claim a refund for the duplicate transaction?',
        'Show all flagged transactions for October',
      ],
      recommendedActions: [
        {
          id: 'act_02',
          title: 'Review Flagged Anomaly #anom_001',
          actionType: 'review_transactions',
          payload: { anomalyId: 'anom_001' },
        },
      ],
      confidence: 0.98,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    reply: `Here is a grounded financial summary for your business:\n\n- **Total Revenue (MTD)**: ₹1,84,500 (+14.2% vs previous period)\n- **Operating Expenses**: ₹98,250\n- **Net Operating Profit**: ₹86,250 (46.7% profit margin)\n- **Liquid Cash Buffer**: ₹64,000\n\nYour cash flow is strong, but you have 1 high-priority duplicate payment anomaly requiring vendor verification.`,
    groundedMetrics: [
      { metric: 'Net Profit Margin', value: '46.7%', basis: '₹86,250 net on ₹1,84,500 revenue' },
      { metric: 'Open Anomalies', value: '3 Active Alerts', basis: '1 Critical, 1 High, 1 Low' },
    ],
    suggestedFollowUps: [
      'What are my projected expenses for next week?',
      'Show me cashflow trends over the last 6 months',
    ],
    recommendedActions: [
      {
        id: 'act_03',
        title: 'Export Monthly Statement',
        actionType: 'export_report',
      },
    ],
    confidence: 0.92,
    timestamp: new Date().toISOString(),
  };
};
