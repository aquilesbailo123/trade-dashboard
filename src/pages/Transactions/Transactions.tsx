import { useState, useMemo } from "react";
import { useTrades, useStats } from "../../hooks/useTrades";
import "./Transactions.css";

// Interface definitions
interface IconProps {
    size?: number;
    color?: string;
}

// interface TransactionItem {
//     id: string;
//     amount: number;
//     user: string;
//     status: string;
//     riskScore: number;
//     createdAt: string;
//     currency: string;
// }

// interface TransactionCluster {
//     id: string;
//     x: number;
//     y: number;
//     size: number;
//     color: string;
//     transactions: TransactionItem[];
// }

// Chart point interface
// interface ChartPoint {
//     x: number;
//     y: number;
// }

// Chart props interface for transaction visualization components
// interface TransactionChartProps {
//     timeRange: string;
//     showVolume?: boolean;
// }

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
    ),
    Eye: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    ),
    X: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    Check: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    Flag: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
    ),
    ChevronLeft: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    ChevronRight: ({ size = 16, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    )
};

// Simple cluster visualization component
// const TransactionClusterViz = ({ timeRange = '7d' }: { timeRange?: string }) => {
//     // Sample cluster data that uses the TransactionCluster interface and varies based on timeRange
//     const clusterData = useMemo<TransactionCluster[]>(() => {
//         // Adjust cluster size and position based on the selected timeRange
//         const scaleFactor = timeRange === '24h' ? 0.8 : 
//                            timeRange === '7d' ? 1.0 : 
//                            timeRange === '30d' ? 1.2 : 1.4;
                           
//         return [
//         {
//             id: 'cluster-1',
//             x: 30,
//             y: 40,
//             size: 20 * scaleFactor,
//             color: 'var(--color-primary-500)',
//             transactions: [
//                 { id: 'tx-1', amount: 250, user: 'User A', status: 'completed', riskScore: 15, createdAt: '2023-10-01', currency: 'USD' },
//                 { id: 'tx-2', amount: 175, user: 'User B', status: 'completed', riskScore: 12, createdAt: '2023-10-02', currency: 'USD' },
//             ],
//         },
//         {
//             id: 'cluster-2',
//             x: 70,
//             y: 60,
//             size: 15 * scaleFactor,
//             color: 'var(--color-accent-500)',
//             transactions: [
//                 { id: 'tx-3', amount: 500, user: 'User C', status: 'pending', riskScore: 45, createdAt: '2023-10-03', currency: 'USD' },
//             ],
//         }
//     ];
//     }, [timeRange]);
    
//     return (
//         <div className="transactions_cluster_visualization">
//             <svg width="100%" height="200" viewBox="0 0 100 100">
//                 {clusterData.map(cluster => (
//                     <circle 
//                         key={cluster.id}
//                         cx={cluster.x}
//                         cy={cluster.y}
//                         r={cluster.size / 5}
//                         fill={cluster.color}
//                         opacity={0.7}
//                         className="transactions_cluster_circle"
//                     />
//                 ))}
//             </svg>
//         </div>
//     );
// };

// Advanced chart component for transaction visualization
// const TransactionChartVisualization = ({ timeRange, showVolume = true }: TransactionChartProps) => {
//     // Chart dimensions
//     const chartHeight = 200;
//     const viewBoxWidth = 400; // SVG viewBox width
  
//     // Generate sample data based on timeRange
//     const chartData = useMemo(() => {
//         // Map timeRange to number of data points
//         const timeRangeMap: Record<string, number> = {
//             '24h': 24,
//             '7d': 7 * 24, // hourly for 7 days
//             '30d': 30,
//             '90d': 90
//         };
        
//         const dataPoints = timeRangeMap[timeRange] || 30;
//         const startPrice = 156;
//         let volatility = 2;
        
//         // Adjust volatility based on time range
//         if (timeRange === '24h') volatility = 0.5;
//         else if (timeRange === '7d') volatility = 1;
//         else if (timeRange === '90d') volatility = 3;
        
//         const now = new Date();
//         let prevPrice = startPrice;
        
