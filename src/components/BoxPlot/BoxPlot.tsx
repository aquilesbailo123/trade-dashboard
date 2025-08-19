import React, { useState, useRef, useEffect } from 'react';
import type { ProfitLossDataPoint, ProfitLossData } from '../../hooks/useProfitLossData';
import './BoxPlot.css';

interface BoxPlotProps {
  title: string;
  data: ProfitLossData;
  height?: number;
  width?: number;
  currency?: string;
  onOutlierClick?: (outlier: ProfitLossDataPoint) => void;
}

const BoxPlot: React.FC<BoxPlotProps> = ({
  title,
  data,
  height = 300,
  width: propWidth,
  currency = 'USD',
  onOutlierClick
}) => {
  // View mode state (per trade or per year)
  const [viewMode, setViewMode] = useState<'perTrade' | 'perYear'>('perTrade');
  const activeData = data[viewMode];
  
  // Refs and responsive sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(propWidth || 500);
  const [tooltipInfo, setTooltipInfo] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: '',
    value: 0
  });

  // Update width on container resize
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

  // Dimensions and margins
  const width = propWidth || containerWidth;
  const margin = { top: 50, right: 40, bottom: 50, left: 60 }; // Increased margins
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const boxHeight = 100; // Increased box height for better visibility - used throughout the component
  
  // Center position for the box
  const centerY = margin.top + plotHeight / 2;

  // Calculate value range with 10% padding on both sides
  const rawValues = [...activeData.outliers.map(o => o.value), activeData.min, activeData.max, activeData.q1, activeData.q3, activeData.median];
  const dataMin = Math.min(...rawValues);
  const dataMax = Math.max(...rawValues);
  const dataRange = dataMax - dataMin;
  const paddedMin = dataMin - (dataRange * 0.1);
  const paddedMax = dataMax + (dataRange * 0.1);
  const valueRange = paddedMax - paddedMin;

  // Generate ticks for axis (6 evenly spaced ticks)
  const axisTicks = Array.from({ length: 6 }, (_, i) => {
    return paddedMin + (valueRange * (i / 5));
  });
  
  // Scaling functions
  const scaleX = (value: number): number => {
    // Constrain value to prevent errors
    const constrainedValue = Math.max(paddedMin, Math.min(paddedMax, value));
    // Map value to x position with padding
    return margin.left + ((constrainedValue - paddedMin) / valueRange) * plotWidth;
  };

  // Event handlers
  const handleOutlierClick = (outlier: ProfitLossDataPoint) => {
    if (onOutlierClick) {
      onOutlierClick(outlier);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, value: number, text: string) => {
    setTooltipInfo({
      visible: true,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      text,
      value
    });
  };

  const handleMouseLeave = () => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Zero reference line condition directly in rendering
  
  return (
    <div ref={containerRef} className="boxplot-container">
      <div className="boxplot-header">
        <h3>{title}</h3>
        <div className="boxplot-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--color-primary-500)' }}></span>
            <span className="legend-label">Box (Q1-Q3)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--color-error-500)' }}></span>
            <span className="legend-label">Outliers</span>
          </div>
        </div>
      </div>
      
      <div className="boxplot-toggle">
        <button 
          className={`boxplot-toggle-button ${viewMode === 'perTrade' ? 'active' : ''}`}
          onClick={() => setViewMode('perTrade')}
        >
          Per Trade
        </button>
        <button 
          className={`boxplot-toggle-button ${viewMode === 'perYear' ? 'active' : ''}`}
          onClick={() => setViewMode('perYear')}
        >
          Per Year
        </button>
      </div>
      
      <div className="boxplot-graph">
        <svg width={width} height={height}>
          {/* Define gradients */}
          <defs>
            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary-400)" />
              <stop offset="100%" stopColor="var(--color-primary-600)" />
            </linearGradient>
            <filter id="dropShadow" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {/* X-axis */}
          <line
            x1={margin.left}
            y1={centerY}
            x2={width - margin.right}
            y2={centerY}
            stroke="var(--color-border-secondary)"
            strokeWidth="1"
          />
          
          {/* Axis ticks */}
          {axisTicks.map((tick: number, i: number) => (
            <g key={i}>
              <line
                x1={scaleX(tick)}
                y1={centerY - 5}
                x2={scaleX(tick)}
                y2={centerY + 5}
                stroke="var(--color-border-secondary)"
                strokeWidth="1"
              />
              <text
                x={scaleX(tick)}
                y={centerY + 25}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-text-secondary)"
              >
                {formatCurrency(tick)}
              </text>
            </g>
          ))}
          
          {/* Zero reference line if applicable */}
          {paddedMin < 0 && paddedMax > 0 && (
            <line
              x1={scaleX(0)}
              y1={centerY - boxHeight*1.5}
              x2={scaleX(0)}
              y2={centerY + boxHeight*1.5}
              stroke="var(--color-border-secondary)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )}
          
          {/* Whiskers (horizontal) */}
          <line 
            x1={scaleX(activeData.min)}
            y1={centerY}
            x2={scaleX(activeData.q1)}
            y2={centerY}
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          <line 
            x1={scaleX(activeData.q3)}
            y1={centerY}
            x2={scaleX(activeData.max)}
            y2={centerY}
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          
          {/* Min/max vertical ticks */}
          <line 
            x1={scaleX(activeData.min)}
            y1={centerY - 10}
            x2={scaleX(activeData.min)}
            y2={centerY + 10}
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
          />
          <line 
            x1={scaleX(activeData.max)}
            y1={centerY - 10}
            x2={scaleX(activeData.max)}
            y2={centerY + 10}
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
          />
          
          {/* IQR Box */}
          <rect 
            x={scaleX(activeData.q1)}
            y={centerY - boxHeight/2}
            width={scaleX(activeData.q3) - scaleX(activeData.q1)}
            height={boxHeight}
            fill="url(#boxGradient)"
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
            rx="4"
            ry="4"
            filter="url(#dropShadow)"
          />
          
          {/* Median line */}
          <line
            x1={scaleX(activeData.median)}
            y1={centerY - boxHeight/2}
            x2={scaleX(activeData.median)}
            y2={centerY + boxHeight/2}
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Min/Max Labels */}
          <text
            x={scaleX(activeData.min)}
            y={centerY - 25}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-secondary)"
            onMouseEnter={(e) => handleMouseEnter(e, activeData.min, 'Minimum')}
            onMouseLeave={handleMouseLeave}
          >
            Min
          </text>
          <text
            x={scaleX(activeData.max)}
            y={centerY - 25}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-secondary)"
            onMouseEnter={(e) => handleMouseEnter(e, activeData.max, 'Maximum')}
            onMouseLeave={handleMouseLeave}
          >
            Max
          </text>
          
          {/* Quartile and median labels */}
          <text 
            x={scaleX(activeData.q1) - 20}
            y={centerY + boxHeight/2 + 20}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-secondary)"
            className="boxplot-label"
          >
            Q1: {formatCurrency(activeData.q1)}
          </text>
          <text 
            x={scaleX(activeData.median)}
            y={centerY - boxHeight/2 - 20}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-primary)"
            fontWeight="bold"
            className="boxplot-label"
          >
            Median: {formatCurrency(activeData.median)}
          </text>
          <text 
            x={scaleX(activeData.q3) + 20}
            y={centerY + boxHeight/2 + 20}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-secondary)"
            className="boxplot-label"
          >
            Q3: {formatCurrency(activeData.q3)}
          </text>
          
          {/* Outlier points */}
          {activeData.outliers.map((outlier, index) => (
            <circle
              key={index}
              cx={scaleX(outlier.value)}
              cy={centerY}
              r={5}
              fill="var(--color-error-400)"
              stroke="var(--color-error-600)"
              strokeWidth={1.5}
              opacity={0.9}
              onMouseEnter={(e) => handleMouseEnter(e, outlier.value, `Outlier: ${outlier.traderId}`)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleOutlierClick(outlier)}
              style={{ cursor: 'pointer' }}
              filter="url(#dropShadow)"
              className="boxplot-outlier"
            />
          ))}
        </svg>
        
        {/* Tooltip */}
        {tooltipInfo.visible && (
          <div 
            className="boxplot-tooltip"
            style={{
              position: 'absolute',
              left: tooltipInfo.x + 10,
              top: tooltipInfo.y - 40
            }}
          >
            <div>{tooltipInfo.text}</div>
            <div><strong>{formatCurrency(tooltipInfo.value)}</strong></div>
          </div>
        )}
      </div>
      
      <div className="boxplot-summary">
        <p>
          Distribution of profit/loss {viewMode === 'perTrade' ? 'per trade' : 'per year'} across {activeData.totalSample} data points, with {activeData.outliers.length} outliers identified.
        </p>
      </div>
    </div>
  );
};

export default BoxPlot;
