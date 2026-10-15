import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Info,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { mockNetworkData, NetworkNode } from '../mocks/mockNetwork';

export const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(mockNetworkData.nodes[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeColor = (node: NetworkNode) => {
    if (node.type === 'vendor') return '#8B5CF6'; // Violet
    if (node.type === 'customer') return '#10B981'; // Green
    if (node.severity === 'critical') return '#EF4444'; // Red
    if (node.severity === 'flagged') return '#F59E0B'; // Amber
    return '#06B6D4'; // Cyan
  };

  const getNodeRadius = (node: NetworkNode) => {
    if (node.type === 'vendor' || node.type === 'customer') return 24;
    return 16;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF' }}>Transaction Network Graph</h1>
            <span className="mock-pill">Synthetic Demo Graph</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Interactive structural visualization mapping counterparty relationships, payment frequencies, and transaction clusters.
          </p>
        </div>

        <button
          onClick={() => setSelectedNode(mockNetworkData.nodes[0])}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            padding: '6px 12px',
            borderRadius: '6px',
          }}
        >
          <RotateCcw size={14} /> Reset View
        </button>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '0.82rem',
          color: '#FCD34D',
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Accounting Notice:</strong> Graph connections illustrate structural transaction flow patterns and potential reconciliation clusters. Graph relationships do not prove fraudulent or illicit conduct.
        </span>
      </div>

      {/* Graph Workspace & Inspector */}
      <div className="network-container">
        {/* SVG Interactive Canvas */}
        <div className="network-canvas-wrap">
          <svg
            viewBox="0 0 850 520"
            style={{ width: '100%', height: '100%', minHeight: '520px', display: 'block' }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {mockNetworkData.edges.map((edge) => {
              const src = mockNetworkData.nodes.find((n) => n.id === edge.source);
              const tgt = mockNetworkData.nodes.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              const isEdgeHighlighted =
                selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      edge.isFlagged
                        ? '#EF4444'
                        : isEdgeHighlighted
                        ? 'var(--primary)'
                        : 'rgba(255, 255, 255, 0.15)'
                    }
                    strokeWidth={edge.isFlagged ? 2.5 : isEdgeHighlighted ? 2 : 1.2}
                    strokeDasharray={edge.isFlagged ? '5,5' : 'none'}
                  />
                  {edge.label && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 6}
                      fill={edge.isFlagged ? '#FCA5A5' : 'var(--text-muted)'}
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none' }}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {mockNetworkData.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const color = getNodeColor(node);
              const radius = getNodeRadius(node);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Selection Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.6"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    r={radius}
                    fill="#111827"
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Node Icon / Initial */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#FFFFFF"
                    fontSize={node.type === 'vendor' || node.type === 'customer' ? '12' : '9'}
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.type === 'vendor'
                      ? 'V'
                      : node.type === 'customer'
                      ? 'C'
                      : '₹'}
                  </text>

                  {/* Label under node */}
                  <text
                    textAnchor="middle"
                    y={radius + 16}
                    fill={isSelected ? '#FFFFFF' : 'var(--text-secondary)'}
                    fontSize="10"
                    fontWeight={isSelected ? '700' : '500'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Canvas Floating Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              gap: '16px',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Vendor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06B6D4' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Normal Tx</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Flagged / Loop</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="network-inspector">
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: getNodeColor(selectedNode) + '22',
                    color: getNodeColor(selectedNode),
                    border: `1px solid ${getNodeColor(selectedNode)}44`,
                  }}
                >
                  {selectedNode.type}
                </span>
                {selectedNode.severity && selectedNode.severity !== 'normal' && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: selectedNode.severity === 'critical' ? '#EF4444' : '#F59E0B',
                    }}
                  >
                    • {selectedNode.severity.toUpperCase()} ALERT
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '8px' }}>
                {selectedNode.label}
              </h3>

              {selectedNode.category && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Category: <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.category}</strong>
                </div>
              )}

              {selectedNode.amount && (
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transaction Amount</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
                    ₹{selectedNode.amount.toLocaleString()}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Structural Heuristic Analysis
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedNode.details || 'No active anomaly warnings detected on this cluster node.'}
                </p>
              </div>

              {/* Direct Ledger Quick Filter Action */}
              <button
                onClick={() => navigate(`/transactions?search=${encodeURIComponent(selectedNode.label.split(' ')[0])}`)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <span>Filter Ledger for Entity</span>
                <ExternalLink size={14} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>Click any node on the graph canvas to inspect relationships and reconciliation details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
