import React, { useState, useMemo, useRef, useEffect } from 'react';
import './ComparisonGraph.css';

// Define trade attribute for comparison
export type TradeAttribute = {
  key: string;
  label: string;
  accessor: (trade: any) => number | undefined;
  format?: (value: number) => string;
  min?: number;
  max?: number;
};

// List of available trade attributes for comparison
export const TRADE_ATTRIBUTES: TradeAttribute[] = [
  {
    key: 'amount',
    label: 'Trade Amount',
    accessor: (trade) => trade.amount,
    format: (value) => `$${value.toFixed(2)}`
  },
  {
    key: 'pnl',
    label: 'Profit/Loss',
    accessor: (trade) => trade.pnl,
    format: (value) => `$${value.toFixed(2)}`
  },
  {
    key: 'time',
    label: 'Time of Day',
    accessor: (trade) => {
      if (!trade.createdAt) return undefined;
      const date = new Date(trade.createdAt);
      return date.getHours() + date.getMinutes() / 60;
    },
    format: (value) => {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    },
    min: 0,
    max: 24
  },
  {
    key: 'risk',
    label: 'Risk Score',
    accessor: (trade) => {
      if (trade.anomaly_score !== undefined) return trade.anomaly_score;
      // Map risk levels to numeric scores if anomaly_score is not available
      if (trade.risk === 'high' || trade.isOutlier) return 0.8;
      if (trade.risk === 'medium') return 0.5;
      if (trade.risk === 'low') return 0.2;
      return 0.5; // Default
    },
    format: (value) => value.toFixed(2),
    min: 0,
    max: 1
  }
];

interface ComparisonGraphProps {
  trades: any[];
  height?: number;
  width?: number;
  onTradeClick?: (trade: any) => void;
}

