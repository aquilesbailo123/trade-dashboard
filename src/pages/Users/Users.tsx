import { useState, useMemo, useEffect } from "react";
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

// Trading client types for natural gas/oil trading
const CLIENT_TYPES = [
    'Hedge Fund',
    'RIA',
    'Broker',
    'Oil Company',
    'Mining Firm',
    'Refinery',
    'Pipeline Company',
    'Energy Trader',
    'Commodity Fund',
    'Utility Company',
    'Trading Company',
    'Investment Firm',
    'Financial Institution'
];

// Extended User type with trading-specific data
type ExtendedUser = {
    id: string;
    email: string;
    riskScore: number;
    transactionCount?: number;
    lastActivity?: string;
    status?: 'active' | 'flagged' | 'suspended' | 'under_review';
    riskLevel?: 'low' | 'medium' | 'high';
    clientType?: string;
    tradingVolume?: number;
    avgTradeSize?: number;
    desk?: string;
    salesPerson?: string;
    kycStatus?: 'complete' | 'pending' | 'expired';
    amlStatus?: 'cleared' | 'pending' | 'flagged';
    companyName?: string;
    companyType?: string;
};

// Generate a random company name for trading clients
const generateCompanyName = () => {
    const prefixes = ['Global', 'Alpha', 'Blue', 'Premier', 'Strategic', 'Summit', 'Vanguard', 'Pinnacle', 'Apex', 'Meridian'];
    const mids = ['Energy', 'Resource', 'Commodity', 'Asset', 'Capital', 'Trade', 'Market', 'Petroleum', 'Gas', 'Natural'];
    const suffixes = ['Partners', 'Trading', 'Group', 'Holdings', 'International', 'Investments', 'Corporation', 'Ventures', 'Industries', 'Resources'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${mids[Math.floor(Math.random() * mids.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

// Generate a random email based on name or company
const generateEmail = (name: string) => {
    const domains = ['energytrade.com', 'commoditypartners.com', 'tradingfirm.com', 'resources.com', 'energytraders.net', 'gasgroup.com', 'oiltrading.net'];
    const nameParts = name.toLowerCase().split(' ');
    let email = '';
    
    if (nameParts.length >= 2) {
        // Use first letter of first name + last name for person emails
        email = `${nameParts[0][0]}${nameParts[nameParts.length-1]}@${domains[Math.floor(Math.random() * domains.length)]}`;
    } else {
        // For companies, use modified name
        email = `info@${nameParts[0].toLowerCase()}.${domains[Math.floor(Math.random() * domains.length)].split('.')[1]}`;
    }
    
    return email;
};

export default function Users() {
    const { data: usersData, isLoading: usersLoading } = useUsers();
    const { data: transactionsData } = useTransactions();
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    
    // Additional dummy data
    const [extraUsers, setExtraUsers] = useState<any[]>([]);

    // Generate extra dummy users for pagination testing
    useEffect(() => {
        // Generate 50 additional dummy users
        const generateDummyUsers = () => {
            const dummyUsers = [];
            for (let i = 0; i < 50; i++) {
                const companyName = generateCompanyName();
                const riskScore = Math.floor(Math.random() * 100);
                
                dummyUsers.push({
                    id: `TRDCLIENT${1000 + i}`,
                    email: generateEmail(companyName),
                    riskScore,
                    companyName
                });
            }
            setExtraUsers(dummyUsers);
        };
        
        generateDummyUsers();
    }, []);

    // Enhance user data with trading-specific information and risk levels
    const enhancedUsers = useMemo(() => {
        if (!usersData && extraUsers.length === 0) return [];
        
        // Combine original users data with extra dummy users
        const combinedUsers = [...(usersData || []), ...extraUsers];
        
        return combinedUsers.map(user => {
            const userTransactions = transactionsData?.filter(tx => tx.user === user.email) || [];
            const riskLevel = user.riskScore >= 70 ? 'high' : user.riskScore >= 40 ? 'medium' : 'low';
            const status = user.riskScore >= 90 ? 'suspended' : 
                          user.riskScore >= 80 ? 'flagged' : 
                          user.riskScore >= 60 ? 'under_review' : 'active';
            
            // Generate trading-specific data
            const clientType = CLIENT_TYPES[Math.floor(Math.random() * CLIENT_TYPES.length)];
            const tradingVolume = userTransactions.length > 0 ? 
                userTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) : 
                Math.floor(Math.random() * 50000000) + 1000000; // $1M - $50M
            const avgTradeSize = userTransactions.length > 0 ? 
                tradingVolume / userTransactions.length : 
                Math.floor(Math.random() * 5000000) + 100000; // $100K - $5M
            
            const desks = ['Commodities', 'Energy Trading', 'Natural Gas', 'Crude Oil', 'Refined Products'];
            const salesPersons = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Kim'];
            
            return {
                ...user,
                transactionCount: userTransactions.length,
                lastActivity: userTransactions.length > 0 ? 
                    new Date(Math.max(...userTransactions.map(tx => new Date(tx.createdAt).getTime()))).toISOString() : 
                    new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                status,
                riskLevel,
                clientType,
                tradingVolume,
                avgTradeSize,
                desk: desks[Math.floor(Math.random() * desks.length)],
                salesPerson: salesPersons[Math.floor(Math.random() * salesPersons.length)],
                kycStatus: user.riskScore > 80 ? 'expired' : user.riskScore > 60 ? 'pending' : 'complete',
                amlStatus: user.riskScore > 75 ? 'flagged' : user.riskScore > 50 ? 'pending' : 'cleared',
                companyName: 'ABC Trading Company',
                companyType: 'Energy Trader'
            } as ExtendedUser;
        });
    }, [usersData, transactionsData]);

    // Filter users based on search and risk level
    const filteredUsers = useMemo(() => {
        return enhancedUsers.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            
            const matchesRisk = riskFilter === 'all' || user.riskLevel === riskFilter;
            
            return matchesSearch && matchesRisk;
        });
    }, [enhancedUsers, searchQuery, riskFilter]);
    
    // Get current users for pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    // Change page
    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Calculate trading-specific metrics
    const metrics = useMemo(() => {
        const highRiskCount = enhancedUsers.filter(user => user.riskScore >= 70).length;
        const flaggedCount = enhancedUsers.filter(user => user.status === 'flagged' || user.status === 'suspended').length;
        const reviewCount = enhancedUsers.filter(user => user.status === 'under_review').length;
        const kycPendingCount = enhancedUsers.filter(user => user.kycStatus === 'pending').length;
        const kycExpiredCount = enhancedUsers.filter(user => user.kycStatus === 'expired').length;
        const amlFlaggedCount = enhancedUsers.filter(user => user.amlStatus === 'flagged').length;
        
        // Calculate total trading volume
        const totalTradingVolume = enhancedUsers.reduce((sum, user) => sum + (user.tradingVolume || 0), 0);
        
        // Trading risk distribution by client type
        const clientTypeRisk = {} as Record<string, { count: number, avgRisk: number }>;
        enhancedUsers.forEach(user => {
            if (user.clientType) {
                if (!clientTypeRisk[user.clientType]) {
                    clientTypeRisk[user.clientType] = { count: 0, avgRisk: 0 };
                }
                clientTypeRisk[user.clientType].count++;
                clientTypeRisk[user.clientType].avgRisk += user.riskScore;
            }
        });
        
        // Calculate average risk for each client type
        Object.keys(clientTypeRisk).forEach(type => {
            clientTypeRisk[type].avgRisk = clientTypeRisk[type].avgRisk / clientTypeRisk[type].count;
        });
        
        return {
            totalClients: enhancedUsers.length,
            highRiskClients: highRiskCount,
            flaggedClients: flaggedCount,
            reviewClients: reviewCount,
            kycPendingCount,
            kycExpiredCount,
            amlFlaggedCount,
            totalTradingVolume,
            clientTypeRisk
        };
    }, [enhancedUsers]);

    return (
        <div className="users_container">
            {/* Dashboard header */}
            <header className="users_header">
                <h1>Trading Client Risk Analysis</h1>
                <div className="users_header_actions">
                    <div className="users_search_bar">
                        <Icons.Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search trading counterparties..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="users_dashboard">
                <div className="users_dashboard_wrapper">
                    {/* Trading Client Metrics Summary Section */}
                    <section className="users_metrics_summary_section">
                        <div className="users_metrics_grid">
                            <div className="users_metric_card high">
                                <div className="users_metric_header">
                                    <h3>High Risk Clients</h3>
                                </div>
                                <div className="users_metric_value">
                                    {metrics.highRiskClients}
                                    <span className="users_metric_unit">clients</span>
                                </div>
                                <div className="users_metric_info">Require immediate compliance review</div>
                            </div>
                            
                            <div className="users_metric_card medium">
                                <div className="users_metric_header">
                                    <h3>Under Review</h3>
                                </div>
                                <div className="users_metric_value">
                                    {metrics.reviewClients}
                                    <span className="users_metric_unit">clients</span>
                                </div>
                                <div className="users_metric_info">Pending compliance officer review</div>
                            </div>
                            
                            <div className="users_metric_card warning">
                                <div className="users_metric_header">
                                    <h3>KYC/AML Issues</h3>
                                </div>
                                <div className="users_metric_value">
                                    {metrics.kycExpiredCount + metrics.amlFlaggedCount}
                                    <span className="users_metric_unit">clients</span>
                                </div>
                                <div className="users_metric_info">Documentation or screening issues</div>
                            </div>

                            <div className="users_metric_card total">
                                <div className="users_metric_header">
                                    <h3>Total Trading Clients</h3>
                                </div>
                                <div className="users_metric_value">
                                    {metrics.totalClients}
                                    <span className="users_metric_unit">clients</span>
                                </div>
                                <div className="users_metric_info">Active energy trading counterparties</div>
                            </div>
                        </div>
                    </section>

                    {/* Trading Clients Table */}
                    <section className="users_table_section">
                        <div className="users_panel_header">
                            <h3>Trading Client Risk Profiles</h3>
                            <div className="users_table_actions">
                                <div className="users_filter_container">
                                    <Icons.Filter size={16} />
                                    <select 
                                        className="users_filter_select"
                                        value={riskFilter}
                                        onChange={(e) => setRiskFilter(e.target.value)}
                                    >
                                        <option value="all">All Risk Levels</option>
                                        <option value="high">High Risk Clients</option>
                                        <option value="medium">Medium Risk Clients</option>
                                        <option value="low">Low Risk Clients</option>
                                    </select>
                                </div>
                                <button className="users_refresh_button">
                                    <Icons.RefreshCw size={16} /> Refresh Trading Data
                                </button>
                            </div>
                        </div>
                        
                        {usersLoading ? (
                            <div className="users_loading_state">
                                <div className="users_spinner"></div>
                                <p>Loading trading clients...</p>
                            </div>
                        ) : (
                            <div className="users_table_container">
                                <table className="users_table">
                                    <thead>
                                        <tr>
                                            <th>Client ID</th>
                                            <th>Email</th>
                                            <th>Client Type</th>
                                            <th>Trading Desk</th>
                                            <th>Sales Person</th>
                                            <th>Trading Volume</th>
                                            <th>Risk Score</th>
                                            <th>KYC Status</th>
                                            <th>AML Status</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={11}>
                                                    <div className="users_empty_state">
                                                        <div className="users_empty_state_icon">🔍</div>
                                                        <h3>No trading clients found</h3>
                                                        <p>Try adjusting your search or filter criteria</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentUsers.map((user) => (
                                                <tr 
                                                    key={user.id} 
                                                    className={`users_table_row ${user.riskLevel === 'high' ? 'high-risk-row' : user.riskLevel === 'medium' ? 'medium-risk-row' : 'low-risk-row'}`}
                                                >
                                                    <td className="users_id">{user.id}</td>
                                                    <td className="users_email">{user.email}</td>
                                                    <td className="users_client_type">{user.clientType}</td>
                                                    <td className="users_desk">{user.desk}</td>
                                                    <td className="users_sales_person">{user.salesPerson}</td>
                                                    <td className="users_trading_volume">
                                                        ${(user.tradingVolume || 0).toLocaleString()}
                                                    </td>
                                                    <td className="users_risk_score">
                                                        <strong>{user.riskScore}</strong>
                                                    </td>
                                                    <td>
                                                        <span className={`users_kyc_badge ${user.kycStatus}`}>
                                                            {user.kycStatus === 'complete' ? 'Complete' : 
                                                             user.kycStatus === 'pending' ? 'Pending' : 'Expired'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`users_aml_badge ${user.amlStatus}`}>
                                                            {user.amlStatus === 'cleared' ? 'Cleared' : 
                                                             user.amlStatus === 'pending' ? 'Pending' : 'Flagged'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`users_status_badge ${user.status}`}>
                                                            {user.status === 'under_review' ? 'Under Review' : 
                                                             user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="users_action_buttons">
                                                            <button className="users_icon_button" title="View Client Details">
                                                                <Icons.Eye size={16} />
                                                            </button>
                                                            <button className="users_icon_button" title="Flag Client">
                                                                <Icons.Flag size={16} />
                                                            </button>
                                                            <button className="users_icon_button" title="Compliance Review">
                                                                <Icons.Shield size={16} />
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
                            <button 
                                className="users_pagination_button" 
                                disabled={currentPage === 1}
                                onClick={() => paginate(currentPage - 1)}
                            >
                                <Icons.ChevronLeft size={16} />
                            </button>
                            <span className="users_pagination_info">
                                Trading Clients: {filteredUsers.length} | Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                className="users_pagination_button"
                                disabled={currentPage === totalPages}
                                onClick={() => paginate(currentPage + 1)}
                            >
                                <Icons.ChevronRight size={16} />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
