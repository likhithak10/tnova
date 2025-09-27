import { useState } from 'react'

const HomePage = () => {
    const [isScanning, setIsScanning] = useState(false)
    const [scannedItems, setScannedItems] = useState<string[]>([])

    const handleScanReceipt = () => {
        setIsScanning(true)
        // Simulate scanning process
        setTimeout(() => {
            setIsScanning(false)
            setScannedItems([
                '🍓 Fresh Strawberries',
                '🥬 Organic Spinach',
                '🥕 Carrots',
                '🍞 Whole Grain Bread',
                '🥛 Almond Milk'
            ])
        }, 2000)
    }

    const handleManualAdd = () => {
        const newItem = prompt('Add a new grocery item:')
        if (newItem) {
            setScannedItems([...scannedItems, `🛒 ${newItem}`])
        }
    }

    return (
        <div className="home-page">
            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon">💖</div>
                    <div className="card-content">
                        <div className="card-number">6</div>
                        <div className="card-label">Total Items</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">⭐</div>
                    <div className="card-content">
                        <div className="card-number">2</div>
                        <div className="card-label">Expiring Soon</div>
                    </div>
                </div>
            </div>

            {/* Items Expiring Soon Section */}
            <div className="expiring-section">
                <div className="section-header">
                    <span className="section-icon">⭐</span>
                    <h2 className="section-title">Items Expiring Soon!</h2>
                </div>

                <div className="expiring-items">
                    <div className="expiring-item">
                        <div className="item-icon">🍓</div>
                        <div className="item-info">
                            <div className="item-name">Strawberries</div>
                            <div className="item-location">Fridge</div>
                        </div>
                        <div className="item-status">
                            <div className="expiry-badge">2 days left</div>
                            <button className="share-btn">
                                <span className="share-icon">📤</span>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    <div className="expiring-item">
                        <div className="item-icon">🥑</div>
                        <div className="item-info">
                            <div className="item-name">Avocados</div>
                            <div className="item-location">Counter</div>
                        </div>
                        <div className="item-status">
                            <div className="expiry-badge urgent">Expires Today!</div>
                            <button className="share-btn">
                                <span className="share-icon">📤</span>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Kitchen Inventory Section */}
            <div className="inventory-section">
                <div className="section-header">
                    <h2 className="section-title">My Kitchen Inventory</h2>
                    <button className="add-item-btn">
                        <span className="add-icon">➕</span>
                        <span>Add Item</span>
                    </button>
                </div>

                <div className="inventory-items">
                    <div className="inventory-item">
                        <div className="item-icon">🍓</div>
                        <div className="item-info">
                            <div className="item-name">Strawberries</div>
                            <div className="item-details">Fridge • Qty: 1</div>
                            <div className="quantity-bar">
                                <div className="quantity-fill" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <div className="item-status">
                            <div className="expiry-badge">2 days left</div>
                            <button className="share-btn">
                                <span className="share-icon">📤</span>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scan Receipt Section */}
            <div className="scan-section">
                <div className="kawaii-card">
                    <h3>📸 Scan Your Receipt</h3>
                    <p>Take a photo of your grocery receipt to automatically add items to your inventory!</p>

                    <div className="scan-area">
                        {isScanning ? (
                            <div className="scanning-animation">
                                <div className="camera-icon">📷</div>
                                <p>Scanning receipt...</p>
                                <div className="loading-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="kawaii-button scan-button"
                                onClick={handleScanReceipt}
                            >
                                📸 Scan Receipt
                            </button>
                        )}
                    </div>

                    <div className="manual-add-section">
                        <button
                            className="kawaii-button secondary-button"
                            onClick={handleManualAdd}
                        >
                            ➕ Add Manually
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
