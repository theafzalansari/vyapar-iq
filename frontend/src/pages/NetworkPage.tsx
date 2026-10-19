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
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  // Dynamic Bounding Box calculation to prevent any node or label clipping
  const graphBounds = useMemo(() => {
    if (visibleNodes.length === 0) return { minX: 0, minY: 0, width: 850, height: 520 };
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    visibleNodes.forEach((n) => {
      const r = n.type === 'vendor' || n.type === 'customer' ? 24 : 16;
      minX = Math.min(minX, n.x - r - 24);
      maxX = Math.max(maxX, n.x + r + 24);
      minY = Math.min(minY, n.y - r - 20);
      maxY = Math.max(maxY, n.y + r + 42); // label text under node
    });

    const padX = 28;
    const padY = 24;
    const vbX = Math.floor(Math.min(minX - padX, 0));
    const vbY = Math.floor(Math.min(minY - padY, -15));
    const vbW = Math.ceil(Math.max(maxX - vbX + padX, 850));
    const vbH = Math.ceil(Math.max(maxY - vbY + padY, 520));

    return { minX: vbX, minY: vbY, width: vbW, height: vbH };
  }, [visibleNodes]);

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
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
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

          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
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
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>Transaction Network Graph</h1>
            <Badge variant="info">Live User Ledger</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Mapping {data.summary.vendorNodes} vendors, {data.summary.customerNodes} counterparties, and {data.summary.flaggedEdges} flagged cross-links.
          </p>
        </div>

        {/* View Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
            title="Zoom In"
            aria-label="Zoom in graph"
            style={{
              backgroundColor: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--text-primary)',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ZoomIn size={15} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
            title="Zoom Out"
            aria-label="Zoom out graph"
            style={{
              backgroundColor: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--text-primary)',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
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
              setPanOffset({ x: 0, y: 0 });
              setFilterType('all');
              setSelectedNode(data.nodes[0] || null);
            }}
            title="Reset Zoom & Pan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Reset View
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: 'var(--surface-container)',
          border: '1px solid var(--outline-variant)',
          borderLeft: '4px solid var(--warning)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '0.84rem',
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0, color: 'var(--warning)' }} />
        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Accounting Notice:</strong> Graph connections illustrate structural transaction flow patterns and potential reconciliation clusters. Graph relationships do not prove fraudulent or illicit conduct.
        </span>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          <Filter size={14} /> View Filter:
        </span>

        <button
          onClick={() => setFilterType('all')}
          style={{
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'all' ? 'var(--primary)' : 'var(--surface-container)',
            color: filterType === 'all' ? 'var(--on-primary)' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'all' ? 'transparent' : 'var(--outline-variant)'}`,
            transition: 'background-color 0.15s ease',
          }}
        >
          All Entities ({data.summary.totalNodes})
        </button>

        <button
          onClick={() => setFilterType('flagged')}
          style={{
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'flagged' ? 'var(--error)' : 'var(--surface-container)',
            color: filterType === 'flagged' ? 'var(--on-error)' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'flagged' ? 'transparent' : 'var(--outline-variant)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.15s ease',
          }}
        >
          <AlertTriangle size={13} color={filterType === 'flagged' ? 'var(--on-error)' : 'var(--error)'} />
          <span>Flagged Only ({data.summary.flaggedNodes})</span>
        </button>

        <button
          onClick={() => setFilterType('vendor')}
          style={{
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'vendor' ? '#8B5CF6' : 'var(--surface-container)',
            color: filterType === 'vendor' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'vendor' ? 'transparent' : 'var(--outline-variant)'}`,
            transition: 'background-color 0.15s ease',
          }}
        >
          Vendors ({data.summary.vendorNodes})
        </button>

        <button
          onClick={() => setFilterType('customer')}
          style={{
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filterType === 'customer' ? '#10B981' : 'var(--surface-container)',
            color: filterType === 'customer' ? '#FFFFFF' : 'var(--text-secondary)',
            border: `1px solid ${filterType === 'customer' ? 'transparent' : 'var(--outline-variant)'}`,
            transition: 'background-color 0.15s ease',
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
            viewBox={`${graphBounds.minX} ${graphBounds.minY} ${graphBounds.width} ${graphBounds.height}`}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--outline)" strokeOpacity="0.08" strokeWidth="1" />
              </pattern>
            </defs>
            <rect
              x={graphBounds.minX}
              y={graphBounds.minY}
              width={graphBounds.width}
              height={graphBounds.height}
              fill="url(#grid)"
            />

            {/* Transform Group for Zoom & Pan */}
            <g
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
              style={{
                transformOrigin: `${graphBounds.minX + graphBounds.width / 2}px ${graphBounds.minY + graphBounds.height / 2}px`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
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
                          : 'var(--outline)'
                      }
                      strokeOpacity={
                        edge.isFlagged || isEdgeHighlighted || isHoverHighlighted ? 1 : 0.45
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
                        fill={edge.isFlagged ? '#EF4444' : 'var(--text-secondary)'}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
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
                      fill="var(--surface-container-high)"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                    />

                    {/* Node Icon / Initial */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={color}
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
                      fill={isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'}
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
              bottom: '12px',
              left: '12px',
              backgroundColor: 'var(--surface-container-high)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-sm)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Vendor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#06B6D4' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Normal Tx</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Flagged / Loop</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="network-inspector">
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs, 4px)',
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
                      color: selectedNode.severity === 'critical' ? 'var(--error)' : 'var(--warning)',
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

              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>
                {selectedNode.label}
              </h3>

              {selectedNode.category && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Category: <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.category}</strong>
                </div>
              )}

              {selectedNode.amount !== undefined && (
                <div
                  style={{
                    backgroundColor: 'var(--surface-container-high)',
                    border: '1px solid var(--outline-variant)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedNode.type === 'transaction' ? 'Transaction Amount' : 'Cumulative Volume'}
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₹{selectedNode.amount.toLocaleString('en-IN')}
                  </div>
                  {selectedNode.transactionCount !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {selectedNode.transactionCount} associated transaction{selectedNode.transactionCount === 1 ? '' : 's'}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                  Structural Heuristic Analysis
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {selectedNode.details || 'No active anomaly warnings detected on this cluster node.'}
                </p>
              </div>

              {/* Connected Relationships in Inspector */}
              {connectedDetails.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h5 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    Direct Graph Connections ({connectedDetails.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                    {connectedDetails.slice(0, 4).map((c, i) => (
                      <div
                        key={i}
                        onClick={() => c.node && setSelectedNode(c.node)}
                        style={{
                          backgroundColor: 'var(--surface-container-high)',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: c.edge.isFlagged ? '1px solid var(--error)' : '1px solid var(--outline-variant)',
                        }}
                      >
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {c.node?.label || 'Node'}
                        </span>
                        <span style={{ color: c.edge.isFlagged ? 'var(--error)' : 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>
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
                  backgroundColor: 'var(--surface-container-highest)',
                  border: '1px solid var(--outline-variant)',
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
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                Click any node on the graph canvas to inspect relationships and reconciliation details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

