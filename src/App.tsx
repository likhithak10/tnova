import { useState, useEffect } from 'react'
import './App.css'

// Import page components
import HomePage from './pages/HomePage'
import InventoryPage from './pages/InventoryPage'
import CommunityPage from './pages/CommunityPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import NotificationsPage from './pages/NotificationsPage'

// Import beautiful SVG icons
import { CameraIcon, BoxIcon, HandIcon, StatsIcon, SettingsIcon, BellIcon } from './components/Icons'

type Page = 'home' | 'inventory' | 'community' | 'stats' | 'settings' | 'notifications'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved dark mode preference or system preference
    const savedDarkMode = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true')
    } else {
      setDarkMode(systemPrefersDark)
    }
  }, [])

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }

    // Save preference
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

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
        return <SettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
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
              <button
                className="notification-badge"
                onClick={() => setCurrentPage('notifications')}
              >
                <BellIcon className="bell-icon" size={18} />
                <span className="badge-count">3</span>
              </button>
              <button
                className="settings-button"
                onClick={() => setCurrentPage('settings')}
              >
                <SettingsIcon className="settings-icon" size={18} />
              </button>
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
            <CameraIcon className="nav-icon" size={20} />
            <span className="nav-label">Scan</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
            onClick={() => setCurrentPage('inventory')}
          >
            <BoxIcon className="nav-icon" size={20} />
            <span className="nav-label">Inventory</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'community' ? 'active' : ''}`}
            onClick={() => setCurrentPage('community')}
          >
            <HandIcon className="nav-icon" size={20} />
            <span className="nav-label">Share</span>
          </button>
          <button
            className={`nav-button ${currentPage === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentPage('stats')}
          >
            <StatsIcon className="nav-icon" size={20} />
            <span className="nav-label">Stats</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default App
