import React, { useState, useMemo } from 'react';
import { useMetalTrades, useMetalStats, type MetalTrade } from '../../hooks/useMetalTrades';
import PriceDistributionBoxplot from '../../components/PriceDistributionBoxplot/PriceDistributionBoxplot';
import AccuracyTrendChart from '../../components/AccuracyTrendChart/AccuracyTrendChart';
import ProfitLossChart from '../../components/ProfitLossChart/ProfitLossChart';
import RiskAdjustmentChart from '../../components/RiskAdjustmentChart/RiskAdjustmentChart';
import CorrelationTimelineChart from '../../components/CorrelationTimelineChart/CorrelationTimelineChart';
import VolatilityHeatmapChart from '../../components/VolatilityHeatmapChart/VolatilityHeatmapChart';
import './Home.css';

// Icon components for consistent styling
interface IconProps {
    size?: number;
    color?: string;
    className?: string;
}

const Icons = {
    RefreshCw: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    ),
    X: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    Filter: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
    ChevronLeft: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    ChevronRight: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    )
};

const Home: React.FC = () => {
    // Data fetching for metal trades
    const { trades, isLoading: tradesLoading, error: tradesError, refetch } = useMetalTrades();
    const metalStats = useMetalStats(trades);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(15);
    const [metalFilter, setMetalFilter] = useState<'all' | 'alloy' | 'copper' | 'cobalt' | 'aluminium' | 'nickel' | 'zinc'>('all');
    const [chartMetalFilter, setChartMetalFilter] = useState<'all' | 'alloy' | 'copper' | 'cobalt' | 'aluminium' | 'nickel' | 'zinc'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
    
    // State for selected trade details
    const [selectedTrade, setSelectedTrade] = useState<MetalTrade | null>(null);

    // Filter trades based on metal and status for table
    const filteredTrades = useMemo(() => {
        let filtered = trades;
        
        if (metalFilter !== 'all') {
            filtered = filtered.filter(trade => trade.metal === metalFilter);
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(trade => trade.status === statusFilter);
        }
        
        return filtered.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [trades, metalFilter, statusFilter]);

    // Filter trades for charts based on chart metal filter
    const chartFilteredTrades = useMemo(() => {
        if (chartMetalFilter === 'all') {
            return trades;
        }
        return trades.filter(trade => trade.metal === chartMetalFilter);
    }, [trades, chartMetalFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTrades.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedTrades = filteredTrades.slice(startIndex, startIndex + pageSize);

    // Reset to first page when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [metalFilter, statusFilter]);

    // Handler for clicking on a trade in the table
    const handleTradeClick = (trade: MetalTrade) => {
        setSelectedTrade(trade);
        console.log('Trade selected:', trade);
    };

    // Calculate metrics for dashboard
    const metricValues = useMemo(() => {
        return {
            totalTrades: metalStats.totalTrades,
            totalProfitLoss: metalStats.totalProfitLoss,
            averageAccuracy: metalStats.averageAccuracy,
            totalVolume: metalStats.totalVolume,
            bestPerformingMetal: metalStats.bestPerformingMetal,
            worstPerformingMetal: metalStats.worstPerformingMetal
        };
    }, [metalStats]);

    // Pagination handlers
    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const handleMetalFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setMetalFilter(event.target.value as typeof metalFilter);
    };

    const handleChartMetalFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setChartMetalFilter(event.target.value as typeof chartMetalFilter);
    };

    const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value as typeof statusFilter);
    };

    const handleRefresh = () => {
        refetch();
    };

    const getMetalColor = (metal: string) => {
        const colors = {
            alloy: 'var(--color-primary-500)',
            copper: 'var(--color-warning-500)',
            cobalt: 'var(--color-accent-500)',
            aluminium: 'var(--color-text-secondary)',
            nickel: 'var(--color-danger-500)',
            zinc: 'var(--color-primary-400)',
        };
        return colors[metal as keyof typeof colors] || 'var(--color-text-secondary)';
    };

    return (
        <main className="home_metal_dashboard_container">
            {/* Metal Trading Performance Metrics */}
            <section className="home_metal_metrics_section">
                <div className="home_metal_metrics_grid">
                    <div className="home_metal_metric_card total">
                        <div className="home_metal_metric_header">
                            <h3>Total Trades</h3>
                        </div>
                        <div className="home_metal_metric_value">
                            {metricValues.totalTrades}
                            <span className="home_metal_metric_unit">trades</span>
                        </div>
                        <div className="home_metal_metric_info">Completed metal trades</div>
                    </div>
                    
                    <div className="home_metal_metric_card profit_loss">
                        <div className="home_metal_metric_header">
                            <h3>Total P&L</h3>
                        </div>
                        <div className={`home_metal_metric_value ${metricValues.totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                            ${metricValues.totalProfitLoss > 0 ? '+' : ''}{(metricValues.totalProfitLoss / 1000).toFixed(1)}
                            <span className="home_metal_metric_unit">k</span>
                        </div>
                        <div className="home_metal_metric_info">Total profit/loss from trades</div>
                    </div>
                    
                    <div className="home_metal_metric_card accuracy">
                        <div className="home_metal_metric_header">
                            <h3>Avg Accuracy</h3>
                        </div>
                        <div className="home_metal_metric_value">
                            {(metricValues.averageAccuracy * 100).toFixed(1)}
                            <span className="home_metal_metric_unit">%</span>
                        </div>
                        <div className="home_metal_metric_info">Trading team prediction accuracy</div>
                    </div>

                    <div className="home_metal_metric_card volume">
                        <div className="home_metal_metric_header">
                            <h3>Total Volume</h3>
                        </div>
                        <div className="home_metal_metric_value">
                            ${(metricValues.totalVolume / 1000000).toFixed(1)}
                            <span className="home_metal_metric_unit">M</span>
                        </div>
                        <div className="home_metal_metric_info">Total trading volume</div>
                    </div>
                </div>
            </section>
            

            <div className="home_metal_dashboard">

                {/* Chart Metal Filter Dropdown */}
                <div className="home_metal_chart_filter_container">
                    <div className="home_metal_chart_filter_header">
                        <h4>Filter Charts by Metal</h4>
                    </div>
                    <div className="home_metal_chart_filter_dropdown">
                        <Icons.Filter size={16} />
                        <select 
                            className="home_metal_chart_filter_select" 
                            value={chartMetalFilter} 
                            onChange={handleChartMetalFilterChange}
                            title="Filter charts by metal type"
                        >
                            <option value="all">All Metals</option>
                            <option value="alloy">Alloy</option>
                            <option value="copper">Copper</option>
                            <option value="cobalt">Cobalt</option>
                            <option value="aluminium">Aluminium</option>
                            <option value="nickel">Nickel</option>
                            <option value="zinc">Zinc</option>
                        </select>
                    </div>
                </div>
                
                <div className="home_metal_dashboard_wrapper">
                    {/* Metal Trading Analysis Charts Grid */}
                    <div className="home_metal_charts_grid">
                        {tradesLoading ? (
                            <>
                                <div className="home_metal_loading_container">
                                    <Icons.RefreshCw size={24} className="icon-primary animate-spin" />
                                    <p className="animate-pulse">Loading metal performance data...</p>
                                </div>
                                <div className="home_metal_loading_container">
                                    <Icons.RefreshCw size={24} className="icon-primary animate-spin" />
                                    <p className="animate-pulse">Loading accuracy trends...</p>
                                </div>
                                <div className="home_metal_loading_container">
                                    <Icons.RefreshCw size={24} className="icon-primary animate-spin" />
                                    <p className="animate-pulse">Loading P&L data...</p>
                                </div>
                                <div className="home_metal_loading_container">
                                    <Icons.RefreshCw size={24} className="icon-primary animate-spin" />
                                    <p className="animate-pulse">Loading risk analysis...</p>
                                </div>
                                <div className="home_metal_loading_container">
                                    <Icons.RefreshCw size={24} className="icon-primary animate-spin" />
                                    <p className="animate-pulse">Loading correlation analysis...</p>
                                </div>
                                <div className="home_metal_loading_container">
                                    <Icons.RefreshCw size={24} className="icon-primary animate-spin" />
                                    <p className="animate-pulse">Loading volatility heatmap...</p>
                                </div>
                            </>
                        ) : tradesError ? (
                            <>
                                <div className="home_metal_error_container">
                                    <Icons.X size={24} className="icon-danger" />
                                    <p>Failed to load metal performance data</p>
                                </div>
                                <div className="home_metal_error_container">
                                    <Icons.X size={24} className="icon-danger" />
                                    <p>Failed to load accuracy trends</p>
                                </div>
                                <div className="home_metal_error_container">
                                    <Icons.X size={24} className="icon-danger" />
                                    <p>Failed to load P&L data</p>
                                </div>
                                <div className="home_metal_error_container">
                                    <Icons.X size={24} className="icon-danger" />
                                    <p>Failed to load risk analysis</p>
                                </div>
                                <div className="home_metal_error_container">
                                    <Icons.X size={24} className="icon-danger" />
                                    <p>Failed to load correlation data</p>
                                </div>
                                <div className="home_metal_error_container">
                                    <Icons.X size={24} className="icon-danger" />
                                    <p>Failed to load volatility heatmap</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <PriceDistributionBoxplot
                                    trades={chartFilteredTrades}
                                    height={350}
                                    title="Price Difference Distribution (Execution vs Risk Price)"
                                />
                                <AccuracyTrendChart
                                    trades={chartFilteredTrades}
                                    height={350}
                                    title="Market Risk Price vs Execution Process Difference Trend"
                                />
                                <ProfitLossChart
                                    trades={chartFilteredTrades}
                                    height={350}
                                    title="Trade Performance Distribution (Execution vs Risk Price Comparison)"
                                />
                                <RiskAdjustmentChart
                                    trades={chartFilteredTrades}
                                    height={350}
                                    title="Execution Price vs Risk Price Scatterplot"
                                />
                                <CorrelationTimelineChart
                                    trades={chartFilteredTrades}
                                    height={350}
                                    title="30-Day Rolling Correlation Timeline Chart"
                                />
                                <VolatilityHeatmapChart
                                    trades={chartFilteredTrades}
                                    height={350}
                                    title="Volatility Clustering Heatmap with Anomaly Detection Overlay"
                                />
                            </>
                        )}
                    </div>

                    {/* Trade Details Section - Always visible */}
                    {selectedTrade ? (
                        <div className="home_metal_trade_details_container">
                            <div className="home_metal_trade_details_left">
                                <div className="home_metal_trade_details_header">
                                    <button 
                                        className="home_metal_icon_button" 
                                        onClick={() => setSelectedTrade(null)}
                                        title="Clear selection"
                                    >
                                        <Icons.X size={16} />
                                    </button>
                                    <span>Selected Trade Details</span>
                                </div>
                                <div className="home_metal_trade_details_row">
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">ID:</span>
                                        <span className="home_metal_cell_value">{selectedTrade.id}</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Metal:</span>
                                        <span 
                                            className="home_metal_cell_value"
                                            style={{ color: getMetalColor(selectedTrade.metal) }}
                                        >
                                            {selectedTrade.metal.charAt(0).toUpperCase() + selectedTrade.metal.slice(1)}
                                        </span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Trader:</span>
                                        <span className="home_metal_cell_value">{selectedTrade.trader}</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Client:</span>
                                        <span className="home_metal_cell_value">{selectedTrade.client}</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Quantity:</span>
                                        <span className="home_metal_cell_value">{selectedTrade.quantity} units</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Est. Price:</span>
                                        <span className="home_metal_cell_value">${selectedTrade.estimatedPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Risk Price:</span>
                                        <span className="home_metal_cell_value">${selectedTrade.riskPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Sale Price:</span>
                                        <span className="home_metal_cell_value">${selectedTrade.actualSalePrice.toFixed(2)}</span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">P&L:</span>
                                        <span className={`home_metal_cell_value ${selectedTrade.profitLoss >= 0 ? 'home_metal_positive_pnl' : 'home_metal_negative_pnl'}`}>
                                            ${selectedTrade.profitLoss > 0 ? '+' : ''}{selectedTrade.profitLoss.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="home_metal_trade_cell">
                                        <span className="home_metal_cell_label">Accuracy:</span>
                                        <span className="home_metal_cell_value">{(selectedTrade.accuracy * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                      null
                        // <div className="home_metal_trade_details_container home_metal_empty_trade_row">
                        //     <div className="home_metal_empty_message">
                        //         <span>Click on any trade in the table below to view detailed information</span>
                        //     </div>
                        // </div>
                    )}

                    {/* Metal Trades Table */}
                    <section className="home_metal_trades_table_section">
                        <div className="home_metal_panel_header">
                            <h3>Metal Trading History</h3>
                            <div className="home_metal_table_actions">
                                <div className="home_metal_filter_container">
                                    <Icons.Filter size={16} />
                                    <select 
                                        className="home_metal_filter_select" 
                                        value={metalFilter} 
                                        onChange={handleMetalFilterChange}
                                        title="Filter trades by metal type"
                                    >
                                        <option value="all">All Metals</option>
                                        <option value="alloy">Alloy</option>
                                        <option value="copper">Copper</option>
                                        <option value="cobalt">Cobalt</option>
                                        <option value="aluminium">Aluminium</option>
                                        <option value="nickel">Nickel</option>
                                        <option value="zinc">Zinc</option>
                                    </select>
                                </div>
                                
                                <div className="home_metal_filter_container">
                                    <select 
                                        className="home_metal_filter_select" 
                                        value={statusFilter} 
                                        onChange={handleStatusFilterChange}
                                        title="Filter trades by status"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <button 
                                    className="home_metal_filter_button" 
                                    onClick={handleRefresh} 
                                    disabled={tradesLoading}
                                    title="Refresh trade data"
                                >
                                    <Icons.RefreshCw size={16} /> {tradesLoading ? 'Loading...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="home_metal_table_container">
                            {tradesError ? (
                                <div className="home_metal_empty_state">
                                    <div className="home_metal_empty_state_icon">
                                        <Icons.X size={48} className="icon-danger" />
                                    </div>
                                    <h3>Unable to load metal trades</h3>
                                    <p>Please check the connection and try again.</p>
                                    <button className="home_metal_refresh_button" onClick={handleRefresh}>
                                        <Icons.RefreshCw size={16} /> Try Again
                                    </button>
                                </div>
                            ) : tradesLoading ? (
                                <div className="home_metal_empty_state">
                                    <div className="home_metal_empty_state_icon">
                                        <Icons.RefreshCw size={48} className="icon-primary" />
                                    </div>
                                    <h3>Loading metal trades...</h3>
                                    <p>Fetching latest trading data.</p>
                                </div>
                            ) : paginatedTrades.length === 0 ? (
                                <div className="home_metal_empty_state">
                                    <h3>No trades found</h3>
                                    <p>No trades match the selected filters.</p>
                                </div>
                            ) : (
                                <table className="home_metal_trades_table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Metal</th>
                                            <th>Trader</th>
                                            <th>Client</th>
                                            <th>Quantity</th>
                                            <th>Est. Price</th>
                                            <th>Risk Price</th>
                                            <th>Sale Price</th>
                                            <th>P&L</th>
                                            <th>Accuracy</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTrades.map((trade) => (
                                            <tr 
                                                key={trade.id} 
                                                className={`home_metal_trade_row ${trade.status}`}
                                                onClick={() => handleTradeClick(trade)}
                                            >
                                                <td className="home_metal_trade_id">{trade.id}</td>
                                                <td className="home_metal_trade_metal">
                                                    <span 
                                                        className="home_metal_metal_badge"
                                                        style={{ backgroundColor: getMetalColor(trade.metal) }}
                                                    >
                                                        {trade.metal.charAt(0).toUpperCase() + trade.metal.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{trade.trader}</td>
                                                <td>{trade.client}</td>
                                                <td>{trade.quantity}</td>
                                                <td>${trade.estimatedPrice.toFixed(2)}</td>
                                                <td>${trade.riskPrice.toFixed(2)}</td>
                                                <td>${trade.actualSalePrice.toFixed(2)}</td>
                                                <td className={trade.profitLoss >= 0 ? 'home_metal_positive_pnl' : 'home_metal_negative_pnl'}>
                                                    ${trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                                                </td>
                                                <td>{(trade.accuracy * 100).toFixed(1)}%</td>
                                                <td>
                                                    <span className={`home_metal_status_badge ${trade.status}`}>
                                                        {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {!tradesError && !tradesLoading && paginatedTrades.length > 0 && (
                            <div className="home_metal_pagination">
                                <button 
                                    className="home_metal_pagination_button" 
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                >
                                    <Icons.ChevronLeft size={16} />
                                </button>
                                <span className="home_metal_pagination_info">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    className="home_metal_pagination_button" 
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <Icons.ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Home;