const ComparisonGraph: React.FC<ComparisonGraphProps> = ({
  trades,
  height = 300,
  width: propWidth,
  onTradeClick
}) => {
  // Selected attributes for X and Y axes
  const [xAttribute, setXAttribute] = useState<TradeAttribute>(TRADE_ATTRIBUTES[0]);
  const [yAttribute, setYAttribute] = useState<TradeAttribute>(TRADE_ATTRIBUTES[1]);
  
  // Refs and state for container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(propWidth || 500);
  
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    trade: any; 
  }>({
    visible: false,
    x: 0,
    y: 0,
    trade: null
  });

  // Update container width on resize

  useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          const actualWidth = containerRef.current.clientWidth;
          setContainerWidth(Math.max(actualWidth - 20, 500)); // Less padding to use more of the container width
        }
      };
      
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }, [containerRef]);

  // Set actual width based on prop or container
  const width = propWidth || containerWidth;
  const margin = { top: 20, right: 60, bottom: 40, left: 90 }; // Increased left margin for Y-axis labels

  // Filter and process trades data for the chart
  const validTrades = useMemo(() => {
    return trades.filter(trade => {
      const xValue = xAttribute.accessor(trade);
      const yValue = yAttribute.accessor(trade);
      return xValue !== undefined && yValue !== undefined;
    });
  }, [trades, xAttribute, yAttribute]);

  // Calculate min/max values for axes
  const xRange = useMemo(() => {
    if (validTrades.length === 0) return { min: 0, max: 1 };
    
    // Use predefined min/max if available
    if (xAttribute.min !== undefined && xAttribute.max !== undefined) {
      return { min: xAttribute.min, max: xAttribute.max };
    }
    
    // Otherwise calculate from data
    const values = validTrades.map(trade => xAttribute.accessor(trade) as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // 10% padding
    
    return {
      min: min - padding,
      max: max + padding
    };
  }, [validTrades, xAttribute]);
  
  const yRange = useMemo(() => {
    if (validTrades.length === 0) return { min: 0, max: 1 };
    
    // Use predefined min/max if available
    if (yAttribute.min !== undefined && yAttribute.max !== undefined) {
      return { min: yAttribute.min, max: yAttribute.max };
    }
    
    // Otherwise calculate from data
    const values = validTrades.map(trade => yAttribute.accessor(trade) as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // 10% padding
    
    return {
      min: min - padding,
      max: max + padding
    };
  }, [validTrades, yAttribute]);

  // Convert data value to screen coordinates with boundary protection
  const scaleX = (value: number): number => {
    // Ensure the value is within the min-max range
    const constrainedValue = Math.max(xRange.min, Math.min(xRange.max, value));
    // Apply scaling
    const scaledValue = margin.left + ((constrainedValue - xRange.min) / (xRange.max - xRange.min)) * (width - margin.left - margin.right);
    // Add extra safety boundary
    return Math.max(margin.left + 6, Math.min(width - margin.right - 6, scaledValue));
  };
  
  const scaleY = (value: number): number => {
    // Ensure the value is within the min-max range
    const constrainedValue = Math.max(yRange.min, Math.min(yRange.max, value));
    // Apply scaling
    const scaledValue = height - margin.bottom - ((constrainedValue - yRange.min) / (yRange.max - yRange.min)) * (height - margin.top - margin.bottom);
    // Add extra safety boundary
    return Math.max(margin.top + 6, Math.min(height - margin.bottom - 6, scaledValue));
  };

  // Handle attribute selection changes
  const handleXAttributeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const attribute = TRADE_ATTRIBUTES.find(attr => attr.key === selectedKey);
    
    if (attribute) {
      setXAttribute(attribute);
      
      // If the selected attribute is the same as current Y-axis, automatically change Y-axis
      if (attribute.key === yAttribute.key) {
        // Find the first attribute that's not the selected one
        const newYAttribute = TRADE_ATTRIBUTES.find(attr => attr.key !== attribute.key);
        if (newYAttribute) {
          setYAttribute(newYAttribute);
        }
      }
    }
  };
  
  const handleYAttributeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const attribute = TRADE_ATTRIBUTES.find(attr => attr.key === selectedKey);
    if (attribute) {
      setYAttribute(attribute);
    }
  };

  // Handle tooltip interactions
  const handlePointHover = (e: React.MouseEvent, trade: any) => {
    setTooltip({
      visible: true,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      trade
    });
  };
  
  const handlePointLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };
  
  const handlePointClick = (trade: any) => {
    if (onTradeClick) {
      onTradeClick(trade);
    }
  };

  return (
    <div ref={containerRef} className="comparison-graph-container">
      <div className="comparison-graph-header">
        <h3>Trade Comparison</h3>
      </div>
      
      <div className="comparison-graph-controls">
        <div className="control-group">
          <label htmlFor="x-attribute">X-Axis:</label>
          <select 
            id="x-attribute"
            value={xAttribute.key}
            onChange={handleXAttributeChange}
          >
            {TRADE_ATTRIBUTES.map(attr => (
              <option key={attr.key} value={attr.key}>
                {attr.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="y-attribute">Y-Axis:</label>
          <select 
            id="y-attribute"
            value={yAttribute.key}
            onChange={handleYAttributeChange}
          >
            {TRADE_ATTRIBUTES.map(attr => (
              <option 
                key={attr.key} 
                value={attr.key} 
                disabled={attr.key === xAttribute.key}
              >
                {attr.label} {attr.key === xAttribute.key ? "(already selected)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="comparison-graph-chart">
        {validTrades.length > 0 ? (
          <svg width={width} height={height}>
            {/* X-axis */}
            <line 
              x1={margin.left} 
              y1={height - margin.bottom} 
              x2={width - margin.right} 
              y2={height - margin.bottom}
              stroke="var(--color-border-primary"
              strokeWidth="1.5"
            />
            {/* Label */}
            <text 
              x={width / 2} 
              y={height - 5}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-primary)"
            >
              {xAttribute.label}
            </text>
            
            {/* Y-axis */}
            <line 
              x1={margin.left} 
              y1={margin.top} 
              x2={margin.left} 
              y2={height - margin.bottom}
              stroke="var(--color-border-primary)"
              strokeWidth="1.5"
            />
            {/* Label */}
            <text 
              transform={`rotate(-90, ${margin.left/3}, ${height/2})`}
              x={margin.left/4} 
              y={height/2}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-primary)"
            >
              {yAttribute.label}
            </text>
            
            {/* X-axis ticks and labels */}
            {Array.from({ length: 5 }).map((_, i) => {
              const value = xRange.min + ((xRange.max - xRange.min) / 4) * i;
              const x = scaleX(value);
              return (
                <g key={`x-tick-${i}`}>
                  <line 
                    x1={x} 
                    y1={height - margin.bottom} 
                    x2={x} 
                    y2={height - margin.bottom + 5}
                    stroke="var(--color-border-primary)"
                    strokeWidth="1"
                  />
                  <text 
                    x={x} 
                    y={height - margin.bottom + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="var(--color-text-secondary)"
                  >
                    {xAttribute.format ? xAttribute.format(value) : value.toFixed(1)}
                  </text>
                </g>
              );
            })}
            
            {/* Y-axis ticks and labels */}
            {Array.from({ length: 5 }).map((_, i) => {
              const value = yRange.min + ((yRange.max - yRange.min) / 4) * i;
              const y = scaleY(value);
              return (
                <g key={`y-tick-${i}`}>
                  <line 
                    x1={margin.left - 5} 
                    y1={y} 
                    x2={margin.left} 
                    y2={y}
                    stroke="var(--color-border-primary)"
                    strokeWidth="1"
                  />
                  <text 
                    x={margin.left - 10} 
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="500"
                    fill="var(--color-text-secondary)"
                  >
                    {yAttribute.format ? yAttribute.format(value) : value.toFixed(1)}
                  </text>
                </g>
              );
            })}
            
            {/* Data points */}
            {validTrades.map((trade) => {
              const xValue = xAttribute.accessor(trade) as number;
              const yValue = yAttribute.accessor(trade) as number;
              const x = scaleX(xValue);
              const y = scaleY(yValue);
              
              // Determine point color based on risk with better contrast
              let pointColor = '#3b82f6';
              if (trade.isOutlier || trade.risk === 'high') {
                pointColor = '#ef4444';
              } else if (trade.risk === 'medium') {
                pointColor = '#f59e0b';
              } else if (trade.risk === 'low') {
                pointColor = '#10b981';
              }
              
              return (
                <circle
                  key={trade.id}
                  cx={x}
                  cy={y}
                  r={6}
                  fill={pointColor}
                //   stroke="white"
                //   strokeWidth="2"
                  opacity={0.9}
                  onMouseEnter={(e) => handlePointHover(e, trade)}
                  onMouseLeave={handlePointLeave}
                  onClick={() => handlePointClick(trade)}
                  style={{ cursor: 'pointer' }}
                  filter="drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))"
                />
              );
            })}
          </svg>
        ) : (
          <div className="comparison-no-data">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <p>No valid data points available for the selected attributes</p>
          </div>
        )}
        
        {/* Tooltip */}
        {tooltip.visible && tooltip.trade && (
          <div 
            className="comparison-graph-tooltip" 
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 60
            }}
          >
            <div><strong>ID: {tooltip.trade.id}</strong></div>
            <div>
              {xAttribute.label}: {(() => {
                const value = xAttribute.accessor(tooltip.trade);
                if (value !== undefined) {
                  return xAttribute.format ? xAttribute.format(value) : value.toFixed(2);
                }
                return 'N/A';
              })()}
            </div>
            <div>
              {yAttribute.label}: {(() => {
                const value = yAttribute.accessor(tooltip.trade);
                if (value !== undefined) {
                  return yAttribute.format ? yAttribute.format(value) : value.toFixed(2);
                }
                return 'N/A';
              })()}
            </div>
          </div>
        )}
      </div>
      
      <div className="comparison-graph-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          <span>High Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>Medium Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          <span>Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonGraph;
