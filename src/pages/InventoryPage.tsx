import { useState } from 'react'

interface GroceryItem {
  id: string
  name: string
  category: string
  expiryDate: string
  status: 'fresh' | 'expiring-soon' | 'expired'
  emoji: string
}

const InventoryPage = () => {
  const [items] = useState<GroceryItem[]>([
    {
      id: '1',
      name: 'Fresh Strawberries',
      category: 'Fruits',
      expiryDate: '2024-01-15',
      status: 'expiring-soon',
      emoji: '🍓'
    },
    {
      id: '2',
      name: 'Organic Spinach',
      category: 'Vegetables',
      expiryDate: '2024-01-20',
      status: 'fresh',
      emoji: '🥬'
    },
    {
      id: '3',
      name: 'Greek Yogurt',
      category: 'Dairy',
      expiryDate: '2024-01-12',
      status: 'expired',
      emoji: '🥛'
    },
    {
      id: '4',
      name: 'Whole Grain Bread',
      category: 'Bakery',
      expiryDate: '2024-01-18',
      status: 'fresh',
      emoji: '🍞'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'fresh' | 'expiring-soon' | 'expired'>('all')

  const filteredItems = items.filter(item =>
    filter === 'all' || item.status === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'var(--matcha-green)'
      case 'expiring-soon': return '#ffa726'
      case 'expired': return '#ef5350'
      default: return 'var(--warm-gray)'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fresh': return 'Fresh'
      case 'expiring-soon': return 'Expiring Soon'
      case 'expired': return 'Expired'
      default: return 'Unknown'
    }
  }

  return (
    <div className="inventory-page">
      <div className="kawaii-card">
        <h2>🥬 Your Grocery Inventory</h2>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>
          <button
            className={`filter-btn ${filter === 'fresh' ? 'active' : ''}`}
            onClick={() => setFilter('fresh')}
          >
            Fresh
          </button>
          <button
            className={`filter-btn ${filter === 'expiring-soon' ? 'active' : ''}`}
            onClick={() => setFilter('expiring-soon')}
          >
            Expiring Soon
          </button>
          <button
            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired
          </button>
        </div>
      </div>

      <div className="items-list">
        {filteredItems.map(item => (
          <div key={item.id} className="kawaii-list-item inventory-item">
            <div className="item-header">
              <span className="item-emoji">{item.emoji}</span>
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="item-category">{item.category}</p>
              </div>
              <div
                className="status-badge"
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {getStatusText(item.status)}
              </div>
            </div>

            <div className="item-details">
              <p className="expiry-date">
                📅 Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </p>

              {item.status === 'expiring-soon' && (
                <div className="expiry-warning">
                  ⚠️ Use this item soon!
                </div>
              )}

              {item.status === 'expired' && (
                <div className="expired-warning">
                  🚫 This item has expired
                </div>
              )}
            </div>

            <div className="item-actions">
              <button className="action-btn use-btn">✅ Use Now</button>
              <button className="action-btn share-btn">🤝 Share</button>
              <button className="action-btn remove-btn">🗑️ Remove</button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="kawaii-card empty-state">
          <div className="empty-icon">📦</div>
          <h3>No items found</h3>
          <p>Try adjusting your filter or add some groceries!</p>
        </div>
      )}

      <div className="kawaii-card">
        <h3>📊 Quick Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{items.filter(i => i.status === 'fresh').length}</span>
            <span className="stat-label">Fresh Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{items.filter(i => i.status === 'expiring-soon').length}</span>
            <span className="stat-label">Expiring Soon</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{items.filter(i => i.status === 'expired').length}</span>
            <span className="stat-label">Expired</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage
