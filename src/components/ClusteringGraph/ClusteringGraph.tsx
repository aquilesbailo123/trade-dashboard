import React, { useState, useMemo } from 'react';
import type { Transaction as ApiTransaction } from '../../api/queries';
import './ClusteringGraph.css';

// Transaction data structure - extend API type with UI specific properties
type Transaction = ApiTransaction & {
  risk?: 'low' | 'medium' | 'high';
  x?: number;
  y?: number;
  isOutlier?: boolean;
  contractType?: string; // Added for mock data generation
};

interface ClusteringGraphProps {
  onTransactionClick?: (transaction: Transaction) => void;
  width?: number;
  height?: number;
}

const ClusteringGraph: React.FC<ClusteringGraphProps> = ({ onTransactionClick, width: propWidth, height = 400 }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(propWidth || 800);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{visible: boolean, x: number, y: number, transaction: Transaction | null}>(
    {visible: false, x: 0, y: 0, transaction: null}
  );

  // Update container width when ref changes or on resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Get the actual available width and enforce a maximum to prevent overflow
        const actualWidth = containerRef.current.clientWidth;
        // Apply a small reduction to account for any padding/margin
        setContainerWidth(Math.max(actualWidth - 20, 300));
      }
    };
    
    // Initial width calculation
    updateWidth();
    
    // Update on window resize
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [containerRef]);

  // Calculate a safe width value that will fit within the container
  // If propWidth is provided, use it, otherwise use measured width capped at a reasonable maximum
  const width = propWidth || Math.min(containerWidth, 800);
  
  // Generate random transaction data for visualization with main cluster in bottom-left
  const transactionData = useMemo(() => {
    const generateRandomTransactions = (count: number): Transaction[] => {
      const contractTypes = ['Futures', 'Options', 'Swaps', 'Forwards'];
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
      const users = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Wayne Enterprises'];
      const statuses = ['approved', 'pending', 'rejected', 'flagged'] as const;
      
      // Create transaction points with structured positions
      const transactions: Transaction[] = [];
      
      // Margin for axes and labels - keep points away from edges
      const margin = 40;
      const plotWidth = width - (2 * margin);
      const plotHeight = height - (2 * margin);
      
      // Create main cluster in bottom-left corner (low anomaly region)
      const clusterCenterX = margin + (plotWidth * 0.2); // 20% from left
      const clusterCenterY = height - margin - (plotHeight * 0.2); // 20% from bottom
      
      // Normal transactions - clustered in bottom left (low anomaly area)
      for (let i = 0; i < count - 10; i++) {
        // Modified Box-Muller transform for tighter cluster
        const u = 1 - Math.random();
        const v = 1 - Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        
        // Tighter, more concentrated distribution
        const spreadFactor = 50; // Controls how tightly clustered the points are
        const x = clusterCenterX + (z0 * spreadFactor * 0.8); // Slightly oval in X direction
        const y = clusterCenterY + (z1 * spreadFactor * 0.6); // Slightly less spread in Y
        
        // Calculate risk based on distance from origin (higher = more risky)
        // This creates a gradient effect where points further from bottom-left are medium risk
        const distanceFromOrigin = Math.sqrt(
          Math.pow((x - clusterCenterX) / spreadFactor, 2) + 
          Math.pow((y - clusterCenterY) / spreadFactor, 2)
        );
        const risk = distanceFromOrigin > 1.2 ? 'medium' : 'low';
        
        transactions.push({
          id: `trans-normal-${i}`,
          contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
          amount: Math.floor(Math.random() * 10000) / 100 + 50,
          currency: currencies[Math.floor(Math.random() * currencies.length)],
          user: users[Math.floor(Math.random() * users.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
          risk,
          x,
          y,
          isOutlier: false
        });
      }
      
      // Create outliers - positioned far from main cluster toward top-right (high anomaly region)
      for (let i = 0; i < 10; i++) {
        // Create distinct outlier patterns in the high-anomaly region (upper right quadrant)
        let x, y;
        
        // Randomize position in top-right area (high anomaly zone)
        // Place in top-right quadrant with some random variation
        const anomalyFactor = 0.35 + (Math.random() * 0.4); // 0.35-0.75 - controls how far outliers are
        
        // Calculate outlier position - creates a diagonal pattern of outliers
        // going toward the top-right (high anomaly) corner
        x = margin + (plotWidth * (0.6 + anomalyFactor * (i % 3 === 0 ? 0.3 : 0.2)));
        y = margin + (plotHeight * (0.1 + anomalyFactor * (i % 2 === 0 ? 0.2 : 0.3)));
        
        // Add some randomness to prevent too uniform distribution
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        
        transactions.push({
          id: `trans-outlier-${i}`,
          contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
          amount: Math.floor(Math.random() * 50000) / 100 + 500, // Higher amounts for outliers
          currency: currencies[Math.floor(Math.random() * currencies.length)],
          user: users[Math.floor(Math.random() * users.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000).toISOString(), // More recent
          risk: 'high',
          x,
          y,
          isOutlier: true
        });
      }
      
      return transactions;
    };
    
    return generateRandomTransactions(120); // 110 normal + 10 outliers
  }, [width, height]);
  
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(selectedTransaction === transaction.id ? null : transaction.id);
    // Call the parent component's handler if provided
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
  };
  
  const handleTransactionMouseEnter = (event: React.MouseEvent, transaction: Transaction) => {
    setTooltipInfo({
      visible: true,
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      transaction
    });
  };
  
  const handleTransactionMouseLeave = () => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };
  
  // Define axis labels
  const xAxisLabel = "Transaction Complexity";
  const yAxisLabel = "Behavioral Deviation";

  // Define plot area with margins for axes
  const margin = 40; // margin for axes and labels
  const plotWidth = width - (2 * margin);
  const plotHeight = height - (2 * margin);
  
  return (
    <div ref={containerRef} className="clustering_graph_container">
      <div className="clustering-graph-header">
        <h3>Transaction Anomaly Detection</h3>
        <div className="clustering-graph-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--success-500)' }}></span>
            <span className="legend-label">Low Risk</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--warning-500)' }}></span>
            <span className="legend-label">Medium Risk</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--danger-500)' }}></span>
            <span className="legend-label">High Risk (Outliers)</span>
          </div>
        </div>
      </div>
      <div className="clustering-graph-canvas">
        <svg 
          width="100%" 
          height={height} 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="xMidYMid meet" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            maxHeight: height
          }} 
          className="clustering-svg">
          <defs>
            {/* Enhanced gradient definitions */}
            <radialGradient id="normalGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
              <stop offset="70%" stopColor="rgba(16, 185, 129, 0.4)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
            </radialGradient>
            <radialGradient id="mediumGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.8)" />
              <stop offset="70%" stopColor="rgba(245, 158, 11, 0.4)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.1)" />
            </radialGradient>
            <radialGradient id="outlierGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 1)" />
              <stop offset="40%" stopColor="rgba(239, 68, 68, 0.8)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.3)" />
            </radialGradient>
            
            {/* Advanced glow filters */}
            <filter id="normalGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
            <filter id="outlierGlow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feColorMatrix in="coloredBlur" values="1 0 0 0 0.9  0 0.3 0 0 0.3  0 0 0.3 0 0.3  0 0 0 1 0"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
            <filter id="pulseGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feColorMatrix in="coloredBlur" values="1 0 0 0 0.9  0 0.2 0 0 0.2  0 0 0.2 0 0.2  0 0 0 1 0"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
            
            {/* Background pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" opacity="0.3"/>

          {/* X and Y axes */}
          <line 
            x1={margin} 
            y1={height - margin} 
            x2={width - margin/2} 
            y2={height - margin} 
            className="axis-line"
          />
          <line 
            x1={margin} 
            y1={margin/2} 
            x2={margin} 
            y2={height - margin} 
            className="axis-line"
          />

          {/* X-axis label - moved further down */}
          <text 
            x={width / 2} 
            y={height - 3} 
            textAnchor="middle" 
            className="axis-label"
          >
            {xAxisLabel}
          </text>

          {/* Y-axis label - moved further left to prevent overlap */}
          <text 
            x={5} 
            y={height / 2.5} 
            textAnchor="middle" 
            className="axis-label"
            transform={`rotate(-90, 5, ${height / 2})`}
          >
            {yAxisLabel}
          </text>

          {/* X-axis ticks and labels */}
          <line x1={margin} y1={height - margin} x2={margin} y2={height - margin + 5} className="tick-line" />
          <text x={margin} y={height - margin + 20} textAnchor="middle" className="tick-label">0</text>
          
          <line x1={margin + plotWidth*0.25} y1={height - margin} x2={margin + plotWidth*0.25} y2={height - margin + 5} className="tick-line" />
          <text x={margin + plotWidth*0.25} y={height - margin + 20} textAnchor="middle" className="tick-label">Low</text>
          
          <line x1={margin + plotWidth*0.5} y1={height - margin} x2={margin + plotWidth*0.5} y2={height - margin + 5} className="tick-line" />
          <text x={margin + plotWidth*0.5} y={height - margin + 20} textAnchor="middle" className="tick-label">Medium</text>
          
          <line x1={margin + plotWidth*0.75} y1={height - margin} x2={margin + plotWidth*0.75} y2={height - margin + 5} className="tick-line" />
          <text x={margin + plotWidth*0.75} y={height - margin + 20} textAnchor="middle" className="tick-label">High</text>

          {/* Y-axis ticks and labels */}
          <line x1={margin} y1={height - margin} x2={margin - 5} y2={height - margin} className="tick-line" />
          <text x={margin - 10} y={height - margin} textAnchor="end" alignmentBaseline="middle" className="tick-label">0</text>
          
          <line x1={margin} y1={height - margin - plotHeight*0.25} x2={margin - 5} y2={height - margin - plotHeight*0.25} className="tick-line" />
          <text x={margin - 10} y={height - margin - plotHeight*0.25} textAnchor="end" alignmentBaseline="middle" className="tick-label">Low</text>
          
          <line x1={margin} y1={height - margin - plotHeight*0.5} x2={margin - 5} y2={height - margin - plotHeight*0.5} className="tick-line" />
          <text x={margin - 10} y={height - margin - plotHeight*0.5} textAnchor="end" alignmentBaseline="middle" className="tick-label">Medium</text>
          
          <line x1={margin} y1={height - margin - plotHeight*0.75} x2={margin - 5} y2={height - margin - plotHeight*0.75} className="tick-line" />
          <text x={margin - 10} y={height - margin - plotHeight*0.75} textAnchor="end" alignmentBaseline="middle" className="tick-label">High</text>
          
          {/* Risk zones */}
          <path 
            d={`M ${margin} ${height - margin} L ${margin + plotWidth*0.4} ${height - margin} L ${margin + plotWidth*0.4} ${height - margin - plotHeight*0.4} L ${margin} ${height - margin - plotHeight*0.4} Z`}
            fill="rgba(16, 185, 129, 0.05)"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
            className="normal-zone-path"
          />
          <text 
            x={margin + plotWidth*0.2} 
            y={height - margin - plotHeight*0.2} 
            textAnchor="middle" 
            fill="rgba(16, 185, 129, 0.7)" 
            className="zone-label"
          >
            Normal Zone
          </text>
          
          <path 
            d={`M ${margin + plotWidth*0.6} ${height - margin - plotHeight*0.6} L ${width - margin} ${height - margin - plotHeight*0.6} L ${width - margin} ${margin} L ${margin + plotWidth*0.6} ${margin} Z`}
            fill="rgba(239, 68, 68, 0.05)"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
            className="anomaly-zone-path"
          />
          <text 
            x={width - margin - plotWidth*0.2} 
            y={margin + plotHeight*0.2} 
            textAnchor="middle" 
            fill="rgba(239, 68, 68, 0.7)" 
            className="zone-label"
          >
            Anomaly Zone
          </text>
          
          {/* Individual Transaction Points with Enhanced Animations */}
          {transactionData.map((transaction) => {
            const isSelected = selectedTransaction === transaction.id;
            
            // Fixed radius without animation
            const baseRadius = transaction.isOutlier ? 7 : 4;
            const radius = baseRadius + (isSelected ? 3 : 0);
            
            const gradientId = transaction.isOutlier ? 'outlierGradient' : 
                              transaction.risk === 'medium' ? 'mediumGradient' : 
                              'normalGradient';
            
            const filterId = isSelected ? 'pulseGlow' : 
                           transaction.isOutlier ? 'outlierGlow' : 
                           'normalGlow';
            
            return (
              <g 
                key={transaction.id} 
                onClick={() => handleTransactionClick(transaction)}
                onMouseEnter={(e) => handleTransactionMouseEnter(e, transaction)}
                onMouseLeave={handleTransactionMouseLeave}
                className={`transaction-point ${transaction.isOutlier ? 'outlier' : 'normal'} ${isSelected ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer ring for outliers - no pulse animation */}
                {transaction.isOutlier && (
                  <circle 
                    cx={transaction.x} 
                    cy={transaction.y} 
                    r={radius + 8}
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.3)"
                    strokeWidth="2"
                    opacity={0.6}
                    className="outlier-ring"
                  />
                )}
                
                {/* Main transaction point */}
                <circle 
                  cx={transaction.x} 
                  cy={transaction.y} 
                  r={radius}
                  fill={`url(#${gradientId})`}
                  stroke={transaction.isOutlier ? 'rgba(239, 68, 68, 0.9)' : 
                         transaction.risk === 'medium' ? 'rgba(245, 158, 11, 0.7)' : 
                         'rgba(16, 185, 129, 0.7)'}
                  strokeWidth={transaction.isOutlier ? 2 : 1}
                  filter={`url(#${filterId})`}
                  className="transaction-circle"
                />
                
                {/* Selection indicator - no animation */}
                {isSelected && (
                  <circle 
                    cx={transaction.x} 
                    cy={transaction.y} 
                    r={radius + 12}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.8)"
                    strokeWidth="3"
                    strokeDasharray="6,3"
                    opacity={0.8}
                    className="selection-indicator"
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {tooltipInfo.visible && tooltipInfo.transaction && (
          <div 
            className="transaction-tooltip" 
            style={{ 
              position: 'absolute', 
              left: tooltipInfo.x + 10, 
              top: tooltipInfo.y + 10,
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-md)',
              padding: '8px 12px',
              borderRadius: '4px',
              zIndex: 10,
              maxWidth: '250px'
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-risk" style={{ 
                color: tooltipInfo.transaction.isOutlier ? 'var(--danger-500)' : 
                       tooltipInfo.transaction.risk === 'medium' ? 'var(--warning-500)' : 
                       'var(--success-500)'
              }}>
                {tooltipInfo.transaction.isOutlier ? 'High' : 
                 (tooltipInfo.transaction.risk ? 
                  tooltipInfo.transaction.risk.charAt(0).toUpperCase() + 
                  tooltipInfo.transaction.risk.slice(1) : 
                  'Low')} Risk
              </span>
              <span className="tooltip-id">{tooltipInfo.transaction.id}</span>
            </div>
            <div className="tooltip-amount">
              {tooltipInfo.transaction.currency} {tooltipInfo.transaction.amount?.toFixed(2)}
            </div>
            <div className="tooltip-user">{tooltipInfo.transaction.user}</div>
            <div className="tooltip-info">
              Click to view details
            </div>
          </div>
        )}
      </div>
      <div className="clustering-graph-info">
        <p>Each point represents a single transaction plotted by Transaction Complexity (x-axis) and Behavioral Deviation (y-axis). Points clustered in the bottom left are normal transactions, while those in the top right indicate anomalies that require investigation.</p>
      </div>
    </div>
  );
};

export default ClusteringGraph;
