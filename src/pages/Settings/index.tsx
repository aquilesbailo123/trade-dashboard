import "./Settings.css";

export default function Settings() {
    return (
        <div className="settingsPage container">
            <h2 className="settingsTitle">Settings</h2>
            <div className="settingsCard card">
                <p className="settingsIntro text-muted">General configuration for risk thresholds, alerting and API keys will live here.</p>
                <ul className="settingsList">
                    <li>Risk Thresholds</li>
                    <li>Notification Channels</li>
                    <li>API Access</li>
                </ul>
            </div>
        </div>
    );
}
