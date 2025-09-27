import { useState } from 'react'

interface SettingsPageProps {
    darkMode: boolean
    toggleDarkMode: () => void
}

const SettingsPage = ({ darkMode, toggleDarkMode }: SettingsPageProps) => {
    const [notifications, setNotifications] = useState(true)
    const [expiryReminders, setExpiryReminders] = useState(true)
    const [communitySharing, setCommunitySharing] = useState(true)

    return (
        <div className="settings-page">
            <div className="kawaii-card">
                <h2>⚙️ Settings</h2>
                <p>Customize your Cook-e-Nova experience</p>
            </div>

            <div className="kawaii-card">
                <h3>🔔 Notifications</h3>
                <div className="setting-item">
                    <div className="setting-info">
                        <h4>Push Notifications</h4>
                        <p>Receive alerts for expiring items</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h4>Expiry Reminders</h4>
                        <p>Get notified 2 days before items expire</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={expiryReminders}
                            onChange={(e) => setExpiryReminders(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="kawaii-card">
                <h3>🤝 Community</h3>
                <div className="setting-item">
                    <div className="setting-info">
                        <h4>Food Sharing</h4>
                        <p>Allow others to see your shared items</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={communitySharing}
                            onChange={(e) => setCommunitySharing(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="kawaii-card">
                <h3>🎨 Appearance</h3>
                <div className="setting-item">
                    <div className="setting-info">
                        <h4>Dark Mode</h4>
                        <p>Switch to dark theme</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={toggleDarkMode}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="kawaii-card">
                <h3>📱 App Info</h3>
                <div className="info-item">
                    <span className="info-label">Version</span>
                    <span className="info-value">1.0.0</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Build</span>
                    <span className="info-value">2024.01.15</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Last Updated</span>
                    <span className="info-value">Today</span>
                </div>
            </div>

            <div className="kawaii-card">
                <h3>🌱 Sustainability</h3>
                <div className="sustainability-stats">
                    <div className="stat-item">
                        <span className="stat-icon">♻️</span>
                        <div className="stat-content">
                            <span className="stat-number">42kg</span>
                            <span className="stat-label">Waste Prevented</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🌍</span>
                        <div className="stat-content">
                            <span className="stat-number">15kg</span>
                            <span className="stat-label">CO₂ Saved</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">💧</span>
                        <div className="stat-content">
                            <span className="stat-number">280L</span>
                            <span className="stat-label">Water Saved</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="kawaii-card">
                <h3>📞 Support</h3>
                <div className="support-actions">
                    <button className="support-btn">
                        <span className="support-icon">📧</span>
                        <span>Contact Support</span>
                    </button>
                    <button className="support-btn">
                        <span className="support-icon">📖</span>
                        <span>Help Center</span>
                    </button>
                    <button className="support-btn">
                        <span className="support-icon">⭐</span>
                        <span>Rate App</span>
                    </button>
                </div>
            </div>

            <div className="kawaii-card danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <button className="danger-btn">
                    <span className="danger-icon">🗑️</span>
                    <span>Delete All Data</span>
                </button>
                <p className="danger-warning">
                    This action cannot be undone. All your inventory and settings will be permanently deleted.
                </p>
            </div>
        </div>
    )
}

export default SettingsPage
