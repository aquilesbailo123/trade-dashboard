import React, { useState, useMemo } from "react";
import { useTransactions } from "../../api/queries";
import "./Home.css";

// Icon component interface
interface IconProps {
  size?: number;
  color?: string;
}

// Icons component with financial and trading-specific icons
const Icons = {
  Chart: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Users: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Flag: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12zM4 22v-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  TrendUp: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 6l-9.5 9.5-5-5L1 18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  TrendDown: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 18l-9.5-9.5-5 5L1 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 18h6v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Activity: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Bell: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  User: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: ({ size = 18 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Filter: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // New financial/trading specific icons
  DollarSign: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  AlertTriangle: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Shield: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  PieChart: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  ),
  Briefcase: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Lock: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  Globe: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  BarChart: ({ size = 24 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Clock: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  // Add missing Icons used in the component
  AlertCircle: ({ size = 18 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  MoreHorizontal: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  ),
  Calendar: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  RefreshCw: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6"></path>
      <path d="M1 20v-6h6"></path>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
  ChevronDown: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  BarChart2: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  FileText: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Settings: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  AlertOctagon: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Minus: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
};


// Advanced chart component for financial visualization
interface ChartPoint {
  x: number;
  y: number;
  date?: Date;
  volume?: number;
}

interface ChartProps {
  height?: number;
  type?: 'line' | 'candle' | 'bar' | 'area';
  showVolume?: boolean;
  data?: ChartPoint[];
  color?: string;
  secondaryColor?: string;
}

const ChartVisualization = ({ 
  height = 250, 
  type = 'line', 
  showVolume = false,
  data,
  color = 'var(--color-primary-500)',
  secondaryColor = 'var(--color-accent-400)'
}: ChartProps) => {
  // Generate realistic stock market data with patterns
  const generatePoints = () => {
    const points: ChartPoint[] = [];
    let lastY = 50 + Math.random() * 20;
    const volatility = 2;
    const trend = 0.1; // slight upward trend
    
    // Generate data for the last 30 days with dates
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      // Create slight patterns in the data
      const change = (Math.random() - 0.5) * volatility;
      const trendFactor = i > 15 ? trend : -trend * 0.8; // trend reversal in second half
      
      lastY = Math.max(10, Math.min(100, lastY + change + trendFactor));
      const volume = Math.floor(Math.random() * 5000) + 1000;
      
      // Create date for each point (going back from today)
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Sharp drop or spike on specific days (market events)
      if (i === 8) lastY = lastY * 0.92; // Sharp drop
      if (i === 5) lastY = lastY * 1.08; // Recovery
      
      points.push({
        x: 29 - i,
        y: lastY,
        date,
        volume
      });
    }
    return points;
  };
  
  // Use memoized data or generate if not provided
  const chartData = useMemo(() => data || generatePoints(), [data]);
  const maxY = Math.max(...chartData.map(p => p.y)) + 5;
  const minY = Math.min(...chartData.map(p => p.y)) - 5;
  const range = maxY - minY;
  
  const maxVolume = showVolume ? Math.max(...chartData.map(p => p.volume || 0)) : 0;
  
  const getPath = () => {
    const width = 100;
    const scaledPoints = chartData.map((p) => ({
      x: (p.x / (chartData.length - 1)) * width,
      y: height - (((p.y - minY) / range) * (height - (showVolume ? 50 : 0))),
    }));
    
    return scaledPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const getAreaPath = () => {
    const chartHeight = showVolume ? height - 50 : height;
    return `${getPath()} L 100 ${chartHeight} L 0 ${chartHeight} Z`;
  };
  
  const getMovingAverage = (window: number) => {
    const maPoints: ChartPoint[] = [];
    
    for (let i = 0; i < chartData.length; i++) {
      if (i >= window - 1) {
        let sum = 0;
        for (let j = 0; j < window; j++) {
          sum += chartData[i - j].y;
        }
        maPoints.push({
          x: chartData[i].x,
          y: sum / window,
        });
      }
    }
    
    const width = 200;
    return maPoints.map((p) => ({
      x: (p.x / (chartData.length - 1)) * width,
      y: height - (((p.y - minY) / range) * (height - (showVolume ? 50 : 0))),
    })).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 200 ${height}`} preserveAspectRatio="xMidYMid preserve">
      {/* Background grid */}
      <rect width="200" height={height} fill="var(--color-surface-primary)" fillOpacity="0.03" rx="1" />
      
      {/* Grid lines - horizontal */}
      {[...Array(5)].map((_, i) => {
        const yPos = ((height - (showVolume ? 50 : 0)) / 4) * i;
        const price = maxY - (i * (range / 4));
        return (
          <g key={`h-grid-${i}`}>
            <line 
              x1="0" y1={yPos} x2="200" y2={yPos}
              stroke="var(--color-border-primary)" strokeWidth="0.5" strokeDasharray="1 1" 
            />
            <text 
              x="1" y={yPos - 2} 
              fontSize="6" 
              fill="var(--color-text-tertiary)">
              ${price.toFixed(2)}
            </text>
          </g>
        );
      })}
      
      {/* Grid lines - vertical (days) */}
      {chartData.filter((_, i) => i % 5 === 0).map((point, i) => {
        const xPos = (point.x / (chartData.length - 1)) * 200;
        return (
          <g key={`v-grid-${i}`}>
            <line 
              x1={xPos} y1="0" x2={xPos} y2={showVolume ? height - 50 : height}
              stroke="var(--color-border-primary)" strokeWidth="0.5" strokeDasharray="1 1" 
            />
            {point.date && (
              <text 
                x={xPos} y={showVolume ? height - 40 : height - 5} 
                fontSize="5"
                textAnchor="middle"
                fill="var(--color-text-tertiary)">
                {point.date.getDate()}/{point.date.getMonth() + 1}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Volume bars */}
      {showVolume && maxVolume > 0 && chartData.map((point, i) => {
        const barWidth = 200 / chartData.length * 0.8;
        const xPos = (point.x / (chartData.length - 1)) * 200 - barWidth/2;
        const volHeight = ((point.volume || 0) / maxVolume) * 40;
        return (
          <rect 
            key={`vol-${i}`}
            x={xPos}
            y={height - volHeight}
            width={barWidth}
            height={volHeight}
            fill={point.y > (chartData[Math.max(0, i-1)]?.y || point.y) ? 
                  'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
            rx="1"
          />
        );
      })}
      
      {/* Chart visualization based on type */}
      {type === 'area' && (
        <path d={getAreaPath()} fill={`${color}`} fillOpacity="0.1" />
      )}
      
      {/* Main chart line */}
      <path 
        d={getPath()} 
        fill="none" 
        stroke={color} 
        strokeWidth="1.2" 
      />
      
      {/* Moving averages */}
      <path 
        d={getMovingAverage(7)} 
        fill="none" 
        stroke={secondaryColor} 
        strokeWidth="1" 
        strokeDasharray="1 1"
      />
      
      {/* Data points */}
      {chartData.filter((_, i) => i % 3 === 0 || i === chartData.length - 1).map((p, i) => {
        const scaledX = (p.x / (chartData.length - 1)) * 100;
        const scaledY = height - (((p.y - minY) / range) * (height - (showVolume ? 50 : 0)));
        return (
          <circle 
            key={`point-${i}`}
            cx={scaledX}
            cy={scaledY}
            r="1.2"
            fill="var(--color-surface-primary)"
            stroke={color}
            strokeWidth="0.8"
          />
        );
      })}
      
      {/* Current price highlight */}
      <g>
        <line 
          x1="0" 
          y1={height - (((chartData[chartData.length-1].y - minY) / range) * (height - (showVolume ? 50 : 0)))} 
          x2="100" 
          y2={height - (((chartData[chartData.length-1].y - minY) / range) * (height - (showVolume ? 50 : 0)))}
          stroke="var(--color-primary-400)" 
          strokeWidth="0.5" 
          strokeDasharray="1 2" 
        />
        <rect 
          x="85" 
          y={height - (((chartData[chartData.length-1].y - minY) / range) * (height - (showVolume ? 50 : 0))) - 7} 
          width="15" 
          height="7" 
          rx="1"
          fill="var(--color-primary-500)" 
        />
        <text 
          x="92.5" 
          y={height - (((chartData[chartData.length-1].y - minY) / range) * (height - (showVolume ? 50 : 0))) - 2} 
          fontSize="5" 
          fill="white"
          textAnchor="middle"
        >
          ${chartData[chartData.length-1].y.toFixed(2)}
        </text>
      </g>
    </svg>
  );
};

// Advanced financial risk metrics for stock trading
interface RiskMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Stock market indices for context
interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export default function Home() {
  const { data: txs } = useTransactions();
  // const { data: users } = useUsers();
  const [timeRange, setTimeRange] = useState("7d");
  // const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  // Enhanced metrics for trading platform
  const flagged = (txs ?? []).filter((t) => t.status === "flagged").length;
  const pending = (txs ?? []).filter((t) => t.status === "pending").length;
  
  // Calculate risk score based on flagged transactions ratio
  const riskScore = useMemo(() => {
    const total = (txs ?? []).length;
    if (total === 0) return 0;
    return Math.min(100, Math.round((flagged / total) * 100) + 15); // Add baseline risk
  }, [txs, flagged]);
  
  // Calculate total transaction volume
  const totalVolume = useMemo(() => {
    return (txs ?? []).reduce((sum, tx) => sum + parseFloat(String(tx.amount || '0')), 0);
  }, [txs]);
  
  // Risk metrics for financial trading
  const riskMetrics: RiskMetric[] = [
    {
      id: 'risk-score',
      name: 'Risk Score',
      value: riskScore,
      unit: '%',
      change: 2.5,
      trend: 'up',
      severity: riskScore > 75 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low'
    },
    {
      id: 'flagged-rate',
      name: 'Flagged Rate',
      value: txs?.length ? Math.round((flagged / txs.length) * 100) : 0,
      unit: '%',
      change: -1.2,
      trend: 'down',
      severity: 'medium'
    },
    {
      id: 'avg-tx-value',
      name: 'Avg Transaction',
      value: txs?.length ? Math.round(totalVolume / txs.length) : 0,
      unit: 'USD',
      change: 12.7,
      trend: 'up',
      severity: 'low'
    },
    {
      id: 'pending-review',
      name: 'Pending Review',
      value: pending,
      unit: '',
      change: 4,
      trend: 'up',
      severity: pending > 20 ? 'high' : pending > 10 ? 'medium' : 'low'
    }
  ];
  
  // Mock market indices data
  const marketIndices: MarketIndex[] = [
    { name: 'S&P 500', value: 4892.37, change: 18.24, changePercent: 0.37 },
    { name: 'NASDAQ', value: 15982.18, change: -28.42, changePercent: -0.18 },
    { name: 'DOW', value: 38654.22, change: 134.58, changePercent: 0.35 },
    { name: 'VIX', value: 14.12, change: -0.42, changePercent: -2.89 }
  ];
  
  // Enhanced activity items with trading-specific events
  const activityItems = [
    { 
      type: "alert", 
      title: "Suspicious trading pattern detected", 
      description: "Multiple rapid transactions from IP 185.224.x.x on AAPL stock", 
      time: "4 minutes ago",
      priority: "high"
    },
    { 
      type: "transaction", 
      title: "Large options position opened", 
      description: "$1.2M in TSLA puts (Strike $180) flagged for review", 
      time: "12 minutes ago",
      priority: "high"
    },
    { 
      type: "system", 
      title: "Volatility risk model updated", 
      description: "Market volatility threshold adjusted for earnings season", 
      time: "28 minutes ago",
      priority: "medium"
    },
    { 
      type: "user", 
      title: "New institutional client onboarded", 
      description: "Morgan Stanley Private Wealth verified and approved", 
      time: "45 minutes ago",
      priority: "medium"
    },
    { 
      type: "alert", 
      title: "Trading volume anomaly", 
      description: "Unusual activity in semiconductor sector detected", 
      time: "1 hour ago",
      priority: "medium"
    },
    { 
      type: "transaction", 
      title: "Cross-border transfer flagged", 
      description: "$850K USD to offshore account requires compliance review", 
      time: "2 hours ago",
      priority: "high"
    },
    { 
      type: "system", 
      title: "AI model retrained", 
      description: "Fraud detection algorithms updated with new patterns", 
      time: "3 hours ago",
      priority: "low"
    },
  ];


  return (
    <div className="homePage">
      {/* Professional dashboard header with market indices */}
      <header className="dashboardHeader" style={{gridColumn: "span 12"}}>
        <div className="dashboardHeader__title">
          <h1>Fraud Analytics</h1>
          <div className="dashboardHeader__subtitle">Trading Exchange</div>
        </div>
        
        <div className="marketIndices">
          {marketIndices.map((index, i) => (
            <div key={i} className="marketIndex">
              <div className="marketIndex__name">{index.name}</div>
              <div className="marketIndex__value">{index.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className={`marketIndex__change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                {index.change >= 0 ? <Icons.TrendUp size={12} /> : <Icons.TrendDown size={12} />}
                {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
              </div>
            </div>
          ))}
        </div>
        
        <div className="dashboardControls">
          <div className="dateSelector">
            <Icons.Calendar size={14} />
            <span>Today, {new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
            <Icons.ChevronDown size={14} />
          </div>
          <button className="refreshButton">
            <Icons.RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Dashboard navigation tabs */}
      {/* <div className="dashboardTabs" style={{gridColumn: "span 12"}}>
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Icons.BarChart2 size={16} />
          <span>Overview</span>
        </button>
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <Icons.DollarSign size={16} />
          <span>Transactions</span>
        </button>
        <button 
          className={`tab ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          <Icons.AlertTriangle size={16} />
          <span>Risk Analysis</span>
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Icons.FileText size={16} />
          <span>Reports</span>
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Icons.Settings size={16} />
          <span>Settings</span>
        </button>
      </div> */}

      {/* Advanced risk metrics cards */}
      <section className="riskMetrics" style={{gridColumn: "span 12"}}>
        {riskMetrics.map((metric) => (
          <div 
            key={metric.id} 
            className={`metricCard ${selectedMetric === metric.id ? 'selected' : ''} ${metric.severity ? `severity-${metric.severity}` : ''}`}
            onClick={() => setSelectedMetric(metric.id === selectedMetric ? null : metric.id)}
          >
            <div className="metricCard__icon">
              {metric.id === 'risk-score' && <Icons.AlertOctagon size={20} />}
              {metric.id === 'flagged-rate' && <Icons.Flag size={20} />}
              {metric.id === 'avg-tx-value' && <Icons.DollarSign size={20} />}
              {metric.id === 'pending-review' && <Icons.Clock size={20} />}
            </div>
            <div className="metricCard__content">
              <h4>{metric.name}</h4>
              <div className="metricCard__value">
                {metric.id === 'avg-tx-value' ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}{metric.unit}
              </div>
              <div className={`metricCard__change ${metric.trend}`}>
                {metric.trend === 'up' && <Icons.TrendUp size={14} />}
                {metric.trend === 'down' && <Icons.TrendDown size={14} />}
                {metric.trend === 'neutral' && <Icons.Minus size={14} />}
                {metric.change.toFixed(1)}% {metric.trend === 'up' ? 'increase' : metric.trend === 'down' ? 'decrease' : ''}
              </div>
            </div>
            {metric.severity === 'critical' && (
              <div className="metricCard__alert">Requires immediate attention</div>
            )}
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <div className="dashboardGrid" style={{gridColumn: "span 12"}}>
        <section className="chartPanel mainChart" style={{gridColumn: "span 8"}}>
          <div className="panelHeader">
            <div className="panelHeader__left">
              <h3>Transaction Volume & Price Analysis</h3>
              <div className="panelHeader__subtitle">Stock trading activity over time</div>
            </div>
            <div className="chartControls">
              <button 
                className={`controlButton ${timeRange === "24h" ? "active" : ""}`}
                onClick={() => setTimeRange("24h")}
              >
                24h
              </button>
              <button 
                className={`controlButton ${timeRange === "7d" ? "active" : ""}`}
                onClick={() => setTimeRange("7d")}
              >
                7d
              </button>
              <button 
                className={`controlButton ${timeRange === "30d" ? "active" : ""}`}
                onClick={() => setTimeRange("30d")}
              >
                30d
              </button>
              <button 
                className={`controlButton ${timeRange === "90d" ? "active" : ""}`}
                onClick={() => setTimeRange("90d")}
              >
                90d
              </button>
            </div>
          </div>
          <div className="chartContainer">
            <ChartVisualization height={320} />
          </div>
          <div className="chartLegend">
            <div className="legendItem">
              <div className="legendColor" style={{background: 'var(--chart-line)'}}></div>
              <span>Stock Price</span>
            </div>
            <div className="legendItem">
              <div className="legendColor" style={{background: 'var(--chart-ma)'}}></div>
              <span>20-day Moving Avg</span>
            </div>
            <div className="legendItem">
              <div className="legendColor" style={{background: 'var(--chart-volume)'}}></div>
              <span>Trading Volume</span>
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section className="activityPanel" style={{gridColumn: "span 4"}}>
          <div className="panelHeader">
            <div className="panelHeader__left">
              <h3>Fraud Alerts</h3>
              <div className="panelHeader__subtitle">Recent risk events</div>
            </div>
            <div className="panelActions">
              <button className="iconButton">
                <Icons.Filter size={14} />
              </button>
              <button className="textButton">View All</button>
            </div>
          </div>
          
          <div className="activityList">
            {activityItems.map((item, i) => (
              <div key={i} className={`activityItem activityItem--${item.type} priority--${item.priority}`}>
                <div className="activityItem__icon">
                  {item.type === "alert" && <Icons.AlertCircle size={18} />}
                  {item.type === "transaction" && <Icons.DollarSign size={18} />}
                  {item.type === "user" && <Icons.User size={18} />}
                  {item.type === "system" && <Icons.Settings size={18} />}
                </div>
                <div className="activityItem__content">
                  <div className="activityItem__header">
                    <h4>{item.title}</h4>
                    <span className="activityItem__time">{item.time}</span>
                  </div>
                  <p>{item.description}</p>
                  {item.priority === 'high' && (
                    <div className="activityItem__priority">
                      <Icons.Flag size={12} /> High Priority
                    </div>
                  )}
                </div>
                <button className="activityItem__action">
                  <Icons.MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
        
        {/* Transactions Table */}
        <section className="transactionsPanel" style={{gridColumn: "span 8"}}>
          <div className="panelHeader">
            <div className="panelHeader__left">
              <h3>Recent Transactions</h3>
              <div className="panelHeader__subtitle">Latest trading activity</div>
            </div>
            <div className="panelActions">
              <button className="iconButton">
                <Icons.Filter size={14} />
              </button>
              <button className="textButton">View All</button>
            </div>
          </div>
          
          <div className="homeTable__wrapper">
            <table className="homeTable transactionsTable">
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {(txs ?? []).slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <Td>{t.id.substring(0, 8)}</Td>
                    <Td>${parseFloat(String(t.amount)).toLocaleString()}</Td>
                    <Td>
                      <div className={`homeTable__status status--${t.status.toLowerCase()}`}>
                        {t.status}
                      </div>
                    </Td>
                    <Td>{new Date(t.createdAt).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// function StatCard({ 
//   title, 
//   value, 
//   trend = 0, 
//   icon 
// }: { 
//   title: string; 
//   value: string;
//   trend?: number;
//   icon?: React.ReactNode; 
// }) {
//   return (
//     <div className="homeStat">
//       {icon && <div className="homeStat__icon">{icon}</div>}
//       <div className="homeStat__label">{title}</div>
//       <div className="homeStat__value">{value}</div>
//       {trend !== 0 && (
//         <div className={`homeStat__trend ${trend > 0 ? "homeStat__trend--up" : "homeStat__trend--down"}`}>
//           {trend > 0 ? <Icons.TrendUp /> : <Icons.TrendDown />}
//           <span style={{ marginLeft: "4px" }}>{Math.abs(trend)}% from last period</span>
//         </div>
//       )}
//     </div>
//   );
// }

function Th({ children }: { children: React.ReactNode }) {
  return <th className="homeTable__th">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="homeTable__td">{children}</td>;
}