//         return Array(dataPoints).fill(0).map((_, i) => {
//             const dayChange = (Math.random() - 0.5) * volatility;
//             const price = prevPrice + dayChange;
//             prevPrice = price; // Store for next iteration
//             const volume = Math.floor(Math.random() * (2000 + i % 500)) + 500;
            
//             // Create appropriate date based on timeRange
//             let date;
//             if (timeRange === '24h') {
//                 date = new Date(now.getTime() - (dataPoints - i) * 60 * 60 * 1000);
//             } else if (timeRange === '7d') {
//                 date = new Date(now.getTime() - (dataPoints - i) * 60 * 60 * 1000);
//             } else if (timeRange === '30d') {
//                 date = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
//             } else {
//                 date = new Date(now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000);
//             }
            
//             return {
//                 price,
//                 volume,
//                 date,
//                 x: i,
//                 y: price
//             };
//         });
//     }, [timeRange]);
  
//     const maxY = useMemo(() => Math.max(...chartData.map(p => p.y)) + 5, [chartData]);
//     const minY = useMemo(() => Math.min(...chartData.map(p => p.y)) - 5, [chartData]);
//     const range = useMemo(() => maxY - minY, [maxY, minY]);
  
//     const getPath = () => {
//         if (!chartData.length) return '';
        
//         // Use consistent SVG viewBox width of 100 for all calculations
//         const viewBoxWidth = 100;
//         const adjustedHeight = chartHeight - (showVolume ? 50 : 0);
        
//         const scaledPoints = chartData.map((p, i) => {
//             // Scale x from 0 to viewBoxWidth based on position in array
//             const x = (i / (chartData.length - 1)) * viewBoxWidth;
//             // Scale y from minY-maxY range to 0-chartHeight (inverted, since SVG y goes down)
//             const y = adjustedHeight - (((p.y - minY) / range) * (adjustedHeight - 20)) - 10;
//             return {x, y};
//         });
        
//         return scaledPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
//     };
  
//     const getAreaPath = () => {
//         const adjustedHeight = showVolume ? chartHeight - 50 : chartHeight;
//         return `${getPath()} L ${viewBoxWidth} ${adjustedHeight - 10} L 0 ${adjustedHeight - 10} Z`;
//     };

//     const getMAPath = () => {
//         if (chartData.length < 7) return ''; // Not enough data for MA

//         // Calculate Moving Average for each point
//         const window = 7; // 7-day moving average
//         const maPoints: ChartPoint[] = [];
//         const viewBoxWidth = 100;
//         const adjustedHeight = chartHeight - (showVolume ? 50 : 0);
        
//         for (let i = window - 1; i < chartData.length; i++) {
//             let sum = 0;
//             for (let j = 0; j < window; j++) {
//                 sum += chartData[i - j].y;
//             }
//             maPoints.push({
//                 x: chartData[i].x,
//                 y: sum / window,
//             });
//         }
        
//         return maPoints.map((p) => ({
//             x: (p.x / (chartData.length - 1)) * viewBoxWidth,
//             y: adjustedHeight - (((p.y - minY) / range) * adjustedHeight),
//         })).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
//     };
  
//     // Calculate the current price y position
//     const adjustedHeight = chartHeight - (showVolume ? 50 : 0);
//     const priceY = adjustedHeight - (((chartData[chartData.length-1].y - minY) / range) * adjustedHeight);
  
//     return (
//         <div className="transactions_chart">
//             <svg width="100%" height={chartHeight} viewBox={`0 0 ${viewBoxWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
//                 {/* Background grid */}
//                 <rect width={viewBoxWidth} height={chartHeight} fill="var(--color-surface-secondary)" fillOpacity="0.5" rx="4" />
                
//                 {/* Grid lines - horizontal */}
//                 {[...Array(5)].map((_, i) => {
//                     const yPos = (adjustedHeight / 4) * i;
//                     return (
//                         <g key={`h-grid-${i}`}>
//                             <line 
//                                 x1="0" y1={yPos} x2={viewBoxWidth} y2={yPos}
//                                 stroke="var(--color-border-primary)" strokeWidth="1" strokeDasharray="4 4" 
//                                 opacity="0.3"
//                             />
//                         </g>
//                     );
//                 })}
                
