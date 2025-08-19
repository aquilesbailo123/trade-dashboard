import React, { useState, useMemo } from 'react';
import type { Transaction as ApiTransaction } from '../../api/queries';
import { useTrades, useTradeValidation } from '../../hooks/useTrades';
import ClusteringGraph from '../../components/ClusteringGraph/ClusteringGraph';
import './Home.css';
import './transaction-details.css';

// Icon components for consistent styling
interface IconProps {
    size?: number;
    color?: string;
}

const Icons = {
    Search: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    ),
    Check: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    Flag: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
    ),
    X: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    MousePointer: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
            <path d="M13 13l6 6"></path>
        </svg>
    ),
    Filter: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
    RefreshCw: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    ),
    Eye: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    ),
    ChevronLeft: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    ),
    ChevronRight: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    )
};

// Extended Transaction type with UI properties
// type Transaction = ApiTransaction & {
//   risk?: 'low' | 'medium' | 'high';
//   isOutlier?: boolean;
//   contractType?: string;
//   contractMonth?: string;
//   client?: string;
// };

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

const Home: React.FC = () => {
  // Data fetching from backend
  const { data: tradesData, isLoading: tradesLoading, error: tradesError, refetch } = useTrades(300); // Last 5 minutes
  const validation = useTradeValidation();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Process trades data for display
  const processedTrades = useMemo(() => {
    if (!tradesData?.trades) return [];
    
    return tradesData.trades.map(trade => ({
      ...trade,
      // Map backend trade data to display format
      user: trade.client,
      amount: trade.price,
      currency: trade.contract_type,
      createdAt: trade.date_of_execution,
      status: trade.is_validated ? 'approved' : (trade.is_anomaly ? 'flagged' : 'pending'),
      risk: trade.is_anomaly ? 'high' : (trade.anomaly_score && trade.anomaly_score < -0.1 ? 'low' : 'medium'),
      isOutlier: trade.is_anomaly || false
    }));
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


  // State for user management
  const [selectedUser, setSelectedUser] = useState<UserTradingData | null>(null);

  // Handler for clicking on a user point
  const handleUserClick = (userData: UserTradingData) => {
    setSelectedUser(userData);
  };

  // Calculate metrics for dashboard using real trade data
  const metricValues = useMemo(() => {
    const total = processedTrades.length;
    const highRisk = processedTrades.filter(tx => tx.isOutlier || tx.risk === 'high').length;
    const mediumRisk = processedTrades.filter(tx => tx.risk === 'medium').length;
    const lowRisk = processedTrades.filter(tx => tx.risk === 'low' || tx.risk === undefined).length;
    
    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk
    };
  }, [processedTrades]);

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
          {/* Main content grid with clustering graph and details panel */}
          <div className="transaction_analysis_grid">
            {/* Transaction Clustering Graph */}
            <ClusteringGraph 
              onTransactionClick={handleUserClick} 
              height={400} 
            />

            {/* User Details Panel */}
            <section className="transaction_details_section">
              <div className="section_header">
                <h3>User Details</h3>
              </div>
              <div className="transaction_details_container">
                {selectedUser ? (
                  <div className="transaction_details">
                    <div className="transaction_header">
                      <h4>{selectedUser.userName}</h4>
                      <span className={`risk_badge ${selectedUser.isOutlier ? 'high' : selectedUser.risk || 'low'}`}>
                        {selectedUser.isOutlier ? 'High Risk' : selectedUser.risk ? `${selectedUser.risk.charAt(0).toUpperCase() + selectedUser.risk.slice(1)} Risk` : 'Low Risk'}
                      </span>
                    </div>
                    
                    <div className="transaction_info">
                      <div className="detail_row">
                        <span className="detail_label">Total Trades:</span>
                        <span className="detail_value">{selectedUser.totalTrades}</span>
                      </div>
                      <div className="detail_row">
                        <span className="detail_label">Average Trade Time:</span>
                        <span className="detail_value">
                          {Math.floor(selectedUser.averageTradeTime)}:{String(Math.floor((selectedUser.averageTradeTime % 1) * 60)).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="detail_row">
                        <span className="detail_label">Risk Assessment:</span>
                        <span className="detail_value status_value">
                          <span className={`status_indicator ${selectedUser.isOutlier ? 'high' : selectedUser.risk}`}></span>
                          {selectedUser.isOutlier ? 'Anomalous trading hours detected' : 'Normal trading pattern'}
                        </span>
                      </div>
                      <div className="detail_row">
                        <span className="detail_label">Recent Transactions:</span>
                        <span className="detail_value">{selectedUser.transactions.length} in last 30 days</span>
                      </div>
                    </div>
                    
                    <div className="transaction_actions">
                      <button className="action_button approve">
                        <Icons.Check size={16} /> Approve User
                      </button>
                      <button className="action_button flag">
                        <Icons.Flag size={16} /> Flag for Review
                      </button>
                      <button className="action_button reject">
                        <Icons.X size={16} /> Suspend User
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="transaction_details_placeholder">
                    <div className="placeholder_icon">
                      <Icons.MousePointer size={24} />
                    </div>
                    <p>Click on any user in the clustering graph to view their trading details</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Risk Metrics Summary Section */}
          <section className="metrics_summary_section">
            <div className="metrics_grid">
              <div className="metric_card high">
                <div className="metric_header">
                  <h3>High Risk</h3>
                </div>
                <div className="metric_value">
                  {metricValues.highRisk}
                  <span className="metric_unit">transactions</span>
                </div>
                <div className="metric_info">Potential fraud requiring investigation</div>
              </div>
              
              <div className="metric_card medium">
                <div className="metric_header">
                  <h3>Medium Risk</h3>
                </div>
                <div className="metric_value">
                  {metricValues.mediumRisk}
                  <span className="metric_unit">transactions</span>
                </div>
                <div className="metric_info">Transactions that need review</div>
              </div>
              
              <div className="metric_card low">
                <div className="metric_header">
                  <h3>Low Risk</h3>
                </div>
                <div className="metric_value">
                  {metricValues.lowRisk}
                  <span className="metric_unit">transactions</span>
                </div>
                <div className="metric_info">Normal transaction patterns</div>
              </div>

              <div className="metric_card total">
                <div className="metric_header">
                  <h3>Total</h3>
                </div>
                <div className="metric_value">
                  {metricValues.total}
                  <span className="metric_unit">transactions</span>
                </div>
                <div className="metric_info">Overall transaction count</div>
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
                    <Icons.X size={48} color="#ef4444" />
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
                    <Icons.RefreshCw size={48} color="#3b82f6" />
                  </div>
                  <h3>Loading transactions...</h3>
                  <p>Fetching latest trade data from the backend.</p>
                </div>
              ) : paginatedTrades.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Icons.Search size={48} color="#6b7280" />
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
                        onClick={() => setSelectedUser(null)}
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
                        <td>{new Date(trade.createdAt).toLocaleDateString()}</td>
                        <td className={trade.pnl >= 0 ? 'positive-pnl' : 'negative-pnl'}>
                          ${trade.pnl?.toFixed(2)}
                        </td>
                        <td>
                          <span className={`status-badge ${trade.status || 'pending'}`}>
                            {trade.status === 'approved' ? 'Validated' : trade.status === 'flagged' ? 'Flagged' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div>
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
                  Page {currentPage} of {totalPages} ({filteredTrades.length} total)
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
