export interface NetworkNode {
  id: string;
  label: string;
  type: 'vendor' | 'customer' | 'transaction' | 'reference' | 'account';
  amount?: number;
  category?: string;
  severity?: 'normal' | 'flagged' | 'critical';
  x: number;
  y: number;
  details?: string;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  amount?: number;
  isFlagged?: boolean;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export const mockNetworkData: NetworkGraphData = {
  nodes: [
    // Entities (Vendors & Customers)
    {
      id: 'entity_1',
      label: 'Sri Packaging Corp',
      type: 'vendor',
      category: 'Packaging & Logistics',
      x: 340,
      y: 130,
      details: 'Packaging material vendor. Associated with 2 rapid payments on 9th Oct.',
      severity: 'flagged',
    },
    {
      id: 'entity_2',
      label: 'Pune Wholesale Mart',
      type: 'customer',
      category: 'B2B Wholesale Orders',
      x: 180,
      y: 280,
      details: 'Key B2B buyer in Maharashtra. Regular bulk NEFT settlements.',
      severity: 'normal',
    },
    {
      id: 'entity_3',
      label: 'Sri Balaji Yarn Mills',
      type: 'vendor',
      category: 'Inventory Restocking',
      x: 520,
      y: 220,
      details: 'Raw material supplier for textile inventory. High transaction volume.',
      severity: 'normal',
    },
    {
      id: 'entity_4',
      label: 'Commercial Realty Ltd',
      type: 'vendor',
      category: 'Commercial Rent',
      x: 340,
      y: 380,
      details: 'Monthly warehouse landlord. Cheque reconciliation regular.',
      severity: 'normal',
    },
    {
      id: 'entity_5',
      label: 'MSEDCL Electricity',
      type: 'vendor',
      category: 'Electricity & Utilities',
      x: 640,
      y: 110,
      details: 'State electricity board. October invoice shows 3.4x spike over rolling average.',
      severity: 'flagged',
    },

    // Transaction Nodes
    {
      id: 'tx_node_106',
      label: '₹3,200 (UPI Ref 091)',
      type: 'transaction',
      amount: 3200,
      category: 'Packaging & Logistics',
      x: 230,
      y: 90,
      details: 'Duplicate payment warning: Identical to #tx_107 within 15 minutes.',
      severity: 'critical',
    },
    {
      id: 'tx_node_107',
      label: '₹3,200 (Inv Box 12)',
      type: 'transaction',
      amount: 3200,
      category: 'Packaging & Logistics',
      x: 430,
      y: 70,
      details: 'Original purchase of 100 corrugated boxes.',
      severity: 'normal',
    },
    {
      id: 'tx_node_101',
      label: '₹32,000 (Inv 109)',
      type: 'transaction',
      amount: 3200,
      category: 'B2B Wholesale Orders',
      x: 90,
      y: 350,
      details: 'B2B Wholesale Dispatch NEFT settlement.',
      severity: 'normal',
    },
    {
      id: 'tx_node_102',
      label: '₹24,500 (PO 904)',
      type: 'transaction',
      amount: 24500,
      category: 'Inventory Restocking',
      x: 630,
      y: 280,
      details: 'Vendor payment for Raw Cotton Yarn.',
      severity: 'normal',
    },
    {
      id: 'tx_node_104',
      label: '₹22,000 (Chq 890123)',
      type: 'transaction',
      amount: 22000,
      category: 'Commercial Rent',
      x: 450,
      y: 440,
      details: 'Warehouse rent payment cleared on 12th Oct.',
      severity: 'normal',
    },
    {
      id: 'tx_node_105',
      label: '₹4,850 (MSEDCL 8821)',
      type: 'transaction',
      amount: 4850,
      category: 'Electricity & Utilities',
      x: 740,
      y: 190,
      details: 'Commercial electricity bill with tariff surcharge.',
      severity: 'flagged',
    },
  ],
  edges: [
    // Edges between entity and transactions
    { id: 'e1', source: 'entity_1', target: 'tx_node_106', label: 'Duplicate?', isFlagged: true },
    { id: 'e2', source: 'entity_1', target: 'tx_node_107', label: 'Payment' },
    { id: 'e3', source: 'entity_2', target: 'tx_node_101', label: 'Receivable' },
    { id: 'e4', source: 'entity_3', target: 'tx_node_102', label: 'Payment' },
    { id: 'e5', source: 'entity_4', target: 'tx_node_104', label: 'Cheque' },
    { id: 'e6', source: 'entity_5', target: 'tx_node_105', label: 'Spike (3.4x)', isFlagged: true },
    // Cross-link showing potential duplicate loop
    { id: 'e7', source: 'tx_node_106', target: 'tx_node_107', label: 'Identical Amount (15m)', isFlagged: true },
  ],
};
