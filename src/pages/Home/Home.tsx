import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../api/queries';
import type { Transaction as ApiTransaction } from '../../api/queries';
import ClusteringGraph from '../../components/ClusteringGraph/ClusteringGraph';
import './Home.css';

// Define icon components used in the dashboard
interface IconProps {
  size?: number;
  color?: string;
}

// Icons component with financial and trading-specific icons
const Icons = {
  Search: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
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
  Settings: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  User: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Filter: ({ size = 18 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  )
};

// Transaction data structure - extend the API type for local usage
interface Transaction extends ApiTransaction {
  // Add any additional properties used locally but not in the API
  contractType?: string;
  contractMonth?: string;
  client?: string;
  salesPerson?: string;
}

// Advanced chart component for financial visualization
interface ChartPoint {
  x: number;
  y: number;
  date?: Date;
  volume?: number;
}

interface ChartProps {
  height?: number;
  showVolume?: boolean;
  timeRange?: string;
}

const ChartVisualization: React.FC<ChartProps> = ({ 
  height = 250, 
  showVolume = true,
  timeRange = '30d'
}) => {
  
  // Generate sample data based on timeRange
  const chartData = useMemo(() => {
    // Map timeRange to number of data points
    const timeRangeMap: Record<string, number> = {
      '24h': 24,
      '7d': 7 * 24, // hourly for 7 days
      '30d': 30,
      '90d': 90
    };
    
    const dataPoints = timeRangeMap[timeRange] || 30;
    const startPrice = 156;
    let volatility = 2;
    
    // Adjust volatility based on time range
    if (timeRange === '24h') volatility = 0.5;
    else if (timeRange === '7d') volatility = 1;
    else if (timeRange === '90d') volatility = 3;
    
    const now = new Date();
    let prevPrice = startPrice;
    
    return Array(dataPoints).fill(0).map((_, i) => {
      const dayChange = (Math.random() - 0.5) * volatility;
      const price = prevPrice + dayChange;
      prevPrice = price; // Store for next iteration
      const volume = Math.floor(Math.random() * (2000 + i % 500)) + 500;
      
      // Create appropriate date based on timeRange
      let date;
      if (timeRange === '24h') {
        date = new Date(now.getTime() - (dataPoints - i) * 60 * 60 * 1000);
      } else if (timeRange === '7d') {
        date = new Date(now.getTime() - (dataPoints - i) * 60 * 60 * 1000);
      } else if (timeRange === '30d') {
        date = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
      } else {
        date = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
      }
      
      return {
        price,
        volume,
        date,
        x: i,
        y: price
      };
    });
  }, [timeRange]);
  
  const maxY = useMemo(() => Math.max(...chartData.map(p => p.y)) + 5, [chartData]);
  const minY = useMemo(() => Math.min(...chartData.map(p => p.y)) - 5, [chartData]);
  const range = useMemo(() => maxY - minY, [maxY, minY]);
  
  const getPath = () => {
    if (!chartData.length) return '';
    
    // Use consistent SVG viewBox width of 100 for all calculations
    const viewBoxWidth = 100;
    const chartHeight = height - (showVolume ? 50 : 0);
    
    const scaledPoints = chartData.map((p, i) => {
      // Scale x from 0 to viewBoxWidth based on position in array
      const x = (i / (chartData.length - 1)) * viewBoxWidth;
      // Scale y from minY-maxY range to 0-chartHeight (inverted, since SVG y goes down)
      const y = height - (((p.y - minY) / range) * chartHeight);
      return {x, y};
    });
    
    return scaledPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };
  
  const getAreaPath = () => {
    const chartHeight = showVolume ? height - 50 : height;
    const viewBoxWidth = 100;
    return `${getPath()} L ${viewBoxWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  };

  const getMAPath = () => {
    if (chartData.length < 7) return ''; // Not enough data for MA
  
    // Calculate Moving Average for each point
    const window = 7; // 7-day moving average
    const maPoints: ChartPoint[] = [];
    const viewBoxWidth = 100;
    const chartHeight = height - (showVolume ? 50 : 0);
    
    for (let i = window - 1; i < chartData.length; i++) {
      let sum = 0;
      for (let j = 0; j < window; j++) {
        sum += chartData[i - j].y;
      }
      maPoints.push({
        x: chartData[i].x,
        y: sum / window,
      });
    }
    
    return maPoints.map((p) => ({
      x: (p.x / (chartData.length - 1)) * viewBoxWidth,
      y: height - (((p.y - minY) / range) * chartHeight),
    })).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };
  
  // To fix the stretched text issue, we need to apply a transformation to counter the non-uniform scaling
  // First, calculate the current price y position
  const priceY = height - (((chartData[chartData.length-1].y - minY) / range) * (height - (showVolume ? 50 : 0)));
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {/* Background grid - uses viewBoxWidth of 100 to fill container */}
        <rect width="100" height={height} fill="var(--color-surface-primary)" fillOpacity="0.03" rx="1" />
        
        {/* Grid lines - horizontal - lines only */}
        {[...Array(5)].map((_, i) => {
          const yPos = ((height - (showVolume ? 50 : 0)) / 4) * i;
          return (
            <g key={`h-grid-${i}`}>
              <line 
                x1="0" y1={yPos} x2="100" y2={yPos}
                stroke="var(--color-border-primary)" strokeWidth="0.5" strokeDasharray="1 1" 
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
        
        {/* Area chart */}
        <path 
          d={getAreaPath()} 
          fill="var(--color-primary-500)" 
          fillOpacity="0.1" 
        />
        
        {/* Main line chart */}
        <path 
          d={getPath()} 
          fill="none" 
          stroke="var(--color-primary-500)" 
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Moving averages */}
        <path 
          d={getMAPath()} 
          fill="none" 
          stroke="var(--color-accent-400)"
          strokeWidth="0.8"
          opacity="0.8"
          strokeDasharray="1 2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      
      {/* Position the price label as an HTML overlay to avoid SVG stretching */}
      <div 
        style={{
          position: 'absolute',
          right: '0',
          top: `calc(${(priceY / height) * 100}% - 10px)`,
          backgroundColor: 'var(--color-primary-500)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '2px',
          fontSize: '12px',
          lineHeight: '1',
          fontFamily: 'sans-serif',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '40px'
        }}
      >
        {chartData[chartData.length-1].y.toFixed(2)}
      </div>
    </div>
  );
};

// Critical Transactions component
interface CriticalTransactionsProps {
  transactions: Transaction[];
}

const CriticalTransactions: React.FC<CriticalTransactionsProps> = ({ transactions }) => {
  return (
    <div className="home_critical_transactions_panel_container">
      <div className="home_panel_header">
        <div className="home_panel_header_left">
          <h3>Critical Transactions</h3>
          <div className="home_panel_header_subtitle">High priority trades for review</div>
        </div>
        <div className="home_panel_actions">
          <button className="home_text_button">Review All</button>
        </div>
      </div>
      
      <div className="home_critical_transactions_list">
        {transactions.map((transaction) => (
          <div className="home_critical_transaction_card" key={transaction.id}>
            <div className="home_transaction_header">
              <div className="home_transaction_badge">{transaction.currency || transaction.contractType}</div>
              <div className="home_transaction_price">${transaction.amount ? (typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : transaction.amount) : '0.00'}</div>
            </div>
            
            <div className="home_transaction_details">
              <div className="home_detail_row">
                <div className="home_detail_label">Status:</div>
                <div className="home_detail_value">{transaction.status}</div>
              </div>
              <div className="home_detail_row">
                <div className="home_detail_label">User:</div>
                <div className="home_detail_value">{transaction.user || transaction.client || 'Unknown'}</div>
              </div>
              <div className="home_detail_row">
                <div className="home_detail_label">Transaction ID:</div>
                <div className="home_detail_value">{transaction.id}</div>
              </div>
              <div className="home_detail_row">
                <div className="home_detail_label">Created At:</div>
                <div className="home_detail_value">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'Unknown'}</div>
              </div>
            </div>
            
            <div className="home_transaction_actions">
              <button className="home_action_button primary">Review</button>
              <button className="home_action_button warning">Flag</button>
            </div>
          </div>
        ))}
      </div>
    </div>
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

// Main Home Component
const Home: React.FC = () => {
  // Data fetching
  const { data: txs } = useTransactions();

  // Chart state for time selection
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
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
  
  // Sample market indices data
  const marketIndices: MarketIndex[] = [
    { name: 'S&P 500', value: 4892.37, change: 18.24, changePercent: 0.37 },
    { name: 'NASDAQ', value: 15982.18, change: -28.42, changePercent: -0.18 },
    { name: 'DOW', value: 38654.22, change: 134.58, changePercent: 0.35 },
    { name: 'VIX', value: 14.12, change: -0.42, changePercent: -2.89 }
  ];
  
  // Critical example transactions based on provided data
  const criticalTransactions: Transaction[] = [
    {
      id: 'tx_critical_001',
      user: 'nova@trading.com',
      amount: 65760.00,
      currency: 'WTI',
      status: 'flagged',
      createdAt: '2025-07-15T12:30:45Z',
      // Extended properties
      contractType: 'Futures',
      contractMonth: 'July/26',
      client: 'Nova Trading'
    },
    {
      id: 'tx_critical_002',
      user: 'sun@trading.net',
      amount: 7800.00,
      currency: 'NGO',
      status: 'flagged',
      createdAt: '2025-05-03T09:15:22Z',
      // Extended properties
      contractType: 'Options',
      contractMonth: 'May/27',
      client: 'Sun Trading'
    },
    {
      id: 'tx_critical_003',
      user: 'sun@trading.net',
      amount: 7800.00,
      currency: 'NGO',
      status: 'pending',
      createdAt: '2025-05-05T14:22:36Z',
      // Extended properties
      contractType: 'Options',
      contractMonth: 'May/27',
      client: 'Sun Trading'
    }
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
    }
  ];
  
  return (
    <div className="home_container">
      <header className="home_header">
        <h1>Transaction Dashboard</h1>
        <div className="home_header_actions">
          <div className="home_search_bar">
            <Icons.Search />
            <input type="text" placeholder="Search transactions..." />
          </div>
          <div className="home_user_actions">
            <button className="home_icon_button">
              <Icons.Bell />
              <span className="home_notification_badge">3</span>
            </button>
            <div className="home_user_avatar">
              <img src="https://i.pravatar.cc/32" alt="User avatar" />
            </div>
          </div>
        </div>
      </header>

      <div className="home_dashboard">
        <div className="home_tab_selector">
          <button className="home_tab_button active">Dashboard</button>
          <button className="home_tab_button">Analytics</button>
          <button className="home_tab_button">Transactions</button>
          <button className="home_tab_button">Reports</button>
        </div>

        <div className="home_dashboard_wrapper">
          {/* Risk Metrics Section */}
          <section className="home_metrics_panel" style={{gridColumn: "span 12"}}>
            <div className="home_metrics_grid">
              {riskMetrics.map((metric) => (
                <div 
                  key={metric.id} 
                  className={`home_metric_card ${selectedMetric === metric.id ? 'selected' : ''} ${
                    metric.severity === 'critical' ? 'critical' :
                    metric.severity === 'high' ? 'high' :
                    metric.severity === 'medium' ? 'medium' :
                    'low'
                  }`}
                  onClick={() => setSelectedMetric(metric.id === selectedMetric ? null : metric.id)}
                >
                  <div className="home_metric_header">
                    <h3>{metric.name}</h3>
                  </div>
                  <div className="home_metric_value">
                    {metric.value.toLocaleString()}<span className="home_metric_unit">{metric.unit}</span>
                  </div>
                  <div className="home_metric_change">
                    {metric.trend === 'up' ? <Icons.TrendUp /> : metric.trend === 'down' ? <Icons.TrendDown /> : null}
                    {metric.change.toFixed(1)}% {metric.trend === 'up' ? 'increase' : metric.trend === 'down' ? 'decrease' : ''}
                  </div>
                  {metric.severity === 'critical' && (
                    <div className="home_metric_card_alert">Requires immediate attention</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Transaction Clusters Section */}
          <section className="home_clusters_panel" style={{gridColumn: "span 12"}}>
            <ClusteringGraph />
          </section>

          {/* Critical Transactions Section */}
          <section className="home_critical_transactions_panel" style={{gridColumn: "span 12"}}>
            <CriticalTransactions transactions={criticalTransactions} />
          </section>

          {/* Charts Section */}
          <div className="home_dashboard_grid" style={{gridColumn: "span 12"}}>
            {/* Market Indices Section */}
            <section className="home_market_panel" style={{gridColumn: "span 12", marginBottom: "20px"}}>
              <div className="home_panel_header">
                <div className="home_panel_header_left">
                  <h3>Market Indices</h3>
                </div>
                <div className="home_panel_actions">
                  <button className="home_text_button">Refresh</button>
                </div>
              </div>
              
              <div className="home_market_indices_grid">
                {marketIndices.map((index) => (
                  <div className="home_market_index_card" key={index.name}>
                    <div className="home_market_index_name">{index.name}</div>
                    <div className="home_market_index_value">{index.value.toLocaleString()}</div>
                    <div className={`home_market_index_change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                      {index.change >= 0 ? <Icons.TrendUp /> : <Icons.TrendDown />}
                      {Math.abs(index.change).toFixed(2)} ({index.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="home_chart_panel main_chart" style={{gridColumn: "span 8"}}>
              <div className="home_panel_header">
                <div className="home_panel_header_left">
                  <h3>Transaction Volume</h3>
                </div>
                <div className="home_panel_actions">
                  <div className="home_time_selector">
                    {['24h', '7d', '30d', '90d'].map(timeRange => (
                      <button 
                        key={timeRange}
                        className={`home_time_button ${selectedTimeRange === timeRange ? 'active' : ''}`}
                        onClick={() => setSelectedTimeRange(timeRange)}
                      >
                        {timeRange}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="home_chart_container">
                <ChartVisualization 
                  height={280} 
                  showVolume={true} 
                  timeRange={selectedTimeRange}
                />
              </div>
            </section>
            
            <section className="home_activity_panel" style={{gridColumn: "span 4"}}>
              <div className="home_panel_header">
                <div className="home_panel_header_left">
                  <h3>Recent Activity</h3>
                </div>
                <div className="home_panel_actions">
                  <button className="home_icon_button small">
                    <Icons.MoreHorizontal />
                  </button>
                </div>
              </div>
              
              <div className="home_activity_list">
                {activityItems.map((activity, index) => (
                  <div className={`home_activity_item ${activity.priority}`} key={index}>
                    <div className="home_activity_icon">
                      {activity.type === 'alert' ? <Icons.AlertCircle /> : 
                       activity.type === 'transaction' ? <Icons.Flag /> :
                       activity.type === 'system' ? <Icons.Settings /> : <Icons.User />}
                    </div>
                    <div className="home_activity_content">
                      <div className="home_activity_title">{activity.title}</div>
                      <div className="home_activity_description">{activity.description}</div>
                      <div className="home_activity_time">
                        <Icons.Calendar />{activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Recent Transactions Table */}
          <section className="home_transactions_panel" style={{gridColumn: "span 12"}}>
            <div className="home_panel_header">
              <div className="home_panel_header_left">
                <h3>Recent Transactions</h3>
              </div>
              <div className="home_panel_actions">
                <button className="home_action_button secondary">
                  <Icons.Filter />
                  Filter
                </button>
                <button className="home_action_button primary">View All</button>
              </div>
            </div>
            
            <div className="home_table_container">
              <table className="home_transactions_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Currency</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(txs ?? []).slice(0, 5).map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.currency || 'Unknown'}</td>
                      <td>{tx.user || 'Unknown'}</td>
                      <td>${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : '0.00'}</td>
                      <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Unknown'}</td>
                      <td>
                        <span className={`home_status_badge ${tx.status || 'pending'}`}>
                          {tx.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="home_table_actions">
                          <button className="home_icon_button small">
                            <Icons.MoreHorizontal />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
