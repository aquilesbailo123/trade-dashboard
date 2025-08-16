import { useState, useMemo } from "react";
import { useTransactions } from "../../api/queries";
import "./Transactions.css";

// Icon component interface
interface IconProps {
    size?: number;
    color?: string;
}

// Chart point interface
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

// Enterprise-styled icons
const Icons = {
    Calendar: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    ),
    ChevronDown: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    ),
    RefreshCw: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    ),
    Search: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    Filter: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
    Download: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    ),
    TrendUp: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 6l-9.5 9.5-5-5L1 18" />
            <path d="M17 6h6v6" />
        </svg>
    ),
    TrendDown: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 18l-9.5-9.5-5 5L1 6" />
            <path d="M17 18h6v-6" />
        </svg>
    ),
    BarChart: ({ size = 24, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
    ),
    AlertCircle: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    )
};

// Advanced chart component for transaction visualization
const ChartVisualization = ({ 
  height = 250, 
  showVolume = true,
  timeRange = '30d'
}: ChartProps) => {
  
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
        
        {/* Current price highlight */}
        <g>
          <line 
            x1="0" 
            y1={priceY} 
            x2="100" 
            y2={priceY}
            stroke="var(--color-primary-400)" 
            strokeWidth="0.5" 
            strokeDasharray="1 2" 
            vectorEffect="non-scaling-stroke"
          />
        </g>
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
        ${chartData[chartData.length-1].y.toFixed(2)}
      </div>
    </div>
  );
};

