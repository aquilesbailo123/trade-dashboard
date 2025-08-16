import React, { useState } from "react";
import { useTransactions } from "../api/queries";
import "./Transactions.css";

export default function Transactions() {
    const { data, isLoading } = useTransactions();
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter transactions based on status and search query
    const filteredData = (data ?? []).filter(t => {
        const matchesStatus = !filterStatus || t.status === filterStatus;
        const matchesSearch = !searchQuery || 
            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Calculate summary statistics
    const totalAmount = filteredData.reduce((sum, t) => sum + t.amount, 0);
    const flaggedCount = filteredData.filter(t => t.status === "flagged").length;
    const pendingCount = filteredData.filter(t => t.status === "pending").length;
    
    return (
        <div className="container">
            <div className="transactionsPage">
            <div className="transactionsHeader">
                <h2>Transactions</h2>
                <div className="transactionsActions">
                    <div className="searchContainer">
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="searchInput"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="searchIcon">
                            <path d="M8.5 3.5C11.5376 3.5 14 5.96243 14 9C14 12.0376 11.5376 14.5 8.5 14.5C5.46243 14.5 3 12.0376 3 9C3 5.96243 5.46243 3.5 8.5 3.5ZM8.5 2C4.6 2 1.5 5.1 1.5 9C1.5 12.9 4.6 16 8.5 16C10.25 16 11.8 15.35 13 14.3L17.3 18.6L18.75 17.15L14.45 12.95C15.45 11.7 16 10.15 16 8.5C16 4.6 12.9 1.5 8.5 1.5V2Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="filterButtons">
                        <button 
                            className={`filterBtn ${filterStatus === null ? 'active' : ''}`}
                            onClick={() => setFilterStatus(null)}
                        >
                            All
                        </button>
                        <button 
                            className={`filterBtn ${filterStatus === "approved" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("approved")}
                        >
                            Approved
                        </button>
                        <button 
                            className={`filterBtn ${filterStatus === "pending" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("pending")}
                        >
                            Pending
                        </button>
                        <button 
                            className={`filterBtn ${filterStatus === "flagged" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("flagged")}
                        >
                            Flagged
                        </button>
                        <button 
                            className={`filterBtn ${filterStatus === "rejected" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("rejected")}
                        >
                            Rejected
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction Summary Stats */}
            <div className="statsContainer" style={{gridColumn: "span 12"}}>
                <div className="statsGrid">
                    <div className="statCard">
                        <div className="statCard__label">Total Transactions</div>
                        <div className="statCard__value">{filteredData.length}</div>
                    </div>
                    <div className="statCard">
                        <div className="statCard__label">Total Volume</div>
                        <div className="statCard__value">
                            ${totalAmount.toFixed(2)}
                        </div>
                    </div>
                    <div className="statCard">
                        <div className="statCard__label">Flagged Transactions</div>
                        <div className="statCard__value">{flaggedCount}</div>
                    </div>
                    <div className="statCard">
                        <div className="statCard__label">Pending Review</div>
                        <div className="statCard__value">{pendingCount}</div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="loadingIndicator">
                    <div className="spinner"></div>
                    <span>Loading transactions...</span>
                </div>
            ) : (
                <div className="card">
                    <div className="transactionsTableWrapper">
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
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <Td colSpan={6} style={{ textAlign: "center" }}>
                                            No transactions matching your filters
                                        </Td>
                                    </tr>
                                ) : (
                                    filteredData.map((t) => (
                                        <tr key={t.id}>
                                            <Td>{t.id}</Td>
                                            <Td>{t.user}</Td>
                                            <Td>
                                                <span className="amount">
                                                    {t.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </span> 
                                                <span className="currency">{t.currency}</span>
                                            </Td>
                                            <Td>
                                                <span className={`statusBadge ${t.status}`}>
                                                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                                </span>
                                            </Td>
                                            <Td>{new Date(t.createdAt).toLocaleString()}</Td>
                                            <Td>
                                                <div className="actionButtons">
                                                    <button className="actionBtn view" title="View details">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                        </svg>
                                                    </button>
                                                    {t.status === "flagged" || t.status === "pending" ? (
                                                        <button className="actionBtn approve" title="Approve transaction">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        </button>
                                                    ) : null}
                                                    {t.status === "flagged" || t.status === "pending" ? (
                                                        <button className="actionBtn reject" title="Reject transaction">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                                            </svg>
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </Td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th style={{ textAlign: "left", fontWeight: 600, padding: "8px 6px", borderBottom: `1px solid var(--color-border)` }}>{children}</th>
    );
}

function Td({ children, colSpan, style }: { children: React.ReactNode; colSpan?: number; style?: React.CSSProperties }) {
    return (
        <td 
            colSpan={colSpan} 
            style={{ 
                padding: "8px 6px", 
                borderBottom: `1px solid var(--color-border)`,
                ...style 
            }}
        >
            {children}
        </td>
    );
}
