import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../api/queries';
import type { Transaction as ApiTransaction } from '../../api/queries';
import ClusteringGraph from '../../components/ClusteringGraph/ClusteringGraph';
import './Home.css';
import './transaction-details.css';

// Extended Transaction type with UI properties
type Transaction = ApiTransaction & {
  risk?: 'low' | 'medium' | 'high';
  isOutlier?: boolean;
  contractType?: string;
  contractMonth?: string;
  client?: string;
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

  // State for transaction management
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Handler for clicking on a transaction point
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
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
            <i className="fas fa-search"></i>
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
              onTransactionClick={handleTransactionClick} 
              height={400} 
            />

            {/* Transaction Details Panel */}
            <section className="transaction_details_section">
              <div className="section_header">
                <h3>Transaction Details</h3>
              </div>
              <div className="transaction_details_container">
                {selectedTransaction ? (
                  <div className="transaction_details">
                    <div className="transaction_header">
                      <h4>Transaction #{selectedTransaction.id}</h4>
                      <span className={`risk_badge ${selectedTransaction.isOutlier ? 'high' : selectedTransaction.risk || 'low'}`}>
                        {selectedTransaction.isOutlier ? 'High Risk' : selectedTransaction.risk ? `${selectedTransaction.risk.charAt(0).toUpperCase() + selectedTransaction.risk.slice(1)} Risk` : 'Low Risk'}
                      </span>
                    </div>
                    
                    <div className="transaction_info">
                      <div className="detail_row">
                        <span className="detail_label">Amount:</span>
                        <span className="detail_value">{selectedTransaction.currency} {selectedTransaction.amount?.toFixed(2)}</span>
                      </div>
                      <div className="detail_row">
                        <span className="detail_label">User:</span>
                        <span className="detail_value">{selectedTransaction.user}</span>
                      </div>
                      <div className="detail_row">
                        <span className="detail_label">Date:</span>
                        <span className="detail_value">{new Date(selectedTransaction.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="detail_row">
                        <span className="detail_label">Status:</span>
                        <span className="detail_value status_value">
                          <span className={`status_indicator ${selectedTransaction.status || 'pending'}`}></span>
                          {selectedTransaction.status ? selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1) : 'Pending'}
                        </span>
                      </div>
                      {selectedTransaction.contractType && (
                        <div className="detail_row">
                          <span className="detail_label">Contract Type:</span>
                          <span className="detail_value">{selectedTransaction.contractType}</span>
                        </div>
                      )}
                      {selectedTransaction.client && (
                        <div className="detail_row">
                          <span className="detail_label">Client:</span>
                          <span className="detail_value">{selectedTransaction.client}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="transaction_actions">
                      <button className="action_button approve">
                        <i className="fas fa-check"></i> Approve
                      </button>
                      <button className="action_button flag">
                        <i className="fas fa-flag"></i> Flag
                      </button>
                      <button className="action_button reject">
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="transaction_details_placeholder">
                    <div className="placeholder_icon">
                      <i className="fas fa-mouse-pointer"></i>
                    </div>
                    <p>Click on any transaction in the clustering graph to view its details</p>
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
                  <i className="fas fa-filter"></i>
                  <select className="filter_select">
                    <option value="all">All Transactions</option>
                    <option value="high">High Risk Only</option>
                    <option value="medium">Medium Risk Only</option>
                    <option value="low">Low Risk Only</option>
                  </select>
                </div>
                <button className="refresh_button">
                  <i className="fas fa-sync-alt"></i> Refresh
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
                      onClick={() => handleTransactionClick(tx)}
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
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="icon-button" title="Flag Transaction">
                            <i className="fas fa-flag"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button className="pagination-button" disabled><i className="fas fa-chevron-left"></i></button>
              <span className="pagination-info">Page 1 of 5</span>
              <button className="pagination-button"><i className="fas fa-chevron-right"></i></button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
