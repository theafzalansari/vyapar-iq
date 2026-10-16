import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ExternalLink,
  Filter,
  Info,
  Network,
  RotateCcw,
  ShieldAlert,
  UploadCloud,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { StateAlert } from '../components/common/StateAlert';
import { networkService } from '../services/network.service';
import {
  NetworkGraphResponse,
  NetworkNode,
} from '../types/contracts.types';

export const NetworkPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<NetworkGraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'flagged' | 'vendor' | 'customer'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const fetchGraph = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await networkService.getNetworkGraph();
      setData(response);
      if (response.nodes.length > 0) {
        // Default select first flagged entity if available, otherwise first entity
        const flaggedEntity = response.nodes.find(
          (n) => n.severity && n.severity !== 'normal' && (n.type === 'vendor' || n.type === 'customer')
        );
        setSelectedNode(flaggedEntity || response.nodes[0]);
      } else {
        setSelectedNode(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate relationship network graph.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

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

  // Filtered nodes according to active filter
  const visibleNodes = useMemo(() => {
    if (!data) return [];
    if (filterType === 'flagged') {
      return data.nodes.filter(
        (n) => n.severity === 'critical' || n.severity === 'flagged'
      );
    }
    if (filterType === 'vendor') {
      return data.nodes.filter((n) => n.type === 'vendor');
    }
    if (filterType === 'customer') {
      return data.nodes.filter((n) => n.type === 'customer');
    }
    return data.nodes;
  }, [data, filterType]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Edges where both source and target are currently visible
  const visibleEdges = useMemo(() => {
    if (!data) return [];
    return data.edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
  }, [data, visibleNodeIds]);

  // Connected nodes for the inspector of selected node
  const connectedDetails = useMemo(() => {
    if (!selectedNode || !data) return [];
    const directEdges = data.edges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
    return directEdges.map((e) => {
      const otherId = e.source === selectedNode.id ? e.target : e.source;
      const otherNode = data.nodes.find((n) => n.id === otherId);
      return {
        edge: e,
        node: otherNode,
      };
    });
  }, [selectedNode, data]);

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Skeleton height="32px" width="300px" borderRadius="8px" />
          <div style={{ marginTop: '8px' }}>
            <Skeleton height="18px" width="500px" borderRadius="6px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <Skeleton height="80px" borderRadius="12px" />
          <Skeleton height="80px" borderRadius="12px" />
          <Skeleton height="80px" borderRadius="12px" />
          <Skeleton height="80px" borderRadius="12px" />
        </div>
        <Skeleton height="560px" borderRadius="16px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <StateAlert
        type="error"
        title="Network Graph Error"
        message={error || 'Could not load transaction relationships.'}
        onRetry={fetchGraph}
      />
    );
  }

  // Graceful Empty State
  if (data.nodes.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF', marginBottom: '6px' }}>
            Transaction Network Graph
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Interactive structural visualization mapping counterparty relationships, payment frequencies, and transaction clusters.
          </p>
        </div>

        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '680px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              margin: '0 auto 20px',
            }}
          >
            <Network size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '10px' }}>
            No Transaction Relationships Found
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Your ledger does not contain any reconciled transactions yet. Once you import a bank or bookkeeping CSV statement, VyaparIQ will automatically build your counterparty graph, discover vendor linkages, and expose duplicate payment loops.
          </p>

          <button
            onClick={() => navigate('/transactions')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
            }}
          >
            <UploadCloud size={18} />
            <span>Import Transactions Statement</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF' }}>Transaction Network Graph</h1>
            <Badge variant="info">Live User Ledger</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mapping {data.summary.vendorNodes} vendors, {data.summary.customerNodes} counterparties, and {data.summary.flaggedEdges} flagged cross-links.
          </p>
        </div>

        {/* View Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
            title="Zoom In"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              padding: '7px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ZoomIn size={15} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
            title="Zoom Out"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              padding: '7px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ZoomOut size={15} />
          </button>

          {/* Reset View */}
          <button
            onClick={() => {
              setZoomLevel(1.0);
              setFilterType('all');
              setSelectedNode(data.nodes[0] || null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              padding: '7px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
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

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={14} /> View Filter:
        </span>

        <button
          onClick={() => setFilterType('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
            color: filterType === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'all' ? 'transparent' : 'var(--border-card)'}`,
          }}
        >
          All Entities ({data.summary.totalNodes})
        </button>

        <button
          onClick={() => setFilterType('flagged')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'flagged' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)',
            color: filterType === 'flagged' ? '#FCA5A5' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'flagged' ? '#EF4444' : 'var(--border-card)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertTriangle size={13} color="#EF4444" />
          <span>Flagged Only ({data.summary.flaggedNodes})</span>
        </button>

        <button
          onClick={() => setFilterType('vendor')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'vendor' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface)',
            color: filterType === 'vendor' ? '#C4B5FD' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'vendor' ? '#8B5CF6' : 'var(--border-card)'}`,
          }}
        >
          Vendors ({data.summary.vendorNodes})
        </button>

        <button
          onClick={() => setFilterType('customer')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'customer' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
            color: filterType === 'customer' ? '#6EE7B7' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'customer' ? '#10B981' : 'var(--border-card)'}`,
          }}
        >
          Customers ({data.summary.customerNodes})
        </button>
      </div>

      {/* Graph Workspace & Inspector */}
      <div className="network-container">
        {/* SVG Interactive Canvas */}
        <div className="network-canvas-wrap">
          <svg
            viewBox="0 0 850 520"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '520px',
              display: 'block',
              cursor: 'grab',
            }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Transform Group for Zoom */}
            <g
              transform={`scale(${zoomLevel})`}
              style={{
                transformOrigin: '425px 260px',
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* Edges */}
              {visibleEdges.map((edge) => {
                const src = visibleNodes.find((n) => n.id === edge.source);
                const tgt = visibleNodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;

                const isEdgeHighlighted =
                  selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

                const isHoverHighlighted =
                  hoveredNode && (hoveredNode === src.id || hoveredNode === tgt.id);

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
                          : isEdgeHighlighted || isHoverHighlighted
                          ? 'var(--primary)'
                          : 'rgba(255, 255, 255, 0.15)'
                      }
                      strokeWidth={
                        edge.isFlagged
                          ? 2.5
                          : isEdgeHighlighted || isHoverHighlighted
                          ? 2.2
                          : 1.2
                      }
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
              {visibleNodes.map((node) => {
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
            </g>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertTriangle size={12} />
                    <span>{selectedNode.severity.toUpperCase()} ALERT</span>
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

              {selectedNode.amount !== undefined && (
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedNode.type === 'transaction' ? 'Transaction Amount' : 'Cumulative Volume'}
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
                    ₹{selectedNode.amount.toLocaleString('en-IN')}
                  </div>
                  {selectedNode.transactionCount !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedNode.transactionCount} associated transaction{selectedNode.transactionCount === 1 ? '' : 's'}
                    </div>
                  )}
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

              {/* Connected Relationships in Inspector */}
              {connectedDetails.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Direct Graph Connections ({connectedDetails.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                    {connectedDetails.slice(0, 4).map((c, i) => (
                      <div
                        key={i}
                        onClick={() => c.node && setSelectedNode(c.node)}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: c.edge.isFlagged ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                        }}
                      >
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {c.node?.label || 'Node'}
                        </span>
                        <span style={{ color: c.edge.isFlagged ? '#FCA5A5' : 'var(--text-muted)', fontSize: '0.72rem' }}>
                          {c.edge.label || 'Link'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Ledger Quick Filter Action */}
              <button
                onClick={() => {
                  const searchTerm = selectedNode.label.replace(/^[₹\d,.]+\s*/, '').replace(/[()]/g, '').trim();
                  navigate(`/transactions?search=${encodeURIComponent(searchTerm || selectedNode.label)}`);
                }}
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
              <p style={{ fontSize: '0.85rem' }}>
                Click any node on the graph canvas to inspect relationships and reconciliation details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
