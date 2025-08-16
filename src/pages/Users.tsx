import React, { useState, useMemo } from "react";
import { useUsers } from "../api/queries";
import "./Users.css";

// Icon component interface from Home.tsx
interface IconProps {
  size?: number;
  color?: string;
}

// Subset of icons needed for this page
const Icons = {
  User: ({ size = 20 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: ({ size = 18 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Filter: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  UserPlus: ({ size = 18 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  MoreVertical: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Edit: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  AlertCircle: ({ size = 18 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Shield: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  Calendar: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  ChevronDown: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  RefreshCw: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6"></path>
      <path d="M1 20v-6h6"></path>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
  Trash: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Lock: ({ size = 16 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  )
};

// Extended user type with more fields for enterprise view
interface EnhancedUser {
  id: string;
  email: string;
  riskScore: number;
  status: 'active' | 'suspended' | 'pending';
  role: 'admin' | 'user' | 'analyst' | 'compliance';
  lastLogin: string;
  accountCreated: string;
  loginAttempts: number;
  twoFactorEnabled: boolean;
  location?: string;
  department?: string;
}

export default function Users() {
  const { data: rawData, isLoading } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  // Enhance the basic user data with additional fields for enterprise view
  const enhancedUsers: EnhancedUser[] = useMemo(() => {
    if (!rawData) return [];
    
    const roles = ['admin', 'user', 'analyst', 'compliance'] as const;
    const locations = ['New York', 'London', 'Singapore', 'Remote'];
    const departments = ['Trading', 'Compliance', 'IT', 'Finance', 'Operations'];
    
    return rawData.map((user, index) => {
      // Generate realistic dates
      const now = new Date();
      const createdDate = new Date(now);
      createdDate.setDate(now.getDate() - Math.floor(Math.random() * 365)); // Up to a year ago
      
      const lastLogin = new Date(now);
      lastLogin.setDate(now.getDate() - Math.floor(Math.random() * 30)); // Up to a month ago
      
      // Determine status based on risk score
      let status: 'active' | 'suspended' | 'pending';
      if (user.riskScore > 70) {
        status = 'suspended';
      } else if (user.riskScore > 40) {
        status = 'pending';
      } else {
        status = 'active';
      }
      
      // Simulate 2FA being more common for admins and high-risk users
      const twoFactorEnabled = user.riskScore > 50 || Math.random() > 0.5;
      
      return {
        ...user,
        status,
        role: roles[index % roles.length],
        lastLogin: lastLogin.toISOString(),
        accountCreated: createdDate.toISOString(),
        loginAttempts: Math.floor(Math.random() * 10),
        twoFactorEnabled,
        location: locations[Math.floor(Math.random() * locations.length)],
        department: departments[Math.floor(Math.random() * departments.length)]
      };
    });
  }, [rawData]);
  
  // Calculate statistics for the summary cards
  const stats = useMemo(() => {
    if (enhancedUsers.length === 0) return {
      totalUsers: 0,
      activeUsers: 0,
      highRiskUsers: 0,
      twoFactorUsers: 0,
      avgRiskScore: 0
    };
    
    const totalUsers = enhancedUsers.length;
    const activeUsers = enhancedUsers.filter(u => u.status === 'active').length;
    const highRiskUsers = enhancedUsers.filter(u => u.riskScore >= 70).length;
    const twoFactorUsers = enhancedUsers.filter(u => u.twoFactorEnabled).length;
    const avgRiskScore = Math.round(enhancedUsers.reduce((acc, u) => acc + u.riskScore, 0) / totalUsers);
    
    return {
      totalUsers,
      activeUsers,
      highRiskUsers,
      twoFactorUsers,
      avgRiskScore
    };
  }, [enhancedUsers]);
  
  // Filter users based on search query and filter selections
  const filteredUsers = useMemo(() => {
    return enhancedUsers.filter(user => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      
      // Filter by risk level
      let matchesRisk = true;
      if (selectedRisk === 'high') {
        matchesRisk = user.riskScore >= 70;
      } else if (selectedRisk === 'medium') {
        matchesRisk = user.riskScore >= 30 && user.riskScore < 70;
      } else if (selectedRisk === 'low') {
        matchesRisk = user.riskScore < 30;
      }
      
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [enhancedUsers, searchQuery, selectedStatus, selectedRisk]);

  const getRiskBadgeClass = (riskScore: number) => {
    if (riskScore >= 70) return 'badge--danger';
    if (riskScore >= 30) return 'badge--warning';
    return 'badge--success';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge--success';
      case 'suspended': return 'badge--danger';
      case 'pending': return 'badge--warning';
      default: return 'badge--secondary';
    }
  };

  if (isLoading) {
    return <div className="usersPage loading">Loading user data...</div>;
  }

  return (
    <div className="usersPage">
      {/* Professional dashboard header */}
      <header className="dashboardHeader" style={{ gridColumn: "span 12" }}>
        <div className="dashboardHeader__title">
          <h1>Users Management</h1>
          <div className="dashboardHeader__subtitle">Account Security & Risk Assessment</div>
        </div>

        <div className="dashboardControls">
          <div className="dateSelector">
            <Icons.Calendar size={14} />
            <span>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <Icons.ChevronDown size={14} />
          </div>
          <button className="refreshButton">
            <Icons.RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* User statistics summary */}
      <section className="userStats" style={{ gridColumn: "span 12" }}>
        <div className="statCard">
          <div className="statCard__icon">
            <Icons.User size={20} />
          </div>
          <div className="statCard__content">
            <h4>Total Users</h4>
            <div className="statCard__value">{stats.totalUsers}</div>
          </div>
        </div>
        
        <div className="statCard">
          <div className="statCard__icon active">
            <Icons.User size={20} />
          </div>
          <div className="statCard__content">
            <h4>Active Users</h4>
            <div className="statCard__value">{stats.activeUsers}</div>
            <div className="statCard__percent">
              {stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
            </div>
          </div>
        </div>
        
        <div className="statCard">
          <div className="statCard__icon alert">
            <Icons.AlertCircle size={20} />
          </div>
          <div className="statCard__content">
            <h4>High Risk Users</h4>
            <div className="statCard__value">{stats.highRiskUsers}</div>
            <div className="statCard__percent">
              {stats.totalUsers ? Math.round((stats.highRiskUsers / stats.totalUsers) * 100) : 0}% of total
            </div>
          </div>
        </div>
        
        <div className="statCard">
          <div className="statCard__icon secure">
            <Icons.Lock size={20} />
          </div>
          <div className="statCard__content">
            <h4>2FA Enabled</h4>
            <div className="statCard__value">{stats.twoFactorUsers}</div>
            <div className="statCard__percent">
              {stats.totalUsers ? Math.round((stats.twoFactorUsers / stats.totalUsers) * 100) : 0}% of total
            </div>
          </div>
        </div>
      </section>

      {/* Search and filter section */}
      <section className="usersToolbar" style={{ gridColumn: "span 12" }}>
        <div className="searchBox">
          <Icons.Search size={18} />
          <input 
            type="text" 
            placeholder="Search users by email or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filterControls">
          <div className="filterGroup">
            <label><Icons.Filter size={14} /> Status:</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div className="filterGroup">
            <label><Icons.AlertCircle size={14} /> Risk Level:</label>
            <select 
              value={selectedRisk} 
              onChange={(e) => setSelectedRisk(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk (70+)</option>
              <option value="medium">Medium Risk (30-69)</option>
              <option value="low">Low Risk (0-29)</option>
            </select>
          </div>
        </div>
        
        <button className="primaryButton">
          <Icons.UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </section>

      {/* Users table with enterprise styling */}
      <section className="usersTablePanel" style={{ gridColumn: "span 12" }}>
        <div className="panelHeader">
          <div className="panelHeader__left">
            <h3>User Accounts</h3>
            <div className="panelHeader__subtitle">
              Showing {filteredUsers.length} of {enhancedUsers.length} users
            </div>
          </div>
        </div>
        
        <div className="tableResponsive">
          <table className="usersTable enterpriseTable">
            <thead>
              <tr>
                <Th>User ID</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Risk Score</Th>
                <Th>2FA</Th>
                <Th>Last Login</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td className="userEmail">
                    <div className="userAvatarGroup">
                      <div className="userAvatar">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.email}</span>
                    </div>
                  </Td>
                  <Td>{user.role}</Td>
                  <Td>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="riskScore">
                      <div 
                        className={`riskIndicator ${getRiskBadgeClass(user.riskScore)}`}
                        style={{ width: `${Math.min(100, user.riskScore)}%` }}
                      ></div>
                      <span>{user.riskScore}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className={`badge ${user.twoFactorEnabled ? 'badge--success' : 'badge--secondary'}`}>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </Td>
                  <Td>
                    <div className="userTimestamp">
                      <Icons.Calendar size={12} />
                      {new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}  
                    </div>
                  </Td>
                  <Td>
                    <div className="actionButtons">
                      <button className="iconButton">
                        <Icons.Edit size={16} />
                      </button>
                      <button className="iconButton">
                        <Icons.Lock size={16} />
                      </button>
                      <button className="iconButton danger">
                        <Icons.Trash size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="emptyState">
                    <div>
                      <Icons.User size={24} />
                      <p>No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="tablePagination">
          <div className="paginationInfo">
            Showing <b>{Math.min(1, filteredUsers.length)}-{filteredUsers.length}</b> of <b>{enhancedUsers.length}</b> users
          </div>
          <div className="paginationControls">
            <button className="paginationButton" disabled={true}>&lt; Previous</button>
            <span className="paginationCurrent">Page 1 of 1</span>
            <button className="paginationButton" disabled={true}>Next &gt;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="enterpriseTable__th">{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`enterpriseTable__td ${className}`}>{children}</td>;
}