//                 {/* Grid lines - vertical */}
//                 {[...Array(6)].map((_, i) => {
//                     const xPos = (viewBoxWidth / 5) * i;
//                     return (
//                         <g key={`v-grid-${i}`}>
//                             <line 
//                                 x1={xPos} y1="0" x2={xPos} y2={adjustedHeight}
//                                 stroke="var(--color-border-primary)" strokeWidth="1" strokeDasharray="4 4" 
//                                 opacity="0.3"
//                             />
//                         </g>
//                     );
//                 })}
                
//                 {/* Area chart */}
//                 <defs>
//                     <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                         <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.3" />
//                         <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0.05" />
//                     </linearGradient>
//                 </defs>
//                 <path 
//                     d={getAreaPath()} 
//                     fill="url(#chartGradient)" 
//                     className="transactions_chart_area"
//                 />
                
//                 {/* Main line chart */}
//                 <path 
//                     d={getPath()} 
//                     fill="none" 
//                     stroke="var(--color-primary-500)" 
//                     strokeWidth="3"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="transactions_chart_line"
//                 />
                
//                 {/* Moving averages */}
//                 <path 
//                     d={getMAPath()} 
//                     fill="none" 
//                     stroke="var(--color-accent-400)"
//                     strokeWidth="2"
//                     opacity="0.7"
//                     strokeDasharray="8 4"
//                     strokeLinecap="round"
//                     className="transactions_chart_ma_line"
//                 />
                
//                 {/* Current price highlight */}
//                 <g>
//                     <line 
//                         x1="0" 
//                         y1={priceY} 
//                         x2={viewBoxWidth} 
//                         y2={priceY}
//                         stroke="var(--color-primary-400)" 
//                         strokeWidth="2" 
//                         strokeDasharray="8 4" 
//                         opacity="0.6"
//                         className="transactions_chart_price_line"
//                     />
//                     <circle 
//                         cx={viewBoxWidth - 10} 
//                         cy={priceY} 
//                         r="4" 
//                         fill="var(--color-primary-500)" 
//                         stroke="var(--color-surface-primary)" 
//                         strokeWidth="2"
//                     />
//                 </g>
//             </svg>
//             {/* Position the price label as an HTML overlay */}
//             <div 
//                 className="transactions_price_label"
//                 style={{
//                     top: `calc(${(priceY / chartHeight) * 100}% - 10px)`,
//                 }}
//             >
//                 ${chartData[chartData.length-1].y.toFixed(2)}
//             </div>
//         </div>
//     );
// };

