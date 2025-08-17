import { useState } from "react";
import "./Settings.css";

// Icon components for consistent styling
interface IconProps {
    size?: number;
    color?: string;
}

const Icons = {
    Settings: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    ),
    Shield: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    ),
    Bell: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    ),
    Key: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
    ),
    Database: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
    ),
    AlertTriangle: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    Save: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
    ),
    RefreshCw: ({ size = 18, color = "currentColor" }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    )
};

export default function Settings() {
    const [riskThresholds, setRiskThresholds] = useState({
        low: 30,
        medium: 60,
        high: 80
    });
    
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        webhook: true
    });

    const [apiSettings, setApiSettings] = useState({
        rateLimit: 1000,
        timeout: 30
    });

    return (
        <div className="settings_container">
            {/* Dashboard header */}
            <header className="settings_header">
                <h1>Fraud Detection Settings</h1>
                <div className="settings_header_actions">
                    <button className="settings_save_button">
                        <Icons.Save size={16} />
                        Save Changes
                    </button>
                </div>
            </header>

            <div className="settings_dashboard">
                <div className="settings_dashboard_wrapper">
                    {/* Settings Overview Cards */}
                    <section className="settings_overview_section">
                        <div className="settings_overview_grid">
                            <div className="settings_overview_card active">
                                <div className="settings_overview_icon">
                                    <Icons.Shield size={24} />
                                </div>
                                <div className="settings_overview_content">
                                    <h3>Risk Thresholds</h3>
                                    <p>Configure detection sensitivity</p>
                                </div>
                            </div>
                            
                            <div className="settings_overview_card">
                                <div className="settings_overview_icon">
                                    <Icons.Bell size={24} />
                                </div>
                                <div className="settings_overview_content">
                                    <h3>Notifications</h3>
                                    <p>Alert preferences and channels</p>
                                </div>
                            </div>
                            
                            <div className="settings_overview_card">
                                <div className="settings_overview_icon">
                                    <Icons.Key size={24} />
                                </div>
                                <div className="settings_overview_content">
                                    <h3>API Access</h3>
                                    <p>Integration and security settings</p>
                                </div>
                            </div>
                            
                            <div className="settings_overview_card">
                                <div className="settings_overview_icon">
                                    <Icons.Database size={24} />
                                </div>
                                <div className="settings_overview_content">
                                    <h3>Data Management</h3>
                                    <p>Storage and retention policies</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Risk Thresholds Configuration */}
                    <section className="settings_section">
                        <div className="settings_section_header">
                            <h2>Risk Detection Thresholds</h2>
                            <p>Configure the sensitivity levels for fraud detection algorithms</p>
                        </div>
                        
                        <div className="settings_card">
                            <div className="settings_form_grid">
                                <div className="settings_form_group">
                                    <label className="settings_label">
                                        <Icons.Shield size={16} />
                                        Low Risk Threshold
                                    </label>
                                    <div className="settings_input_group">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={riskThresholds.low}
                                            onChange={(e) => setRiskThresholds({...riskThresholds, low: parseInt(e.target.value)})}
                                            className="settings_range"
                                        />
                                        <span className="settings_value">{riskThresholds.low}%</span>
                                    </div>
                                    <p className="settings_description">Transactions below this score are considered low risk</p>
                                </div>
                                
                                <div className="settings_form_group">
                                    <label className="settings_label">
                                        <Icons.AlertTriangle size={16} />
                                        Medium Risk Threshold
                                    </label>
                                    <div className="settings_input_group">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={riskThresholds.medium}
                                            onChange={(e) => setRiskThresholds({...riskThresholds, medium: parseInt(e.target.value)})}
                                            className="settings_range"
                                        />
                                        <span className="settings_value">{riskThresholds.medium}%</span>
                                    </div>
                                    <p className="settings_description">Transactions above this score require review</p>
                                </div>
                                
                                <div className="settings_form_group">
                                    <label className="settings_label">
                                        <Icons.AlertTriangle size={16} />
                                        High Risk Threshold
                                    </label>
                                    <div className="settings_input_group">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={riskThresholds.high}
                                            onChange={(e) => setRiskThresholds({...riskThresholds, high: parseInt(e.target.value)})}
                                            className="settings_range"
                                        />
                                        <span className="settings_value">{riskThresholds.high}%</span>
                                    </div>
                                    <p className="settings_description">Transactions above this score are automatically flagged</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notification Settings */}
                    <section className="settings_section">
                        <div className="settings_section_header">
                            <h2>Notification Preferences</h2>
                            <p>Configure how and when you receive fraud alerts</p>
                        </div>
                        
                        <div className="settings_card">
                            <div className="settings_form_grid">
                                <div className="settings_form_group">
                                    <label className="settings_checkbox_label">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                                            className="settings_checkbox"
                                        />
                                        <Icons.Bell size={16} />
                                        Email Notifications
                                    </label>
                                    <p className="settings_description">Receive fraud alerts via email</p>
                                </div>
                                
                                <div className="settings_form_group">
                                    <label className="settings_checkbox_label">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.sms}
                                            onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                                            className="settings_checkbox"
                                        />
                                        <Icons.Bell size={16} />
                                        SMS Notifications
                                    </label>
                                    <p className="settings_description">Receive critical alerts via SMS</p>
                                </div>
                                
                                <div className="settings_form_group">
                                    <label className="settings_checkbox_label">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.webhook}
                                            onChange={(e) => setNotifications({...notifications, webhook: e.target.checked})}
                                            className="settings_checkbox"
                                        />
                                        <Icons.Database size={16} />
                                        Webhook Notifications
                                    </label>
                                    <p className="settings_description">Send alerts to external systems</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* API Settings */}
                    <section className="settings_section">
                        <div className="settings_section_header">
                            <h2>API Configuration</h2>
                            <p>Manage API access and integration settings</p>
                        </div>
                        
                        <div className="settings_card">
                            <div className="settings_form_grid">
                                <div className="settings_form_group">
                                    <label className="settings_label">
                                        <Icons.Key size={16} />
                                        API Rate Limit (requests/hour)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={apiSettings.rateLimit}
                                        onChange={(e) => setApiSettings({...apiSettings, rateLimit: parseInt(e.target.value)})}
                                        className="settings_input"
                                        min="100"
                                        max="10000"
                                    />
                                    <p className="settings_description">Maximum API requests per hour</p>
                                </div>
                                
                                <div className="settings_form_group">
                                    <label className="settings_label">
                                        <Icons.RefreshCw size={16} />
                                        Request Timeout (seconds)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={apiSettings.timeout}
                                        onChange={(e) => setApiSettings({...apiSettings, timeout: parseInt(e.target.value)})}
                                        className="settings_input"
                                        min="5"
                                        max="300"
                                    />
                                    <p className="settings_description">API request timeout duration</p>
                                </div>
                                
                                <div className="settings_form_group">
                                    <label className="settings_label">
                                        <Icons.Key size={16} />
                                        API Key Management
                                    </label>
                                    <div className="settings_api_key_section">
                                        <input 
                                            type="password" 
                                            value="sk-1234567890abcdef"
                                            readOnly
                                            className="settings_input"
                                        />
                                        <button className="settings_regenerate_button">
                                            <Icons.RefreshCw size={16} />
                                            Regenerate
                                        </button>
                                    </div>
                                    <p className="settings_description">Your current API key for external integrations</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* System Status */}
                    <section className="settings_section">
                        <div className="settings_section_header">
                            <h2>System Status</h2>
                            <p>Current system health and performance metrics</p>
                        </div>
                        
                        <div className="settings_status_grid">
                            <div className="settings_status_card healthy">
                                <div className="settings_status_indicator"></div>
                                <div className="settings_status_content">
                                    <h4>Detection Engine</h4>
                                    <span className="settings_status_value">Operational</span>
                                </div>
                            </div>
                            
                            <div className="settings_status_card healthy">
                                <div className="settings_status_indicator"></div>
                                <div className="settings_status_content">
                                    <h4>API Service</h4>
                                    <span className="settings_status_value">99.9% Uptime</span>
                                </div>
                            </div>
                            
                            <div className="settings_status_card warning">
                                <div className="settings_status_indicator"></div>
                                <div className="settings_status_content">
                                    <h4>Database</h4>
                                    <span className="settings_status_value">High Load</span>
                                </div>
                            </div>
                            
                            <div className="settings_status_card healthy">
                                <div className="settings_status_indicator"></div>
                                <div className="settings_status_content">
                                    <h4>Notifications</h4>
                                    <span className="settings_status_value">Active</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
