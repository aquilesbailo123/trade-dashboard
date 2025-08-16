
import { useState } from 'react';
import './Settings.css';

// Icon component interface from Home.tsx
interface IconProps {
    size?: number;
    color?: string;
}

// Subset of icons needed for this page
const Icons = {
    Gear: ({ size = 20 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    ),
    Bell: ({ size = 20 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    ),
    Database: ({ size = 20 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
        </svg>
    ),
    Users: ({ size = 20 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    ),
    Lock: ({ size = 20 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    ),
    Save: ({ size = 16 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
    ),
    Plus: ({ size = 16 }: IconProps = {}) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
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
};

export default function Settings() {
    const [activeSection, setActiveSection] = useState('general');
    const [activeTab, setActiveTab] = useState('thresholds');
    const [riskThreshold, setRiskThreshold] = useState(75);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [slackNotifications, setSlackNotifications] = useState(false);
    const [apiKeys, setApiKeys] = useState([
        { id: 1, name: 'Production API Key', key: '••••••••••••••••', created: '2025-07-01', lastUsed: '2025-08-15' },
        { id: 2, name: 'Development API Key', key: '••••••••••••••••', created: '2025-07-15', lastUsed: '2025-08-10' },
    ]);

    const handleDeleteKey = (id: number) => {
        setApiKeys(apiKeys.filter(key => key.id !== id));
    };

    return (
        <div className="settingsPage" style={{ width: "100%", padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem" }}>
            {/* Professional dashboard header */}
            <header className="dashboardHeader" style={{ gridColumn: "span 12" }}>
                <div className="dashboardHeader__title">
                    <h1>Settings</h1>
                    <div className="dashboardHeader__subtitle">System Configuration & Preferences</div>
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
            
            <div className="settingsContainer" style={{ gridColumn: "span 12" }}>
                {/* Settings Sidebar */}
                <div className="settingsSidebar">
                    <div className="settingsNav">
                        <div 
                            className={`settingsNavItem ${activeSection === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveSection('general')}
                        >
                            <span className="settingsIcon">
                                <Icons.Gear />
                            </span>
                            General Settings
                        </div>
                        <div 
                            className={`settingsNavItem ${activeSection === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveSection('notifications')}
                        >
                            <span className="settingsIcon">
                                <Icons.Bell />
                            </span>
                            Notifications
                        </div>
                        <div 
                            className={`settingsNavItem ${activeSection === 'api' ? 'active' : ''}`}
                            onClick={() => setActiveSection('api')}
                        >
                            <span className="settingsIcon">
                                <Icons.Database />
                            </span>
                            API Access
                        </div>
                        <div 
                            className={`settingsNavItem ${activeSection === 'team' ? 'active' : ''}`}
                            onClick={() => setActiveSection('team')}
                        >
                            <span className="settingsIcon">
                                <Icons.Users />
                            </span>
                            Team Members
                        </div>
                        <div 
                            className={`settingsNavItem ${activeSection === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveSection('security')}
                        >
                            <span className="settingsIcon">
                                <Icons.Lock />
                            </span>
                            Security
                        </div>
                    </div>
                </div>
                
                {/* Settings Content */}
                <div className="settingsContent">
                    {/* General Settings */}
                    {activeSection === 'general' && (
                        <>
                            <div className="settingsTabs">
                                <div 
                                    className={`settingsTab ${activeTab === 'thresholds' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('thresholds')}
                                >
                                    Risk Thresholds
                                </div>
                                <div 
                                    className={`settingsTab ${activeTab === 'system' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('system')}
                                >
                                    System Settings
                                </div>
                                <div 
                                    className={`settingsTab ${activeTab === 'display' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('display')}
                                >
                                    Display Options
                                </div>
                            </div>
                            
                            {activeTab === 'thresholds' && (
                                <div className="settingsSection">
                                    <h3>Risk Threshold Configuration</h3>
                                    
                                    <div className="settingsForm">
                                        <div className="formGroup">
                                            <label className="formLabel">
                                                Transaction Risk Threshold
                                                <span className="sliderValue">{riskThreshold}%</span>
                                            </label>
                                            <input 
                                                type="range" 
                                                className="formSlider" 
                                                min="0" 
                                                max="100" 
                                                value={riskThreshold}
                                                onChange={(e) => setRiskThreshold(parseInt(e.target.value))}
                                            />
                                            <p className="formHint">
                                                Transactions with risk scores above this threshold will be automatically flagged for review.
                                            </p>
                                        </div>
                                        
                                        <div className="settingsFormRow">
                                            <div className="formGroup">
                                                <label className="formLabel">Minimum Transaction Amount to Monitor</label>
                                                <input type="text" className="formInput" defaultValue="100.00" />
                                                <p className="formHint">Transactions below this amount will not trigger risk assessment</p>
                                            </div>
                                            
                                            <div className="formGroup">
                                                <label className="formLabel">Flagged User Threshold</label>
                                                <div className="selectWrapper">
                                                    <select className="formInput" defaultValue="3">
                                                        <option value="1">After 1 flagged transaction</option>
                                                        <option value="2">After 2 flagged transactions</option>
                                                        <option value="3">After 3 flagged transactions</option>
                                                        <option value="5">After 5 flagged transactions</option>
                                                        <option value="10">After 10 flagged transactions</option>
                                                    </select>
                                                </div>
                                                <p className="formHint">Number of flagged transactions before a user is considered high-risk</p>
                                            </div>
                                        </div>
                                        
                                        <div className="formActions">
                                            <button className="btn btnSecondary">Reset to Defaults</button>
                                            <button className="btn btnPrimary">
                                                <Icons.Save />
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'system' && (
                                <div className="settingsSection">
                                    <h3>System Settings</h3>
                                    <p>Configure system-level settings and preferences.</p>
                                </div>
                            )}
                            
                            {activeTab === 'display' && (
                                <div className="settingsSection">
                                    <h3>Display Options</h3>
                                    <p>Customize the display and appearance of the dashboard.</p>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* Notification Settings */}
                    {activeSection === 'notifications' && (
                        <div className="settingsSection">
                            <h3>Notification Settings</h3>
                            
                            <div className="settingsForm">
                                <div className="formGroup">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="formLabel">Enable Notifications</label>
                                        <label className="toggleSwitch">
                                            <input 
                                                type="checkbox" 
                                                checked={notificationsEnabled}
                                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                            />
                                            <span className="toggleSlider"></span>
                                        </label>
                                    </div>
                                    <p className="formHint">Receive alerts when transactions are flagged for review</p>
                                </div>
                                
                                {notificationsEnabled && (
                                    <>
                                        <div className="formGroup">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label className="formLabel">Email Notifications</label>
                                                <label className="toggleSwitch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={emailNotifications}
                                                        onChange={() => setEmailNotifications(!emailNotifications)}
                                                    />
                                                    <span className="toggleSlider"></span>
                                                </label>
                                            </div>
                                            {emailNotifications && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <input type="email" className="formInput" defaultValue="admin@frauddetection.com" placeholder="Email address" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="formGroup">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label className="formLabel">Slack Notifications</label>
                                                <label className="toggleSwitch">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={slackNotifications}
                                                        onChange={() => setSlackNotifications(!slackNotifications)}
                                                    />
                                                    <span className="toggleSlider"></span>
                                                </label>
                                            </div>
                                            {slackNotifications && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <input type="text" className="formInput" placeholder="Slack Webhook URL" />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                
                                <div className="formActions">
                                    <button className="btn btnPrimary">Save Notification Settings</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* API Access Settings */}
                    {activeSection === 'api' && (
                        <div className="settingsSection">
                            <h3>API Access</h3>
                            
                            <div className="settingsForm">
                                <p>Manage your API keys for accessing the Fraud Detection API.</p>
                                
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1.5rem' }}>
                                    {apiKeys.map(key => (
                                        <div className="apiKeyItem" key={key.id}>
                                            <div className="apiKeyInfo">
                                                <h4>{key.name}</h4>
                                                <div className="apiKeyMeta">
                                                    <div>Key: {key.key}</div>
                                                    <div>Created: {key.created} • Last Used: {key.lastUsed}</div>
                                                </div>
                                            </div>
                                            <div className="apiKeyActions">
                                                <button className="btn btnSecondary">Regenerate</button>
                                                <button 
                                                    className="btn btnSecondary" 
                                                    onClick={() => handleDeleteKey(key.id)}
                                                    style={{ color: 'var(--color-error)' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="formActions" style={{ marginTop: '2rem' }}>
                                    <button className="btn btnPrimary">
                                        <Icons.Plus />
                                        Create New API Key
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Team Settings */}
                    {activeSection === 'team' && (
                        <div className="settingsSection">
                            <h3>Team Members</h3>
                            <p>Manage team member access and permissions.</p>
                        </div>
                    )}
                    
                    {/* Security Settings */}
                    {activeSection === 'security' && (
                        <div className="settingsSection">
                            <h3>Security Settings</h3>
                            <p>Configure security policies and authentication settings.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
