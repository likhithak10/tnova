import { useState } from 'react'

interface SharedItem {
  id: string
  name: string
  description: string
  expiryDate: string
  sharedBy: string
  status: 'available' | 'claimed' | 'expired'
  emoji: string
  distance: string
}

const CommunityPage = () => {
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([
    {
      id: '1',
      name: 'Fresh Basil',
      description: 'Organic basil from my garden, perfect for pesto!',
      expiryDate: '2024-01-16',
      sharedBy: 'Sarah 🌿',
      status: 'available',
      emoji: '🌿',
      distance: '0.2 miles'
    },
    {
      id: '2',
      name: 'Extra Tomatoes',
      description: 'Bought too many tomatoes for my recipe. Still fresh!',
      expiryDate: '2024-01-18',
      sharedBy: 'Mike 🍅',
      status: 'available',
      emoji: '🍅',
      distance: '0.5 miles'
    },
    {
      id: '3',
      name: 'Leftover Bread',
      description: 'Whole grain bread, half loaf remaining',
      expiryDate: '2024-01-14',
      sharedBy: 'Emma 🍞',
      status: 'claimed',
      emoji: '🍞',
      distance: '0.3 miles'
    },
    {
      id: '4',
      name: 'Fresh Herbs Bundle',
      description: 'Mixed herbs: parsley, cilantro, and dill',
      expiryDate: '2024-01-20',
      sharedBy: 'Alex 🌱',
      status: 'available',
      emoji: '🌿',
      distance: '0.8 miles'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('available')

  const filteredItems = sharedItems.filter(item => 
    filter === 'all' || item.status === filter
  )

  const handleClaimItem = (itemId: string) => {
    setSharedItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'claimed' as const }
          : item
      )
    )
  }

  const handleShareItem = () => {
    const itemName = prompt('What item would you like to share?')
    const description = prompt('Add a description:')
    if (itemName && description) {
      const newItem: SharedItem = {
        id: Date.now().toString(),
        name: itemName,
        description,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sharedBy: 'You 👤',
        status: 'available',
        emoji: '🛍️',
        distance: '0.0 miles'
      }
      setSharedItems([newItem, ...sharedItems])
    }
  }

  return (
    <div className="community-page">
      <div className="kawaii-card">
        <h2>🤝 Community Sharing</h2>
        <p>Share your extra groceries with neighbors and reduce food waste together!</p>
        
        <button 
          className="kawaii-button"
          onClick={handleShareItem}
        >
          ➕ Share an Item
        </button>
      </div>

      <div className="kawaii-card">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available
          </button>
          <button 
            className={`filter-btn ${filter === 'claimed' ? 'active' : ''}`}
            onClick={() => setFilter('claimed')}
          >
            My Claims
          </button>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>
        </div>
      </div>

      <div className="shared-items">
        {filteredItems.map(item => (
          <div key={item.id} className="kawaii-list-item shared-item">
            <div className="item-header">
              <span className="item-emoji">{item.emoji}</span>
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="shared-by">Shared by {item.sharedBy}</p>
                <p className="distance">📍 {item.distance} away</p>
              </div>
              <div className={`status-badge ${item.status}`}>
                {item.status === 'available' ? 'Available' : 'Claimed'}
              </div>
            </div>
            
            <p className="item-description">{item.description}</p>
            
            <div className="item-details">
              <p className="expiry-date">
                📅 Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </p>
            </div>

            {item.status === 'available' && (
              <div className="item-actions">
                <button 
                  className="action-btn claim-btn"
                  onClick={() => handleClaimItem(item.id)}
                >
                  🤝 Claim This Item
                </button>
                <button className="action-btn message-btn">
                  💬 Message {item.sharedBy.split(' ')[0]}
                </button>
              </div>
            )}

            {item.status === 'claimed' && (
              <div className="claimed-info">
                <span className="claimed-badge">✅ Claimed by you!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="kawaii-card empty-state">
          <div className="empty-icon">🤝</div>
          <h3>No items found</h3>
          <p>Be the first to share an item with your community!</p>
        </div>
      )}

      <div className="kawaii-card">
        <h3>🌱 Community Impact</h3>
        <div className="impact-stats">
          <div className="impact-item">
            <span className="impact-number">12</span>
            <span className="impact-label">Items Shared</span>
          </div>
          <div className="impact-item">
            <span className="impact-number">8</span>
            <span className="impact-label">Items Claimed</span>
          </div>
          <div className="impact-item">
            <span className="impact-number">5.2kg</span>
            <span className="impact-label">Food Saved</span>
          </div>
        </div>
        
        <div className="sustainability-badge">
          🌍 You've helped reduce food waste in your community!
        </div>
      </div>

      <div className="kawaii-card">
        <h3>💡 Sharing Tips</h3>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-emoji">📸</span>
            <p>Take a clear photo of the item</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">⏰</span>
            <p>Share items before they expire</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">🤝</span>
            <p>Be responsive to claim requests</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityPage
