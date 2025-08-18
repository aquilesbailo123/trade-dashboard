import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../api/queries';
import type { Transaction as ApiTransaction } from '../../api/queries';
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
  // Data fetching
  const { data } = useTransactions();
  const txs = useMemo(() => data?.map(tx => ({
    ...tx,
    risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    isOutlier: Math.random() > 0.9,
    contractType: ['Futures', 'Options', 'Spot', 'Margin'][Math.floor(Math.random() * 4)],
    contractMonth: ['January', 'March', 'June', 'September', 'December'][Math.floor(Math.random() * 5)],
    client: `Client ${Math.floor(Math.random() * 100)}`
  })) || [], [data]);

  // State for user management
  const [selectedUser, setSelectedUser] = useState<UserTradingData | null>(null);

  // Handler for clicking on a user point
  const handleUserClick = (userData: UserTradingData) => {
    setSelectedUser(userData);
  };

  // Calculate metrics for dashboard
  const metricValues = useMemo(() => {
    const total = txs.length;
    const highRisk = txs.filter(tx => tx.isOutlier || tx.risk === 'high').length;
    const mediumRisk = txs.filter(tx => tx.risk === 'medium').length;
    const lowRisk = txs.filter(tx => tx.risk === 'low' || tx.risk === undefined).length;
    
    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk
    };
  }, [txs]);

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
                  <select className="filter_select">
                    <option value="all">All Transactions</option>
                    <option value="high">High Risk Only</option>
                    <option value="medium">Medium Risk Only</option>
                    <option value="low">Low Risk Only</option>
                  </select>
                </div>
                <button className="refresh_button">
                  <Icons.RefreshCw size={16} /> Refresh
                </button>
              </div>
            </div>
            
            <div className="table_container">
              <table className="transactions_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Risk Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.slice(0, 10).map((tx) => (
                    <tr 
                      key={tx.id} 
                      className={tx.isOutlier ? 'high-risk-row' : tx.risk === 'medium' ? 'medium-risk-row' : 'low-risk-row'}
                      onClick={() => setSelectedUser(null)}
                    >
                      <td className="tx-id">{tx.id}</td>
                      <td className="tx-amount">
                        <strong>{tx.currency} {tx.amount?.toFixed(2)}</strong>
                      </td>
                      <td>{tx.user}</td>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${tx.status || 'pending'}`}>
                          {tx.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`risk-badge ${tx.isOutlier ? 'high' : tx.risk || 'low'}`}>
                          {tx.isOutlier ? 'High' : tx.risk ? tx.risk.charAt(0).toUpperCase() + tx.risk.slice(1) : 'Low'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-button" title="View Details">
                            <Icons.Eye size={16} />
                          </button>
                          <button className="icon-button" title="Flag Transaction">
                            <Icons.Flag size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button className="pagination-button" disabled><Icons.ChevronLeft size={16} /></button>
              <span className="pagination-info">Page 1 of 5</span>
              <button className="pagination-button"><Icons.ChevronRight size={16} /></button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