export default function Transactions() {
    const { data, isLoading } = useTransactions();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [timeRange, setTimeRange] = useState("7d");

    // Filter transactions based on search and status
    const filteredTransactions = useMemo(() => {
        if (!data) return [];
        return data.filter(transaction => {
            const matchesSearch = searchQuery === '' ||
                transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.user.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [data, searchQuery, statusFilter]);

    // Count transactions by status for summary stats
    const stats = useMemo(() => {
        if (!data) return { total: 0, approved: 0, pending: 0, rejected: 0, flagged: 0 };
        
        return data.reduce((acc, transaction) => {
            acc.total++;
            if (transaction.status === 'approved') acc.approved++;
            if (transaction.status === 'pending') acc.pending++;
            if (transaction.status === 'rejected') acc.rejected++;
            if (transaction.status === 'flagged') acc.flagged++;
            return acc;
        }, { total: 0, approved: 0, pending: 0, rejected: 0, flagged: 0 });
    }, [data]);

    return (
        <div className="homePage">
            {/* Professional dashboard header */}
            <header className="dashboardHeader">
                <div className="dashboardHeader__title">
                    <h1>Transactions</h1>
                    <div className="dashboardHeader__subtitle">Monitor and manage payment activity</div>
                </div>

                <div className="dashboardControls">
                    <div className="dateSelector">
                        <Icons.Calendar size={14} />
                        <span>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <Icons.ChevronDown size={14} />
                    </div>
                    <button className="refreshButton">
                        <Icons.RefreshCw size={14} />
                        <span>Refresh</span>
                    </button>
                </div>
            </header>

            {/* Risk metrics cards */}
            <section className="riskMetrics">
                <div className="metricCard severity-low">
                    <div className="metricCard__icon">
                        <Icons.BarChart size={18} />
                    </div>
                    <div className="metricCard__content">
                        <h4>Total Transactions</h4>
                        <div className="metricCard__value">{stats.total}</div>
                        <div className="metricCard__change">All time</div>
                    </div>
                </div>
                <div className="metricCard severity-low">
                    <div className="metricCard__icon">
                        <Icons.RefreshCw size={18} />
                    </div>
                    <div className="metricCard__content">
                        <h4>Approved</h4>
                        <div className="metricCard__value">{stats.approved}</div>
                        <div className="metricCard__change up">
                            <Icons.TrendUp size={12} />
                            {stats.total > 0 ? Math.round(stats.approved / stats.total * 100) : 0}% success rate
                        </div>
                    </div>
                </div>
                <div className="metricCard severity-medium">
                    <div className="metricCard__icon">
                        <Icons.RefreshCw size={18} />
                    </div>
                    <div className="metricCard__content">
                        <h4>Pending</h4>
                        <div className="metricCard__value">{stats.pending}</div>
                        <div className="metricCard__change">Awaiting confirmation</div>
                    </div>
                </div>
                <div className="metricCard severity-high">
                    <div className="metricCard__icon">
                        <Icons.AlertCircle size={18} />
                    </div>
                    <div className="metricCard__content">
                        <h4>Flagged</h4>
                        <div className="metricCard__value">{stats.flagged}</div>
                        <div className="metricCard__change down">
                            <Icons.TrendDown size={12} />
                            Requires review
                        </div>
                    </div>
                </div>
            </section>

            <div className="dashboardGrid">
                {/* Chart panel */}
                <section className="chartPanel mainChart">
                    <div className="panelHeader">
                        <div className="panelHeader__left">
                            <h3>Transaction Volume</h3>
                            <div className="panelHeader__subtitle">Payment activity over time</div>
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
                        <ChartVisualization height={280} timeRange={timeRange} showVolume={true} />
                    </div>
                    <div className="chartLegend">
                        <div className="legendItem">
                            <div className="legendColor" style={{background: 'var(--color-primary-500)'}}></div>
                            <span>Transaction Volume</span>
                        </div>
                        <div className="legendItem">
                            <div className="legendColor" style={{background: 'var(--color-accent-400)'}}></div>
                            <span>7-day Moving Avg</span>
                        </div>
                    </div>
                </section>
                
                {/* Activity panel with filters */}
                <section className="activityPanel">
                    <div className="panelHeader">
                        <div className="panelHeader__left">
                            <h3>Filters</h3>
                            <div className="panelHeader__subtitle">Search and filter transactions</div>
                        </div>
                    </div>
                    
                    <div className="filterContainer">
                        <div className="filterGroup">
                            <label className="filterLabel">Search</label>
                            <div className="searchContainer">
                                <Icons.Search size={14} />
                                <input 
                                    type="text" 
                                    className="searchInput" 
                                    placeholder="Search transactions..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="filterGroup">
                            <label className="filterLabel">Status</label>
                            <div className="filterDropdown">
                                <Icons.Filter size={14} />
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="filterSelect"
                                >
                                    <option value="all">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="flagged">Flagged</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        
                        <button className="exportButton">
                            <Icons.Download size={14} />
                            <span>Export</span>
                        </button>
                    </div>
                    
                    <div className="panelHeader">
                        <div className="panelHeader__left">
                            <h3>Transaction Alerts</h3>
                            <div className="panelHeader__subtitle">Recent activity</div>
                        </div>
                    </div>
                    
                    <div className="activityFeed">
                        <div className="activityItem">
                            <div className="activityItem__icon severity-high">
                                <Icons.AlertCircle size={14} />
                            </div>
                            <div className="activityItem__content">
                                <div className="activityItem__title">Suspicious transaction flagged</div>
                                <div className="activityItem__desc">Transaction #TX78921 detected as potential fraud</div>
                                <div className="activityItem__time">10 minutes ago</div>
                            </div>
                        </div>

                        <div className="activityItem">
                            <div className="activityItem__icon severity-medium">
                                <Icons.RefreshCw size={14} />
                            </div>
                            <div className="activityItem__content">
                                <div className="activityItem__title">Verification pending</div>
                                <div className="activityItem__desc">Transaction #TX78900 awaiting verification</div>
                                <div className="activityItem__time">32 minutes ago</div>
                            </div>
                        </div>

                        <div className="activityItem">
                            <div className="activityItem__icon severity-low">
                                <Icons.RefreshCw size={14} />
                            </div>
                            <div className="activityItem__content">
                                <div className="activityItem__title">Transaction approved</div>
                                <div className="activityItem__desc">Transaction #TX78890 completed successfully</div>
                                <div className="activityItem__time">45 minutes ago</div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Transactions panel */}
                <section className="transactionsPanel">
                    <div className="panelHeader">
                        <div className="panelHeader__left">
                            <h3>Transactions</h3>
                            <div className="panelHeader__subtitle">Showing {filteredTransactions.length} transaction(s)</div>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="loadingState">
                            <div className="spinner"></div>
                            <p>Loading transactions...</p>
                        </div>
                    ) : (
                        <div className="transactionsTable__wrapper">
                            <table className="transactionsTable">
                                <thead>
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>User</Th>
                                        <Th>Amount</Th>
                                        <Th>Status</Th>
                                        <Th>Created</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="emptyState">
                                                    <div className="emptyState__icon">🔍</div>
                                                    <h3>No transactions found</h3>
                                                    <p>Try adjusting your search or filter criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((t) => (
                                            <tr key={t.id} className="transactionsTable__row">
                                                <Td>{t.id}</Td>
                                                <Td>{t.user}</Td>
                                                <Td>${parseFloat(String(t.amount)).toLocaleString()} {t.currency}</Td>
                                                <Td>
                                                    <span className={`statusBadge statusBadge--${t.status.toLowerCase()}`}>{t.status}</span>
                                                </Td>
                                                <Td>{new Date(t.createdAt).toLocaleString()}</Td>
                                                <Td>
                                                    <div className="actionButtons">
                                                        <button className="actionButton">View</button>
                                                        {t.status === 'pending' && (
                                                            <button className="actionButton actionButton--danger">Cancel</button>
                                                        )}
                                                    </div>
                                                </Td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="txTable__th">{children}</th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td className="txTable__td">{children}</td>
    );
}
