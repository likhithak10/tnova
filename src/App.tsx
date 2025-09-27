import { useState } from 'react'
import './App.css'

// Import page components
import HomePage from './pages/HomePage'
import InventoryPage from './pages/InventoryPage'
import CommunityPage from './pages/CommunityPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import NotificationsPage from './pages/NotificationsPage'

type Page = 'home' | 'inventory' | 'community' | 'stats' | 'settings' | 'notifications'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'inventory':
        return <InventoryPage />
      case 'community':
        return <CommunityPage />
      case 'stats':
        return <StatsPage />
      case 'settings':
        return <SettingsPage />
      case 'notifications':
        return <NotificationsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="phone-frame">
      <div className="app">
        <div className="app-header">
          <div className="header-top">
            <div className="app-branding">
              <span className="kawaii-icon">🍓</span>
              <h1 className="app-title">Cook-e-Nova</h1>
            </div>
            <div className="header-actions">
              <div
                className="notification-badge"
                onClick={() => setCurrentPage('notifications')}
              >
                <span className="bell-icon">🔔</span>
                <span className="badge-count">3</span>
              </div>
              <span
                className="settings-icon"
                onClick={() => setCurrentPage('settings')}
              >⚙️</span>
            </div>
          </div>
          <p className="app-subtitle">Smart Grocery Companion</p>
        </div>

        <main className="app-content">
          {renderPage()}
        </main>

        <nav className="bottom-nav">
          <button
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <span className="nav-icon">📸</span>
            <span className="nav-label">Scan</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
            onClick={() => setCurrentPage('inventory')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Inventory</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'community' ? 'active' : ''}`}
            onClick={() => setCurrentPage('community')}
          >
            <span className="nav-icon">🤝</span>
            <span className="nav-label">Share</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentPage('stats')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Stats</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default App