export default function Transactions() {
    const { data: tradesData, isLoading: tradesLoading, error: tradesError } = useTrades(1000000);
    const { data: statsData } = useStats();
    // const [searchQuery, setSearchQuery] = useState('');
    // const [statusFilter, setStatusFilter] = useState('all');
    // const [timeRange, setTimeRange] = useState("7d");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [riskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    // Process trades data for display (same as Home page)
    const processedTrades = useMemo(() => {
        if (!tradesData?.trades) return [];
        
        return tradesData.trades
            .map(trade => ({
                ...trade,
                // Map backend trade data to display format
                user: trade.client,
                amount: trade.price,
                currency: trade.contract_type,
                createdAt: trade.date_of_execution,
                status: trade.is_validated ? 'approved' : (trade.is_anomaly ? 'flagged' : 'pending'),
                risk: trade.is_anomaly ? 'high' : (trade.anomaly_score && trade.anomaly_score < -0.1 ? 'low' : 'medium'),
                isOutlier: trade.is_anomaly || false
            }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [tradesData]);

    // Filter trades based on risk level
    const filteredTrades = useMemo(() => {
        if (riskFilter === 'all') return processedTrades;
        return processedTrades.filter(trade => trade.risk === riskFilter);
    }, [processedTrades, riskFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTrades.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedTrades = filteredTrades.slice(startIndex, startIndex + pageSize);


    // Calculate metrics for dashboard using backend stats data (same as Home page)
    const metricValues = useMemo(() => {
        if (statsData) {
            // Use backend stats for accurate system-wide metrics
            return {
                totalTrades: statsData.total_trades,
                validatedTrades: statsData.validated_trades,
                detectedAnomalies: statsData.detected_anomalies,
                anomalyRate: statsData.anomaly_rate
            };
        }
        
        // Fallback to calculating from processed trades if backend stats unavailable
        if (!processedTrades || processedTrades.length === 0) {
            return {
                totalTrades: 0,
                validatedTrades: 0,
                detectedAnomalies: 0,
                anomalyRate: 0
            };
        }

        const total = processedTrades.length;
        const approved = processedTrades.filter(trade => trade.status === 'approved').length;
        const flagged = processedTrades.filter(trade => trade.status === 'flagged').length;

        return {
            totalTrades: total,
            validatedTrades: approved,
            detectedAnomalies: flagged,
            anomalyRate: total > 0 ? (flagged / total) * 100 : 0
        };
    }, [statsData, processedTrades]);

    // Calculate stats for the pending metric (uses processed trades)
    const stats = useMemo(() => {
        if (!processedTrades) return { pending: 0 };
        
        return {
            pending: processedTrades.filter(trade => trade.status === 'pending').length
        };
    }, [processedTrades]);

    return (
        <div className="transactions_page">
            {/* Professional dashboard header */}
            <header className="transactions_header">
                <div className="transactions_header_title">
                    <h1>Transactions</h1>
                    <div className="transactions_header_subtitle">Monitor and manage trading activity</div>
                </div>

                <div className="transactions_controls">
                    {/* <div className="transactions_date_selector">
                        <Icons.Calendar size={14} />
                        <span>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <Icons.ChevronDown size={14} />
                    </div> */}
                    <button className="transactions_refresh_button">
                        <Icons.RefreshCw size={14} />
                        <span>Refresh</span>
                    </button>
                </div>
            </header>

            {/* Risk metrics cards */}
            <section className="transactions_risk_metrics">
                <div className="transactions_metric_card transactions_severity_low">
                    <div className="transactions_metric_card_icon">
                        <Icons.BarChart size={18} />
                    </div>
                    <div className="transactions_metric_card_content">
                        <h4>Total Trades</h4>
                        <div className="transactions_metric_card_value">{metricValues.totalTrades}</div>
                        <div className="transactions_metric_card_change">Total trades displayed</div>
                    </div>
                </div>
                <div className="transactions_metric_card transactions_severity_low">
                    <div className="transactions_metric_card_icon">
                        <Icons.RefreshCw size={18} />
                    </div>
                    <div className="transactions_metric_card_content">
                        <h4>Validated Trades</h4>
                        <div className="transactions_metric_card_value">{metricValues.validatedTrades}</div>
                        <div className="transactions_metric_card_change transactions_up">
                            <Icons.TrendUp size={12} />
                            Trades that received human validation
                        </div>
                    </div>
                </div>
                <div className="transactions_metric_card transactions_severity_medium">
                    <div className="transactions_metric_card_icon">
                        <Icons.RefreshCw size={18} />
                    </div>
                    <div className="transactions_metric_card_content">
                        <h4>Pending</h4>
                        <div className="transactions_metric_card_value">{stats.pending}</div>
                        <div className="transactions_metric_card_change">Transactions awaiting confirmation</div>
                    </div>
                </div>
                <div className="transactions_metric_card transactions_severity_high">
                    <div className="transactions_metric_card_icon">
                        <Icons.AlertCircle size={18} />
                    </div>
                    <div className="transactions_metric_card_content">
                        <h4>Detected Anomalies</h4>
                        <div className="transactions_metric_card_value">{metricValues.detectedAnomalies}</div>
                        <div className="transactions_metric_card_change transactions_down">
                            <Icons.TrendDown size={12} />
                            Trades flagged as anomalous by ML model
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content grid with chart and activity panel */}
            <div className="transactions_analysis_grid">
                {/* Chart visualization section */}
                {/* <section className="transactions_chart_section">
                    <div className="transactions_section_header">
                        <h3>Transaction Volume Analysis</h3>
                        <div className="transactions_time_controls">
                            <button 
                                className={`transactions_control_button ${timeRange === "24h" ? "active" : ""}`}
                                onClick={() => setTimeRange("24h")}
                            >
                                24h
                            </button>
                            <button 
                                className={`transactions_control_button ${timeRange === "7d" ? "active" : ""}`}
                                onClick={() => setTimeRange("7d")}
                            >
                                7d
                            </button>
                            <button 
                                className={`transactions_control_button ${timeRange === "30d" ? "active" : ""}`}
                                onClick={() => setTimeRange("30d")}
                            >
                                30d
                            </button>
                            <button 
                                className={`transactions_control_button ${timeRange === "90d" ? "active" : ""}`}
                                onClick={() => setTimeRange("90d")}
                            >
                                90d
                            </button>
                        </div>
                    </div>
                    
                    <div className="transactions_chart_container">
                        <TransactionChartVisualization timeRange={timeRange} showVolume={true} />
                    </div>
                    
                    <div className="transactions_cluster_container">
                        <h4 className="transactions_subheading">Transaction Clusters</h4>
                        <TransactionClusterViz timeRange={timeRange} />
                    </div>
                    
                    <div className="transactions_chart_legend">
                        <div className="transactions_legend_item">
                            <div className="transactions_legend_color" style={{background: 'var(--color-primary-500)'}}></div>
                            <span>Transaction Volume</span>
                        </div>
                        <div className="transactions_legend_item">
                            <div className="transactions_legend_color" style={{background: 'var(--color-accent-400)'}}></div>
                            <span>7-day Moving Avg</span>
                        </div>
                    </div>
                </section> */}
                
                {/* Activity panel with filters */}
                {/* <section className="transactions_activity_panel">
                    <div className="transactions_panel_header">
                        <div className="transactions_panel_header_left">
                            <h3>Filters</h3>
                            <div className="transactions_panel_header_subtitle">Search and filter transactions</div>
                        </div>
                    </div>
                    
                    <div className="transactions_filter_container">
                        <div className="transactions_filter_group">
                            <label className="transactions_filter_label">Search</label>
                            <div className="transactions_search_container">
                                <Icons.Search size={14} />
                                <input 
                                    type="text" 
                                    className="transactions_search_input" 
                                    placeholder="Search transactions..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="transactions_filter_group">
                            <label className="transactions_filter_label">Status</label>
                            <div className="transactions_filter_dropdown">
                                <Icons.Filter size={14} />
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="transactions_filter_select"
                                >
                                    <option value="all">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="flagged">Flagged</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        
                        <button className="transactions_export_button">
                            <Icons.Download size={14} />
                            <span>Export</span>
                        </button>
                    </div> */}
                    
                    {/* <div className="transactions_panel_header">
                        <div className="transactions_panel_header_left">
                            <h3>Transaction Alerts</h3>
                            <div className="transactions_panel_header_subtitle">Recent activity</div>
                        </div>
                    </div>
                    
                    <div className="transactions_activity_feed">
                        <div className="transactions_activity_item">
                            <div className="transactions_activity_item_icon transactions_severity_high">
                                <Icons.AlertCircle size={14} />
                            </div>
                            <div className="transactions_activity_item_content">
                                <div className="transactions_activity_item_title">Suspicious transaction flagged</div>
                                <div className="transactions_activity_item_desc">Transaction #TX78921 detected as potential fraud</div>
                                <div className="transactions_activity_item_time">10 minutes ago</div>
                            </div>
                        </div>

                        <div className="transactions_activity_item">
                            <div className="transactions_activity_item_icon transactions_severity_medium">
                                <Icons.RefreshCw size={14} />
                            </div>
                            <div className="transactions_activity_item_content">
                                <div className="transactions_activity_item_title">Verification pending</div>
                                <div className="transactions_activity_item_desc">Transaction #TX78900 awaiting verification</div>
                                <div className="transactions_activity_item_time">32 minutes ago</div>
                            </div>
                        </div>

                        <div className="transactions_activity_item">
                            <div className="transactions_activity_item_icon transactions_severity_low">
                                <Icons.RefreshCw size={14} />
                            </div>
                            <div className="transactions_activity_item_content">
                                <div className="transactions_activity_item_title">Transaction approved</div>
                                <div className="transactions_activity_item_desc">Transaction #TX78890 completed successfully</div>
                                <div className="transactions_activity_item_time">45 minutes ago</div>
                            </div>
                        </div>
                    </div> */}
                {/* </section> */}
                
                {/* Transactions panel */}
                <section className="transactions_list_panel">
                    <div className="transactions_panel_header">
                        <div className="transactions_panel_header_left">
                            <h3>Transactions</h3>
                            <div className="transactions_panel_header_subtitle">Showing {paginatedTrades.length} transaction(s)</div>
                        </div>
                    </div>
                    
                    {tradesLoading ? (
                        <div className="transactions_loading_state">
                            <div className="transactions_spinner"></div>
                            <p>Loading transactions...</p>
                        </div>
                    ) : tradesError ? (
                        <div className="transactions_loading_state">
                            <Icons.X size={48} />
                            <h3>Unable to connect to backend</h3>
                            <p>No transactions available. Please check if the backend service is running.</p>
                        </div>
                    ) : paginatedTrades.length === 0 ? (
                        <div className="transactions_loading_state">
                            <Icons.Search size={48} />
                            <h3>No transactions yet</h3>
                            <p>No trades found in the selected time window.</p>
                        </div>
                    ) : (
                        <div className="transactions_table_wrapper">
                            <table className="transactions_table">
                                <thead>
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>Contract & Price</Th>
                                        <Th>Client</Th>
                                        <Th>Date</Th>
                                        <Th>P&L</Th>
                                        <Th>Status</Th>
                                        <Th>Risk Level</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTrades.map((trade) => (
                                        <tr key={trade.id} className={`transactions_table_row ${trade.isOutlier ? 'transactions_high_risk' : trade.risk === 'medium' ? 'transactions_medium_risk' : 'transactions_low_risk'}`}>
                                            <Td>{trade.id}</Td>
                                            <Td>
                                                <div>
                                                    <strong>{trade.currency} ${trade.amount?.toFixed(2)}</strong>
                                                    <br />
                                                    <small>{trade.contract_month}</small>
                                                </div>
                                            </Td>
                                            <Td>{trade.user}</Td>
                                            <Td>{new Date(trade.createdAt).toLocaleDateString()} {new Date(trade.createdAt).toLocaleTimeString()}</Td>
                                            <Td className={trade.pnl >= 0 ? 'transactions_positive_pnl' : 'transactions_negative_pnl'}>
                                                ${trade.pnl?.toFixed(2)}
                                            </Td>
                                            <Td>
                                                <span className={`transactions_status_badge transactions_status_${trade.status.toLowerCase()}`}>
                                                    {trade.status === 'approved' ? 'Validated' : trade.status === 'flagged' ? 'Flagged' : 'Pending'}
                                                </span>
                                            </Td>
                                            <Td>
                                                <div className="transactions_risk_container">
                                                    <span className={`transactions_risk_badge transactions_risk_${trade.isOutlier ? 'high' : trade.risk || 'low'}`}>
                                                        {trade.isOutlier ? 'High' : trade.risk ? trade.risk.charAt(0).toUpperCase() + trade.risk.slice(1) : 'Low'}
                                                    </span>
                                                    {trade.anomaly_score && (
                                                        <>
                                                            <br />
                                                            <small>Score: {trade.anomaly_score.toFixed(3)}</small>
                                                        </>
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="transactions_action_buttons">
                                                    {trade.status === 'pending' && (
                                                        <button className="transactions_action_button" title="Review Trade">
                                                            <Icons.Eye size={14} />
                                                        </button>
                                                    )}
                                                    {trade.status === 'approved' && (
                                                        <button className="transactions_action_button transactions_action_button_success" title="Validated">
                                                            <Icons.Check size={14} />
                                                        </button>
                                                    )}
                                                    {trade.status === 'flagged' && (
                                                        <button className="transactions_action_button transactions_action_button_warning" title="Flagged">
                                                            <Icons.Flag size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {!tradesError && !tradesLoading && paginatedTrades.length > 0 && (
                        <div className="transactions_pagination">
                            <button 
                                className="transactions_pagination_button" 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <Icons.ChevronLeft size={16} />
                            </button>
                            <span className="transactions_pagination_info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                className="transactions_pagination_button" 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <Icons.ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="transactions_table_th">{children}</th>
    );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <td className={`transactions_table_td ${className || ''}`}>{children}</td>
    );
}
