import { useState, useMemo } from "react";
import { useUsers } from "../../api/queries";
import { useTransactions } from "../../api/queries";
import "./Users.css";

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
    Flag: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
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
    ),
    Users: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    ),
    AlertTriangle: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    Shield: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    )
};

// Extended User type with additional risk data
type ExtendedUser = {
    id: string;
    email: string;
    riskScore: number;
    transactionCount?: number;
    lastActivity?: string;
    status?: 'active' | 'flagged' | 'suspended';
    riskLevel?: 'low' | 'medium' | 'high';
};

export default function Users() {
    const { data: usersData, isLoading: usersLoading } = useUsers();
    const { data: transactionsData } = useTransactions();
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');

    // Enhance user data with transaction information and risk levels
    const enhancedUsers = useMemo(() => {
        if (!usersData) return [];
        
        return usersData.map(user => {
            const userTransactions = transactionsData?.filter(tx => tx.user === user.email) || [];
            const riskLevel = user.riskScore >= 70 ? 'high' : user.riskScore >= 40 ? 'medium' : 'low';
            const status = user.riskScore >= 80 ? 'flagged' : user.riskScore >= 90 ? 'suspended' : 'active';
            
            return {
                ...user,
                transactionCount: userTransactions.length,
                lastActivity: userTransactions.length > 0 ? 
                    new Date(Math.max(...userTransactions.map(tx => new Date(tx.createdAt).getTime()))).toISOString() : 
                    new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                status,
                riskLevel
            } as ExtendedUser;
        });
    }, [usersData, transactionsData]);

    // Filter users based on search and risk level
    const filteredUsers = useMemo(() => {
        return enhancedUsers.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesRisk = riskFilter === 'all' || user.riskLevel === riskFilter;
            
            return matchesSearch && matchesRisk;
        });
    }, [enhancedUsers, searchQuery, riskFilter]);

    // Calculate user metrics
    const userMetrics = useMemo(() => {
        const total = enhancedUsers.length;
        const highRisk = enhancedUsers.filter(u => u.riskLevel === 'high').length;
        const mediumRisk = enhancedUsers.filter(u => u.riskLevel === 'medium').length;
        const lowRisk = enhancedUsers.filter(u => u.riskLevel === 'low').length;
        const flagged = enhancedUsers.filter(u => u.status === 'flagged' || u.status === 'suspended').length;
        
        return { total, highRisk, mediumRisk, lowRisk, flagged };
    }, [enhancedUsers]);

    return (
        <div className="users_container">
            {/* Dashboard header */}
            <header className="users_header">
                <h1>User Risk Analysis</h1>
                <div className="users_header_actions">
                    <div className="users_search_bar">
                        <Icons.Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="users_dashboard">
                <div className="users_dashboard_wrapper">
                    {/* Risk Metrics Summary Section */}
                    <section className="users_metrics_summary_section">
                        <div className="users_metrics_grid">
                            <div className="users_metric_card high">
                                <div className="users_metric_header">
                                    <h3>High Risk Users</h3>
                                </div>
                                <div className="users_metric_value">
                                    {userMetrics.highRisk}
                                    <span className="users_metric_unit">users</span>
                                </div>
                                <div className="users_metric_info">Require immediate attention</div>
                            </div>
                            
                            <div className="users_metric_card medium">
                                <div className="users_metric_header">
                                    <h3>Medium Risk Users</h3>
                                </div>
                                <div className="users_metric_value">
                                    {userMetrics.mediumRisk}
                                    <span className="users_metric_unit">users</span>
                                </div>
                                <div className="users_metric_info">Need monitoring</div>
                            </div>
                            
                            <div className="users_metric_card low">
                                <div className="users_metric_header">
                                    <h3>Low Risk Users</h3>
                                </div>
                                <div className="users_metric_value">
                                    {userMetrics.lowRisk}
                                    <span className="users_metric_unit">users</span>
                                </div>
                                <div className="users_metric_info">Normal user behavior</div>
                            </div>

                            <div className="users_metric_card total">
                                <div className="users_metric_header">
                                    <h3>Total Users</h3>
                                </div>
                                <div className="users_metric_value">
                                    {userMetrics.total}
                                    <span className="users_metric_unit">users</span>
                                </div>
                                <div className="users_metric_info">Overall user count</div>
                            </div>
                        </div>
                    </section>

                    {/* Users Table */}
                    <section className="users_table_section">
                        <div className="users_panel_header">
                            <h3>User Risk Profiles</h3>
                            <div className="users_table_actions">
                                <div className="users_filter_container">
                                    <Icons.Filter size={16} />
                                    <select 
                                        className="users_filter_select"
                                        value={riskFilter}
                                        onChange={(e) => setRiskFilter(e.target.value)}
                                    >
                                        <option value="all">All Risk Levels</option>
                                        <option value="high">High Risk Only</option>
                                        <option value="medium">Medium Risk Only</option>
                                        <option value="low">Low Risk Only</option>
                                    </select>
                                </div>
                                <button className="users_refresh_button">
                                    <Icons.RefreshCw size={16} /> Refresh
                                </button>
                            </div>
                        </div>
                        
                        {usersLoading ? (
                            <div className="users_loading_state">
                                <div className="users_spinner"></div>
                                <p>Loading users...</p>
                            </div>
                        ) : (
                            <div className="users_table_container">
                                <table className="users_table">
                                    <thead>
                                        <tr>
                                            <th>User ID</th>
                                            <th>Email</th>
                                            <th>Risk Score</th>
                                            <th>Risk Level</th>
                                            <th>Transactions</th>
                                            <th>Last Activity</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={8}>
                                                    <div className="users_empty_state">
                                                        <div className="users_empty_state_icon">🔍</div>
                                                        <h3>No users found</h3>
                                                        <p>Try adjusting your search or filter criteria</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr 
                                                    key={user.id} 
                                                    className={`users_table_row ${user.riskLevel === 'high' ? 'high-risk-row' : user.riskLevel === 'medium' ? 'medium-risk-row' : 'low-risk-row'}`}
                                                >
                                                    <td className="users_id">{user.id}</td>
                                                    <td className="users_email">{user.email}</td>
                                                    <td className="users_risk_score">
                                                        <strong>{user.riskScore}</strong>
                                                    </td>
                                                    <td>
                                                        <span className={`users_risk_badge ${user.riskLevel}`}>
                                                            {user.riskLevel ? user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1) : 'Low'}
                                                        </span>
                                                    </td>
                                                    <td>{user.transactionCount || 0}</td>
                                                    <td>{user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'}</td>
                                                    <td>
                                                        <span className={`users_status_badge ${user.status}`}>
                                                            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="users_action_buttons">
                                                            <button className="users_icon_button" title="View Details">
                                                                <Icons.Eye size={16} />
                                                            </button>
                                                            <button className="users_icon_button" title="Flag User">
                                                                <Icons.Flag size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        <div className="users_pagination">
                            <button className="users_pagination_button" disabled><Icons.ChevronLeft size={16} /></button>
                            <span className="users_pagination_info">Page 1 of 1</span>
                            <button className="users_pagination_button"><Icons.ChevronRight size={16} /></button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
