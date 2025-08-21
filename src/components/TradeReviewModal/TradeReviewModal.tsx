import React, { useState, useEffect } from 'react';
import './TradeReviewModal.css';

// List of possible client types
const CLIENT_TYPES = [
  'Hedge Fund',
  'RIA',
  'Broker',
  'Oil Company',
  'Mining Firm'
];

// Compliance review status options
// const REVIEW_STATUS = {
//   PENDING: 'pending',
//   APPROVED: 'approved',
//   FLAGGED: 'flagged'
// };

interface TradeReviewModalProps {
  trade: any;
  isOpen: boolean;
  onClose: () => void;
  onMarkGood: () => void;
  onMarkBad: () => void;
}

const TradeReviewModal: React.FC<TradeReviewModalProps> = ({ 
  trade, 
  isOpen, 
  onClose,
  onMarkGood,
  onMarkBad
}) => {
  // State for comments and validation
  const [reviewComments, setReviewComments] = useState('');
  const [selectedTab, setSelectedTab] = useState('details');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'flag' | null>(null);
  const [validationError, setValidationError] = useState(false);
  
  // State for checkboxes
  const [kycChecked, setKycChecked] = useState(false);
  const [amlChecked, setAmlChecked] = useState(false);
  const [limitsChecked, setLimitsChecked] = useState(false);
  const [sanctionsChecked, setSanctionsChecked] = useState(false);
  
  // Reset validation error when comments change
  useEffect(() => {
    if (reviewComments.trim().length > 0) {
      setValidationError(false);
    }
  }, [reviewComments]);
  
  // Early return if modal is not open or trade is not available
  if (!isOpen || !trade) return null;
  
  // Generate a random client type if not available
  const clientType = trade.client_type || CLIENT_TYPES[Math.floor(Math.random() * CLIENT_TYPES.length)];
  
  // Function to initiate approval process
  const initiateApprove = () => {
    if (selectedTab !== 'compliance') {
      // Switch to compliance tab if not already there
      setSelectedTab('compliance');
    } else if (reviewComments.trim().length === 0) {
      // Validate comments are filled
      setValidationError(true);
    } else {
      // Show confirmation modal
      setConfirmationAction('approve');
      setShowConfirmation(true);
    }
  };

  // Function to initiate flag process
  const initiateFlag = () => {
    if (selectedTab !== 'compliance') {
      // Switch to compliance tab if not already there
      setSelectedTab('compliance');
    } else if (reviewComments.trim().length === 0) {
      // Validate comments are filled
      setValidationError(true);
    } else {
      // Show confirmation modal
      setConfirmationAction('flag');
      setShowConfirmation(true);
    }
  };
  
  // Function to handle final approval with comments
  const handleApprove = () => {
    // Call the onMarkGood handler to send validation to backend
    onMarkGood();
    
    // Log details of the approval
    console.log('Approved trade:', trade.id);
    console.log('Review comments:', reviewComments);
    console.log('Compliance checks:', { kycChecked, amlChecked, limitsChecked, sanctionsChecked });
    
    // Close the confirmation dialog
    setShowConfirmation(false);
    
    // Note: The parent component will handle the API call and closing the modal
  };

  // Function to handle final flagging with comments
  const handleFlag = () => {
    // Call the onMarkBad handler to send validation to backend
    onMarkBad();
    
    // Log details of the flagging
    console.log('Flagged trade:', trade.id);
    console.log('Review comments:', reviewComments);
    console.log('Compliance checks:', { kycChecked, amlChecked, limitsChecked, sanctionsChecked });
    
    // Close the confirmation dialog
    setShowConfirmation(false);
    
    // Note: The parent component will handle the API call and closing the modal
  };

  return (
    <div className="compliance-modal-overlay" onClick={onClose}>
      <div className="compliance-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="compliance-modal-header">
          <div className="compliance-header-left">
            <h2>Trade Compliance Review</h2>
            <div className="compliance-id">ID: {trade.id}</div>
          </div>
          <div className="compliance-review-status">
            <div className={`status-badge ${trade.is_validated ? 'status-reviewed' : 'status-pending'}`}>
              {trade.is_validated ? 'Reviewed' : 'Pending Review'}
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="compliance-tabs">
          <button 
            className={`tab-button ${selectedTab === 'details' ? 'active' : ''}`}
            onClick={() => setSelectedTab('details')}
          >
            Trade Details
          </button>
          <button 
            className={`tab-button ${selectedTab === 'risk' ? 'active' : ''}`}
            onClick={() => setSelectedTab('risk')}
          >
            Risk Assessment
          </button>
          <button 
            className={`tab-button ${selectedTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setSelectedTab('compliance')}
          >
            Compliance Review
          </button>
        </div>
        
        <div className="compliance-modal-body">
          {selectedTab === 'details' && (
            <div className="tab-content">
              <div className="compliance-section-header">
                <h3>Trade Information</h3>
                <div className="timestamp">
                  Submitted: {trade.date_of_execution ? new Date(trade.date_of_execution).toLocaleString() : 'N/A'}
                </div>
              </div>
              
              <div className="compliance-trade-info-grid">
                <div className="trade-info-item">
                  <strong>Client:</strong>
                  <span>{trade.client}</span>
                </div>
                <div className="trade-info-item">
                  <strong>Client Type:</strong>
                  <span>{clientType}</span>
                </div>
                <div className="trade-info-item">
                  <strong>Price:</strong>
                  <span>${trade.price?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="trade-info-item">
                  <strong>Amount:</strong>
                  <span>${trade.amount?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="trade-info-item">
                  <strong>P&L:</strong>
                  <span className={`${(trade.pnl || 0) >= 0 ? 'positive-pnl' : 'negative-pnl'}`}>
                    ${trade.pnl?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="trade-info-item">
                  <strong>Contract Type:</strong>
                  <span>{trade.contract_type || 'N/A'}</span>
                </div>
                <div className="trade-info-item">
                  <strong>Contract Month:</strong>
                  <span>{trade.contract_month || 'N/A'}</span>
                </div>
              </div>

              <div className="compliance-section-header">
                <h3>Counterparty Information</h3>
              </div>

              <div className="compliance-trade-info-grid">
                <div className="trade-info-item">
                  <strong>Sales Person:</strong>
                  <span>{trade.sales_person || 'N/A'}</span>
                </div>
                <div className="trade-info-item">
                  <strong>Desk:</strong>
                  <span>{trade.desk || 'Commodities'}</span>
                </div>
                <div className="trade-info-item">
                  <strong>Booking Entity:</strong>
                  <span>{trade.booking_entity || 'Main Office'}</span>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'risk' && (
            <div className="tab-content">
              <div className="compliance-section-header">
                <h3>Risk Assessment</h3>
              </div>
              
              <div className="risk-indicators">
                <div className="risk-indicator">
                  <div className="risk-indicator-label">Anomaly Score</div>
                  <div className="risk-indicator-value">
                    <div className="risk-score-meter">
                      <div 
                        className="risk-score-fill" 
                        style={{width: `${(trade.anomaly_score || 0) * 100}%`}}
                      ></div>
                    </div>
                    <div className="risk-score-value">{trade.anomaly_score?.toFixed(3) || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="risk-indicator">
                  <div className="risk-indicator-label">Risk Level</div>
                  <div className="risk-indicator-value">
                    <div className={`risk-level-badge ${trade.risk?.toLowerCase() || 'medium'}`}>
                      {trade.risk || 'Medium'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="compliance-section">
                <h4>Price Deviation from Market</h4>
                <div className="price-deviation-chart">
                  {/* Simple DIY price chart with random data */}
                  <div className="chart-container">
                    <div className="chart-y-axis">
                      <div className="chart-y-label">$75</div>
                      <div className="chart-y-label">$73</div>
                      <div className="chart-y-label">$71</div>
                      <div className="chart-y-label">$69</div>
                    </div>
                    <div className="chart-data-area">
                      {/* Generate 14 random data points for price history */}
                      {Array.from({ length: 14 }, (_, i) => {
                        const marketPrice = 72 + (Math.random() * 2 - 1);
                        const tradePrice = i === 10 ? marketPrice + (trade.risk === 'High' ? 2 : 0.5) : null; // Add deviation at day 10
                        
                        return (
                          <div key={i} className="chart-data-column">
                            {/* Market price point */}
                            <div 
                              className="chart-data-point market" 
                              style={{ bottom: `${(marketPrice - 69) / 6 * 100}%` }}
                              title={`Market: $${marketPrice.toFixed(2)}`}
                            />
                            
                            {/* Trade price point (only on day 10) */}
                            {tradePrice && (
                              <div 
                                className="chart-data-point trade" 
                                style={{ bottom: `${(tradePrice - 69) / 6 * 100}%` }}
                                title={`Trade: $${tradePrice.toFixed(2)}`}
                              />
                            )}
                            
                            {/* Connect line to next point */}
                            {i < 13 && (
                              <div 
                                className="chart-line" 
                                style={{ 
                                  bottom: `${(marketPrice - 69) / 6 * 100}%`,
                                  height: '2px',
                                  transform: `rotate(${Math.atan2(
                                    ((72 + (Math.random() * 2 - 1)) - marketPrice) * 15, 
                                    20
                                  )}rad)`,
                                  width: '20px'
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="chart-x-axis">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="chart-x-label">
                        {new Date(Date.now() - (14 - i*2) * 86400000).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color market"></span>
                      <span>Market Price</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color trade"></span>
                      <span>This Trade ({((trade.anomaly_score || 0) * 100).toFixed(1)}% deviation)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="compliance-section">
                <h4>Historical Trading Pattern</h4>
                <div className="trading-pattern">
                  <p>This trade {(trade.anomaly_score || 0) > 0.7 ? 'deviates significantly' : 'is generally consistent'} with historical trading patterns for this client.</p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'compliance' && (
            <div className="tab-content">
              <div className="compliance-section-header">
                <h3>Compliance Review</h3>
              </div>
              
              <div className="compliance-checklist">
                <div className="checklist-item">
                  <input 
                    type="checkbox" 
                    id="check-kyc" 
                    className="compliance-checkbox"
                    checked={kycChecked}
                    onChange={(e) => setKycChecked(e.target.checked)}
                  />
                  <label htmlFor="check-kyc">KYC Requirements Satisfied</label>
                </div>
                <div className="checklist-item">
                  <input 
                    type="checkbox" 
                    id="check-aml" 
                    className="compliance-checkbox"
                    checked={amlChecked}
                    onChange={(e) => setAmlChecked(e.target.checked)}
                  />
                  <label htmlFor="check-aml">AML Screening Complete</label>
                </div>
                <div className="checklist-item">
                  <input 
                    type="checkbox" 
                    id="check-limits" 
                    className="compliance-checkbox"
                    checked={limitsChecked}
                    onChange={(e) => setLimitsChecked(e.target.checked)}
                  />
                  <label htmlFor="check-limits">Within Trading Limits</label>
                </div>
                <div className="checklist-item">
                  <input 
                    type="checkbox" 
                    id="check-sanctions" 
                    className="compliance-checkbox"
                    checked={sanctionsChecked}
                    onChange={(e) => setSanctionsChecked(e.target.checked)}
                  />
                  <label htmlFor="check-sanctions">Sanctions Check Complete</label>
                </div>
              </div>
              
              <div className="compliance-notes">
                <label htmlFor="review-comments">Review Comments:<span className="required-field">*</span></label>
                <textarea 
                  id="review-comments" 
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Enter compliance review notes here..."
                  rows={5}
                  className={`compliance-textarea ${validationError ? 'validation-error' : ''}`}
                ></textarea>
                {validationError && (
                  <div className="validation-error-message">Review comments are required</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="compliance-modal-footer">
          <div className="compliance-footer-info">
            <div className="review-info">
              {trade.is_validated ? (
                <span className="review-timestamp">Reviewed by {trade.reviewed_by || 'System'} on {new Date(trade.review_date || Date.now()).toLocaleString()}</span>
              ) : (
                <span className="review-pending">Awaiting compliance officer review</span>
              )}
            </div>
          </div>
          <div className="compliance-footer-actions">
            {!trade.is_validated && (
              <>
                <button className="compliance-button-primary" onClick={initiateApprove}>
                  Approve Trade
                </button>
                <button className="compliance-button-danger" onClick={initiateFlag}>
                  Flag for Investigation
                </button>
              </>
            )}
            <button className="compliance-button-secondary" onClick={onClose}>
              {trade.is_validated ? 'Close' : 'Review Later'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-modal-header">
              <h3>{confirmationAction === 'approve' ? 'Approve Trade' : 'Flag for Investigation'}</h3>
            </div>
            <div className="confirmation-modal-body">
              <p>Are you sure you want to {confirmationAction === 'approve' ? 'approve this trade' : 'flag this trade for investigation'}?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="confirmation-modal-footer">
              <button 
                className={confirmationAction === 'approve' ? 'compliance-button-primary' : 'compliance-button-danger'} 
                onClick={confirmationAction === 'approve' ? handleApprove : handleFlag}
              >
                {confirmationAction === 'approve' ? 'Confirm Approval' : 'Confirm Flag'}
              </button>
              <button 
                className="compliance-button-secondary" 
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeReviewModal;
