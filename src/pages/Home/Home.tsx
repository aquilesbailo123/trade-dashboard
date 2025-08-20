import React, { useState, useMemo } from 'react';
import { useTrades, useTradeValidation, useStats } from '../../hooks/useTrades';
import { useProfitLossData } from '../../hooks/useProfitLossData';
import BoxPlot from '../../components/BoxPlot/BoxPlot';
import ComparisonGraph from '../../components/ComparisonGraph/ComparisonGraph';
import './Home.css';
import './transaction-details.css';

// Icon components for consistent styling
interface IconProps {
    size?: number;
    color?: string;
    className?: string;
}

const Icons = {
    Search: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    Check: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    Flag: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
    ),
    X: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    MousePointer: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
            <path d="M13 13l6 6"></path>
        </svg>
    ),
    Filter: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
    RefreshCw: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    ),
    Eye: ({ size = 18, color = "currentColor", className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
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

// We're using the TradeData interface instead of Transaction

// Trade data interface for detailed analysis
interface TradeData {
  id: string | number;
  client: string;
  price: number;
  contract_type: string;
  date_of_execution: string;
  is_validated?: boolean;
  is_anomaly?: boolean;
  anomaly_score?: number;
  pnl?: number; // Profit and loss field
  user: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: string;
  risk?: string;
  isOutlier?: boolean;
  contract_month?: string;
}

const Home: React.FC = () => {
  // Data fetching from backend
  const { data: tradesData, isLoading: tradesLoading, error: tradesError, refetch } = useTrades(1000000); // Last 5 minutes
  const validation = useTradeValidation();
  const { data: statsData } = useStats();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Process trades data for display
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by most recent first
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

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [riskFilter]);

  // State for selected trade - will be used to show detailed trade information in future implementation
  const [selectedTrade, setSelectedTrade] = useState<TradeData | null>(null);
  
  // P&L data for BoxPlot
  const { data: profitLossData, isLoading: plDataLoading } = useProfitLossData();
  
  // Handler for clicking on an outlier point
  const handleOutlierClick = (outlier: any) => {
    // Find the trade corresponding to the outlier if needed
    console.log('Outlier clicked:', outlier);
    // Future implementation: search for this trade in the processedTrades array
  };
  
  // Handler for clicking on a trade point in the comparison graph
  const handleTradeClick = (trade: TradeData) => {
    setSelectedTrade(trade);
    console.log('Trade selected:', trade);
  };

  // Calculate metrics for dashboard using backend stats data
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
    
    // Fallback to processed trades if stats not available
    const total = processedTrades.length;
    const highRisk = processedTrades.filter(tx => tx.isOutlier || tx.risk === 'high').length;
    const validated = processedTrades.filter(tx => tx.status === 'approved').length;
    
    return {
      totalTrades: total,
      validatedTrades: validated,
      detectedAnomalies: highRisk,
      anomalyRate: total > 0 ? highRisk / total : 0
    };
  }, [statsData, processedTrades]);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleRiskFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRiskFilter(event.target.value as 'all' | 'high' | 'medium' | 'low');
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="home_container">
      {/* Dashboard header */}
      <header className="home_header">
        <h1>Transaction Anomaly Detection</h1>
        <div className="home_header_actions">
          <div className="home_search_bar">
            <Icons.Search size={16} />
            <input type="text" placeholder="Search transactions..." />
          </div>
        </div>
      </header>

      <div className="home_dashboard">
        <div className="home_dashboard_wrapper">
          {/* Main content grid with dual analysis graphs */}
          <div className="dashboard_graph_grid">
            {/* BoxPlot for P&L Distribution */}
              {plDataLoading ? (
                <div className="loading_container">
                  <Icons.RefreshCw size={24} className="icon-primary" />
                  <p>Loading profit/loss data...</p>
                </div>
              ) : profitLossData ? (
                <BoxPlot
                  title="Profit/Loss Distribution"
                  data={profitLossData}
                  height={400}
                  onOutlierClick={handleOutlierClick}
                />
              ) : (
                <div className="error_container">
                  <Icons.X size={24} className="icon-danger" />
                  <p>Failed to load profit/loss data</p>
                </div>
              )}

            {/* Comparison Graph for Trade Variables */}
              {tradesLoading ? (
                <div className="loading_container">
                  <Icons.RefreshCw size={24} className="icon-primary" />
                  <p>Loading trade data...</p>
                </div>
              ) : tradesError ? (
                <div className="error_container">
                  <Icons.X size={24} className="icon-danger" />
                  <p>Failed to load trade data</p>
                </div>
              ) : (
                <ComparisonGraph
                  trades={processedTrades}
                  height={400}
                  onTradeClick={handleTradeClick}
                />
              )}
          </div>
          
          {/* Trade Details Section - Always visible */}
          <section className="trade_details_panel">
            <div className="panel_header">
              <h3>Trade Details</h3>
              {selectedTrade && (
                <button 
                  className="icon-button" 
                  onClick={() => setSelectedTrade(null)}
                  title="Clear selection"
                >
                  <Icons.X size={16} />
                </button>
              )}
            </div>
            <div className="trade_details_content">
              {selectedTrade ? (
                <div className="trade_details_row">
                  <div className="trade_cell">
                    <span className="cell_label">ID:</span>
                    <span className="cell_value">{selectedTrade.id}</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Client:</span>
                    <span className="cell_value">{selectedTrade.client}</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Price:</span>
                    <span className="cell_value">${selectedTrade.price?.toFixed(2)}</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Amount:</span>
                    <span className="cell_value">${selectedTrade.amount?.toFixed(2)}</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">P&L:</span>
                    <span className={`cell_value ${(selectedTrade.pnl || 0) >= 0 ? 'positive-pnl' : 'negative-pnl'}`}>
                      ${selectedTrade.pnl?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Risk:</span>
                    <span className={`risk-badge ${selectedTrade.risk?.toLowerCase() || 'low'}`}>
                      {selectedTrade.risk || 'Low'}
                    </span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Date:</span>
                    <span className="cell_value">
                      {selectedTrade.date_of_execution ? new Date(selectedTrade.date_of_execution).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="trade_details_row empty_trade_row">
                  <div className="trade_cell">
                    <span className="cell_label">ID:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Client:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Price:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Amount:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">P&L:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Risk:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="trade_cell">
                    <span className="cell_label">Date:</span>
                    <span className="cell_value empty_value">-</span>
                  </div>
                  <div className="empty_message">
                    <Icons.Eye size={16} />
                    <span>Click on any point in the graph above to view trade details</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Risk Metrics Summary Section */}
          <section className="metrics_summary_section">
            <div className="metrics_grid">
              <div className="metric_card total">
                <div className="metric_header">
                  <h3>Total Trades</h3>
                </div>
                <div className="metric_value">
                  {metricValues.totalTrades}
                  <span className="metric_unit">trades</span>
                </div>
                <div className="metric_info">Total trades processed by the system</div>
              </div>
              
              <div className="metric_card high">
                <div className="metric_header">
                  <h3>Detected Anomalies</h3>
                </div>
                <div className="metric_value">
                  {metricValues.detectedAnomalies}
                  <span className="metric_unit">trades</span>
                </div>
                <div className="metric_info">Trades flagged as anomalous by ML model</div>
              </div>
              
              <div className="metric_card medium">
                <div className="metric_header">
                  <h3>Validated Trades</h3>
                </div>
                <div className="metric_value">
                  {metricValues.validatedTrades}
                  <span className="metric_unit">trades</span>
                </div>
                <div className="metric_info">Trades that received human validation</div>
              </div>

              <div className="metric_card low">
                <div className="metric_header">
                  <h3>Anomaly Rate</h3>
                </div>
                <div className="metric_value">
                  {(metricValues.anomalyRate * 100).toFixed(1)}
                  <span className="metric_unit">%</span>
                </div>
                <div className="metric_info">Percentage of trades flagged as anomalous</div>
              </div>
            </div>
          </section>

          {/* Transactions Table */}
          <section className="transactions_table_section">
            <div className="panel_header">
              <h3>Recent Transactions</h3>
              <div className="table_actions">
                <div className="filter_container">
                  <Icons.Filter size={16} />
                  <select className="filter_select" value={riskFilter} onChange={handleRiskFilterChange}>
                    <option value="all">All Transactions</option>
                    <option value="high">High Risk Only</option>
                    <option value="medium">Medium Risk Only</option>
                    <option value="low">Low Risk Only</option>
                  </select>
                </div>
                <button className="refresh_button" onClick={handleRefresh} disabled={tradesLoading}>
                  <Icons.RefreshCw size={16} /> {tradesLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
            
            <div className="table_container">
              {tradesError ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Icons.X size={48} className="icon-danger" />
                  </div>
                  <h3>Unable to connect to backend</h3>
                  <p>No transactions available. Please check if the backend service is running.</p>
                  <button className="refresh_button" onClick={handleRefresh}>
                    <Icons.RefreshCw size={16} /> Try Again
                  </button>
                </div>
              ) : tradesLoading ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Icons.RefreshCw size={48} className="icon-primary" />
                  </div>
                  <h3>Loading transactions...</h3>
                  <p>Fetching latest trade data from the backend.</p>
                </div>
              ) : paginatedTrades.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Icons.Search size={48} className="icon-secondary" />
                  </div>
                  <h3>No transactions yet</h3>
                  <p>{filteredTrades.length === 0 ? 'No trades found in the selected time window.' : `No ${riskFilter} risk transactions found.`}</p>
                </div>
              ) : (
                <table className="transactions_table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Contract & Price</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>P&L</th>
                      <th>Status</th>
                      <th>Risk Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrades.map((trade, index) => (
                      <tr 
                        key={trade.id} 
                        className={trade.isOutlier ? 'high-risk-row' : trade.risk === 'medium' ? 'medium-risk-row' : 'low-risk-row'}
                        onClick={() => handleTradeClick(trade)}
                      >
                        <td className="tx-id">{trade.id}</td>
                        <td className="tx-amount">
                          <div>
                            <strong>{trade.currency} ${trade.amount?.toFixed(2)}</strong>
                            <br />
                            <small>{trade.contract_month}</small>
                          </div>
                        </td>
                        <td>{trade.user}</td>
                        <td>{new Date(trade.createdAt).toLocaleDateString()} {new Date(trade.createdAt).toLocaleTimeString()}</td>
                        <td className={trade.pnl >= 0 ? 'positive-pnl' : 'negative-pnl'}>
                          ${trade.pnl?.toFixed(2)}
                        </td>
                        <td>
                          <span className={`status-badge ${trade.status || 'pending'}`}>
                            {trade.status === 'approved' ? 'Validated' : trade.status === 'flagged' ? 'Flagged' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="risk-container">
                            <span className={`risk-badge ${trade.isOutlier ? 'high' : trade.risk || 'low'}`}>
                              {trade.isOutlier ? 'High' : trade.risk ? trade.risk.charAt(0).toUpperCase() + trade.risk.slice(1) : 'Low'}
                            </span>
                            {trade.anomaly_score && (
                              <>
                                <br />
                                <small>Score: {trade.anomaly_score.toFixed(3)}</small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="icon-button" title="View Details">
                              <Icons.Eye size={16} />
                            </button>
                            {!trade.is_validated && (
                              <button 
                                className="icon-button" 
                                title="Validate as Normal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  validation.mutate({
                                    record_index: startIndex + index,
                                    is_anomaly: false
                                  });
                                }}
                                disabled={validation.isPending}
                              >
                                <Icons.Check size={16} />
                              </button>
                            )}
                            <button 
                              className="icon-button" 
                              title={trade.is_validated ? "Already Validated" : "Flag as Anomaly"}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!trade.is_validated) {
                                  validation.mutate({
                                    record_index: startIndex + index,
                                    is_anomaly: true
                                  });
                                }
                              }}
                              disabled={validation.isPending || trade.is_validated}
                            >
                              <Icons.Flag size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!tradesError && !tradesLoading && paginatedTrades.length > 0 && (
              <div className="pagination">
                <button 
                  className="pagination-button" 
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <Icons.ChevronLeft size={16} />
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-button" 
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
    </div>
  );
};

export default Home;
