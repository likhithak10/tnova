import { useState } from 'react'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    type: 'expiry' | 'community' | 'achievement' | 'reminder'
    read: boolean
    emoji: string
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Strawberries Expiring Soon!',
            message: 'Your strawberries will expire in 2 days. Consider using them in a smoothie!',
            time: '2 hours ago',
            type: 'expiry',
            read: false,
            emoji: '🍓'
        },
        {
            id: '2',
            title: 'Item Claimed!',
            message: 'Sarah claimed your shared basil. Great job reducing food waste!',
            time: '5 hours ago',
            type: 'community',
            read: false,
            emoji: '🌿'
        },
        {
            id: '3',
            title: 'Achievement Unlocked!',
            message: 'You\'ve shared 10 items this month. You\'re a sustainability champion!',
            time: '1 day ago',
            type: 'achievement',
            read: true,
            emoji: '🏆'
        },
        {
            id: '4',
            title: 'Weekly Reminder',
            message: 'Don\'t forget to scan your grocery receipts to keep your inventory updated.',
            time: '2 days ago',
            type: 'reminder',
            read: true,
            emoji: '📸'
        },
        {
            id: '5',
            title: 'Avocados Expired',
            message: 'Your avocados have expired. Consider composting them instead of throwing away.',
            time: '3 days ago',
            type: 'expiry',
            read: true,
            emoji: '🥑'
        }
    ])

    const [filter, setFilter] = useState<'all' | 'unread' | 'expiry' | 'community'>('all')

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read
        if (filter === 'expiry') return notification.type === 'expiry'
        if (filter === 'community') return notification.type === 'community'
        return true
    })

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(notification =>
            notification.id === id
                ? { ...notification, read: true }
                : notification
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })))
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'expiry': return '#ef5350'
            case 'community': return '#4a7c59'
            case 'achievement': return '#ffa726'
            case 'reminder': return '#42a5f5'
            default: return '#9e9e9e'
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="notifications-page">
            <div className="kawaii-card">
                <div className="notifications-header">
                    <h2>🔔 Notifications</h2>
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                            Mark All Read
                        </button>
                    )}
                </div>
                <p>{unreadCount} unread notifications</p>
            </div>

            <div className="kawaii-card">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'expiry' ? 'active' : ''}`}
                        onClick={() => setFilter('expiry')}
                    >
                        Expiry
                    </button>
                    <button
                        className={`filter-btn ${filter === 'community' ? 'active' : ''}`}
                        onClick={() => setFilter('community')}
                    >
                        Community
                    </button>
                </div>
            </div>

            <div className="notifications-list">
                {filteredNotifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(notification.id)}
                    >
                        <div className="notification-icon">
                            <span className="notification-emoji">{notification.emoji}</span>
                            {!notification.read && <div className="unread-dot"></div>}
                        </div>

                        <div className="notification-content">
                            <div className="notification-header">
                                <h4 className="notification-title">{notification.title}</h4>
                                <span
                                    className="notification-type"
                                    style={{ backgroundColor: getTypeColor(notification.type) }}
                                >
                                    {notification.type}
                                </span>
                            </div>

                            <p className="notification-message">{notification.message}</p>

                            <div className="notification-footer">
                                <span className="notification-time">{notification.time}</span>
                                {!notification.read && (
                                    <button className="mark-read-btn">
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNotifications.length === 0 && (
                <div className="kawaii-card empty-state">
                    <div className="empty-icon">🔔</div>
                    <h3>No notifications</h3>
                    <p>You're all caught up! Check back later for updates.</p>
                </div>
            )}

            <div className="kawaii-card">
                <h3>📱 Notification Settings</h3>
                <div className="notification-settings">
                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Expiry Alerts</h4>
                            <p>Get notified when items are about to expire</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Community Updates</h4>
                            <p>Notifications about shared items and claims</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Achievement Badges</h4>
                            <p>Celebrate your sustainability milestones</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsPage
