
export default function Settings() {
    return (
        <div className="container" style={{ display: "grid", gap: 16 }}>
            <h2 style={{ marginTop: 0 }}>Settings</h2>
            <div className="card" style={{ padding: 16 }}>
                <p className="text-muted">General configuration for risk thresholds, alerting and API keys will live here.</p>
                <ul>
                    <li>Risk Thresholds</li>
                    <li>Notification Channels</li>
                    <li>API Access</li>
                </ul>
            </div>
        </div>
    );
}
