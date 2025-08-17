import "./Settings.css";

export default function Settings() {
    return (
        <div className="settings_page container">
            <h2 className="settings_title">Settings</h2>
            <div className="settings_card card">
                <p className="settings_intro text-muted">General configuration for risk thresholds, alerting and API keys will live here.</p>
                <ul className="settings_list">
                    <li>Risk Thresholds</li>
                    <li>Notification Channels</li>
                    <li>API Access</li>
                </ul>
            </div>
        </div>
    );
}
