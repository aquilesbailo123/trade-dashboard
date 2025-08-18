import React, { useState, useMemo } from 'react';
import type { Transaction as ApiTransaction } from '../../api/queries';
import './ClusteringGraph.css';

// User trading data structure for time-based clustering
type UserTradingData = {
  userId: string;
  userName: string;
  averageTradeTime: number; // Hour of day (0-23)
  totalTrades: number;
  transactions: (ApiTransaction & { tradeHour: number })[];
  risk: 'low' | 'medium' | 'high';
  isOutlier: boolean;
  x?: number;
  y?: number;
};

interface ClusteringGraphProps {
  onTransactionClick?: (userData: UserTradingData) => void;
  width?: number;
  height?: number;
}

const ClusteringGraph: React.FC<ClusteringGraphProps> = ({ onTransactionClick, width: propWidth, height = 400 }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(propWidth || 800);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{visible: boolean, x: number, y: number, userData: UserTradingData | null}>(
    {visible: false, x: 0, y: 0, userData: null}
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
  
  // Generate user trading data based on time patterns
  const userTradingData = useMemo(() => {
    const generateUserTradingData = (): UserTradingData[] => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
      const userNames = ['Acme Corp', 'Globex Ltd', 'Initech Inc', 'Umbrella Corp', 'Wayne Enterprises', 
                        'Stark Industries', 'Oscorp', 'LexCorp', 'Daily Planet', 'Cyberdyne Systems',
                        'Weyland Corp', 'Tyrell Corp', 'Soylent Corp', 'Massive Dynamic', 'Aperture Science'];
      const statuses = ['approved', 'pending', 'rejected', 'flagged'] as const;
      
      const users: UserTradingData[] = [];
      const margin = 40;
      const plotWidth = width - (2 * margin);
      const plotHeight = height - (2 * margin);
      
      // Generate normal users who trade during market hours (9:30 AM - 4:00 PM)
      for (let i = 0; i < 12; i++) {
        const userName = userNames[i];
        const userId = `user-${i}`;
        
        // Normal trading hours: 9.5 to 16 (9:30 AM to 4:00 PM)
        // Peak hours: 9.5-10.5 (market open) and 15-16 (market close)
        let averageTradeTime: number;
        if (Math.random() < 0.4) {
          // 40% trade during market open (9:30-10:30)
          averageTradeTime = 9.5 + Math.random() * 1;
        } else if (Math.random() < 0.3) {
          // 30% trade during market close (3:00-4:00 PM)
          averageTradeTime = 15 + Math.random() * 1;
        } else {
          // 30% trade during regular hours (10:30 AM - 3:00 PM)
          averageTradeTime = 10.5 + Math.random() * 4.5;
        }
        
        const totalTrades = 5 + Math.floor(Math.random() * 15); // 5-20 trades
        
        // Generate transactions for this user
        const transactions: (ApiTransaction & { tradeHour: number })[] = [];
        for (let j = 0; j < totalTrades; j++) {
          // Add some variation around average trade time
          const tradeHour = Math.max(0, Math.min(23, averageTradeTime + (Math.random() - 0.5) * 2));
          
          transactions.push({
            id: `${userId}-trans-${j}`,
            amount: Math.floor(Math.random() * 10000) / 100 + 100,
            currency: currencies[Math.floor(Math.random() * currencies.length)],
            user: userName,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
            tradeHour
          });
        }
        
        // Position on graph: X = time (0-24 hours), Y = number of trades
        const x = margin + (averageTradeTime / 24) * plotWidth;
        const y = height - margin - (totalTrades / 25) * plotHeight;
        
        users.push({
          userId,
          userName,
          averageTradeTime,
          totalTrades,
          transactions,
          risk: 'low',
          isOutlier: false,
          x,
          y
        });
      }
      
      // Generate anomalous users who trade at unusual hours
      for (let i = 0; i < 3; i++) {
        const userName = userNames[12 + i];
        const userId = `user-anomaly-${i}`;
        
        // Unusual trading hours: midnight to 6 AM or 8 PM to midnight
        let averageTradeTime: number;
        if (Math.random() < 0.5) {
          // Late night trading (8 PM - midnight)
          averageTradeTime = 20 + Math.random() * 4;
        } else {
          // Very early morning trading (midnight - 6 AM)
          averageTradeTime = Math.random() * 6;
        }
        
        const totalTrades = 8 + Math.floor(Math.random() * 12); // 8-20 trades
        
        // Generate transactions for this user
        const transactions: (ApiTransaction & { tradeHour: number })[] = [];
        for (let j = 0; j < totalTrades; j++) {
          const tradeHour = Math.max(0, Math.min(23, averageTradeTime + (Math.random() - 0.5) * 1.5));
          
          transactions.push({
            id: `${userId}-trans-${j}`,
            amount: Math.floor(Math.random() * 50000) / 100 + 500, // Higher amounts
            currency: currencies[Math.floor(Math.random() * currencies.length)],
            user: userName,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString(),
            tradeHour
          });
        }
        
        // Position on graph: X = time (0-24 hours), Y = number of trades
        const x = margin + (averageTradeTime / 24) * plotWidth;
        const y = height - margin - (totalTrades / 25) * plotHeight;
        
        users.push({
          userId,
          userName,
          averageTradeTime,
          totalTrades,
          transactions,
          risk: 'high',
          isOutlier: true,
          x,
          y
        });
      }
      
      return users;
    };
    
    return generateUserTradingData();
  }, [width, height]);
  
  const handleUserClick = (userData: UserTradingData) => {
    setSelectedUser(selectedUser === userData.userId ? null : userData.userId);
    // Call the parent component's handler if provided
    if (onTransactionClick) {
      onTransactionClick(userData);
    }
  };
  
  const handleUserMouseEnter = (event: React.MouseEvent, userData: UserTradingData) => {
    setTooltipInfo({
      visible: true,
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      userData
    });
  };
  
  const handleUserMouseLeave = () => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };
  
  // Define axis labels
  const xAxisLabel = "Time of Day (Hours)";
  const yAxisLabel = "Number of Trades";

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

          {/* X-axis ticks and labels - Time of Day */}
          <line x1={margin} y1={height - margin} x2={margin} y2={height - margin + 5} className="tick-line" />
          <text x={margin} y={height - margin + 20} textAnchor="middle" className="tick-label">0:00</text>
          
          <line x1={margin + plotWidth*0.25} y1={height - margin} x2={margin + plotWidth*0.25} y2={height - margin + 5} className="tick-line" />
          <text x={margin + plotWidth*0.25} y={height - margin + 20} textAnchor="middle" className="tick-label">6:00</text>
          
          <line x1={margin + plotWidth*0.5} y1={height - margin} x2={margin + plotWidth*0.5} y2={height - margin + 5} className="tick-line" />
          <text x={margin + plotWidth*0.5} y={height - margin + 20} textAnchor="middle" className="tick-label">12:00</text>
          
          <line x1={margin + plotWidth*0.75} y1={height - margin} x2={margin + plotWidth*0.75} y2={height - margin + 5} className="tick-line" />
          <text x={margin + plotWidth*0.75} y={height - margin + 20} textAnchor="middle" className="tick-label">18:00</text>

          <line x1={width - margin} y1={height - margin} x2={width - margin} y2={height - margin + 5} className="tick-line" />
          <text x={width - margin} y={height - margin + 20} textAnchor="middle" className="tick-label">24:00</text>

          {/* Y-axis ticks and labels - Number of Trades */}
          <line x1={margin} y1={height - margin} x2={margin - 5} y2={height - margin} className="tick-line" />
          <text x={margin - 10} y={height - margin} textAnchor="end" alignmentBaseline="middle" className="tick-label">0</text>
          
          <line x1={margin} y1={height - margin - plotHeight*0.25} x2={margin - 5} y2={height - margin - plotHeight*0.25} className="tick-line" />
          <text x={margin - 10} y={height - margin - plotHeight*0.25} textAnchor="end" alignmentBaseline="middle" className="tick-label">5</text>
          
          <line x1={margin} y1={height - margin - plotHeight*0.5} x2={margin - 5} y2={height - margin - plotHeight*0.5} className="tick-line" />
          <text x={margin - 10} y={height - margin - plotHeight*0.5} textAnchor="end" alignmentBaseline="middle" className="tick-label">10</text>
          
          <line x1={margin} y1={height - margin - plotHeight*0.75} x2={margin - 5} y2={height - margin - plotHeight*0.75} className="tick-line" />
          <text x={margin - 10} y={height - margin - plotHeight*0.75} textAnchor="end" alignmentBaseline="middle" className="tick-label">15</text>

          <line x1={margin} y1={margin} x2={margin - 5} y2={margin} className="tick-line" />
          <text x={margin - 10} y={margin} textAnchor="end" alignmentBaseline="middle" className="tick-label">20</text>
          
          {/* Normal trading hours zone (9:30 AM - 4:00 PM) */}
          <path 
            d={`M ${margin + (9.5/24) * plotWidth} ${height - margin} L ${margin + (16/24) * plotWidth} ${height - margin} L ${margin + (16/24) * plotWidth} ${margin} L ${margin + (9.5/24) * plotWidth} ${margin} Z`}
            fill="rgba(16, 185, 129, 0.05)"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
            className="normal-zone-path"
          />
          <text 
            x={margin + (12.75/24) * plotWidth} 
            y={height - margin - plotHeight*0.1} 
            textAnchor="middle" 
            fill="rgba(16, 185, 129, 0.7)" 
            className="zone-label"
          >
            Normal Trading Hours
          </text>
          
          {/* Anomalous trading hours zones (midnight-6AM and 8PM-midnight) */}
          <path 
            d={`M ${margin} ${height - margin} L ${margin + (6/24) * plotWidth} ${height - margin} L ${margin + (6/24) * plotWidth} ${margin} L ${margin} ${margin} Z`}
            fill="rgba(239, 68, 68, 0.05)"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
            className="anomaly-zone-path"
          />
          <path 
            d={`M ${margin + (20/24) * plotWidth} ${height - margin} L ${width - margin} ${height - margin} L ${width - margin} ${margin} L ${margin + (20/24) * plotWidth} ${margin} Z`}
            fill="rgba(239, 68, 68, 0.05)"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
            className="anomaly-zone-path"
          />
          <text 
            x={margin + (3/24) * plotWidth} 
            y={margin + plotHeight*0.1} 
            textAnchor="middle" 
            fill="rgba(239, 68, 68, 0.7)" 
            className="zone-label"
          >
            Anomalous Hours
          </text>
          <text 
            x={margin + (22/24) * plotWidth} 
            y={margin + plotHeight*0.1} 
            textAnchor="middle" 
            fill="rgba(239, 68, 68, 0.7)" 
            className="zone-label"
          >
            Anomalous Hours
          </text>
          
          {/* Individual User Points */}
          {userTradingData.map((userData) => {
            const isSelected = selectedUser === userData.userId;
            
            // Fixed radius without animation
            const baseRadius = userData.isOutlier ? 7 : 4;
            const radius = baseRadius + (isSelected ? 3 : 0);
            
            const gradientId = userData.isOutlier ? 'outlierGradient' : 
                              userData.risk === 'medium' ? 'mediumGradient' : 
                              'normalGradient';
            
            const filterId = isSelected ? 'pulseGlow' : 
                           userData.isOutlier ? 'outlierGlow' : 
                           'normalGlow';
            
            return (
              <g 
                key={userData.userId} 
                onClick={() => handleUserClick(userData)}
                onMouseEnter={(e) => handleUserMouseEnter(e, userData)}
                onMouseLeave={handleUserMouseLeave}
                className={`user-point ${userData.isOutlier ? 'outlier' : 'normal'} ${isSelected ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer ring for outliers - no pulse animation */}
                {userData.isOutlier && (
                  <circle 
                    cx={userData.x} 
                    cy={userData.y} 
                    r={radius + 8}
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.3)"
                    strokeWidth="2"
                    opacity={0.6}
                    className="outlier-ring"
                  />
                )}
                
                {/* Main user point */}
                <circle 
                  cx={userData.x} 
                  cy={userData.y} 
                  r={radius}
                  fill={`url(#${gradientId})`}
                  stroke={userData.isOutlier ? 'rgba(239, 68, 68, 0.9)' : 
                         userData.risk === 'medium' ? 'rgba(245, 158, 11, 0.7)' : 
                         'rgba(16, 185, 129, 0.7)'}
                  strokeWidth={userData.isOutlier ? 2 : 1}
                  filter={`url(#${filterId})`}
                  className="user-circle"
                />
                
                {/* Selection indicator - no animation */}
                {isSelected && (
                  <circle 
                    cx={userData.x} 
                    cy={userData.y} 
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
        
        {tooltipInfo.visible && tooltipInfo.userData && (
          <div 
            className="user-tooltip" 
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
                color: tooltipInfo.userData.isOutlier ? 'var(--danger-500)' : 
                       tooltipInfo.userData.risk === 'medium' ? 'var(--warning-500)' : 
                       'var(--success-500)'
              }}>
                {tooltipInfo.userData.isOutlier ? 'High' : 
                 (tooltipInfo.userData.risk ? 
                  tooltipInfo.userData.risk.charAt(0).toUpperCase() + 
                  tooltipInfo.userData.risk.slice(1) : 
                  'Low')} Risk
              </span>
              <span className="tooltip-id">{tooltipInfo.userData.userName}</span>
            </div>
            <div className="tooltip-trades">
              {tooltipInfo.userData.totalTrades} trades
            </div>
            <div className="tooltip-time">
              Avg time: {Math.floor(tooltipInfo.userData.averageTradeTime)}:{String(Math.floor((tooltipInfo.userData.averageTradeTime % 1) * 60)).padStart(2, '0')}
            </div>
            <div className="tooltip-info">
              Click to view user details
            </div>
          </div>
        )}
      </div>
      <div className="clustering-graph-info">
        <p>Each point represents a user plotted by their average trading time (x-axis) and total number of trades (y-axis). Users trading during normal market hours (9:30 AM - 4:00 PM) appear in the green zone, while those trading at unusual hours appear in red anomalous zones.</p>
      </div>
    </div>
  );
};

export default ClusteringGraph;
