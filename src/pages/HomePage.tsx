import { useState, useRef } from 'react'
import { TrashIcon } from '../components/Icons'

const HomePage = () => {
    const [isScanning, setIsScanning] = useState(false)
    const [scannedItems, setScannedItems] = useState<string[]>([])
    const [showCamera, setShowCamera] = useState(false)
    const [showUpload] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newItemName, setNewItemName] = useState('')
    const [newItemCategory, setNewItemCategory] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleScanReceipt = () => {
        setShowCamera(true)
    }

    const handleUploadPhoto = () => {
        setShowUpload(true)
        fileInputRef.current?.click()
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setIsScanning(true)
            // Simulate OCR processing
            setTimeout(() => {
                setIsScanning(false)
                setShowUpload(false)
                setScannedItems([
                    '🍓 Fresh Strawberries',
                    '🥬 Organic Spinach',
                    '🥕 Carrots',
                    '🍞 Whole Grain Bread',
                    '🥛 Almond Milk'
                ])
            }, 2000)
        }
    }

    const handleCameraCapture = () => {
        setIsScanning(true)
        // Simulate camera capture and OCR
        setTimeout(() => {
            setIsScanning(false)
            setShowCamera(false)
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
        setShowAddModal(true)
    }

    const handleAddItem = () => {
        if (newItemName.trim()) {
            setScannedItems([...scannedItems, `🛒 ${newItemName}`])
            setNewItemName('')
            setNewItemCategory('')
            setShowAddModal(false)
        }
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setNewItemName('')
        setNewItemCategory('')
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
                    <div className="card-icon">
                        <TrashIcon size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-number">2</div>
                        <div className="card-label">Expiring Soon</div>
                    </div>
                </div>
            </div>

            {/* Items Expiring Soon Section */}
            <div className="expiring-section">
                <div className="section-header">
                    <span className="section-icon">
                        <TrashIcon size={20} />
                    </span>
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
                    <button
                        className="add-item-btn"
                        onClick={handleManualAdd}
                    >
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
                                <p>Processing receipt with OCR...</p>
                                <div className="loading-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        ) : showCamera ? (
                            <div className="camera-modal">
                                <div className="camera-preview">
                                    <div className="camera-overlay">
                                        <div className="scan-frame"></div>
                                        <p>Position receipt within the frame</p>
                                    </div>
                                </div>
                                <div className="camera-controls">
                                    <button
                                        className="camera-btn cancel-btn"
                                        onClick={() => setShowCamera(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="camera-btn capture-btn"
                                        onClick={handleCameraCapture}
                                    >
                                        📸 Capture
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="scan-options">
                                <button
                                    className="kawaii-button scan-button"
                                    onClick={handleScanReceipt}
                                >
                                    📸 Take Photo
                                </button>
                                <button
                                    className="kawaii-button secondary-button"
                                    onClick={handleUploadPhoto}
                                >
                                    📁 Upload Photo
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
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

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Add New Item</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="input-group">
                                <label htmlFor="item-name">Item Name</label>
                                <input
                                    id="item-name"
                                    type="text"
                                    className="kawaii-input"
                                    placeholder="e.g., Fresh Strawberries"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="item-category">Category</label>
                                <select
                                    id="item-category"
                                    className="kawaii-input"
                                    value={newItemCategory}
                                    onChange={(e) => setNewItemCategory(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    <option value="fruits">🍓 Fruits</option>
                                    <option value="vegetables">🥬 Vegetables</option>
                                    <option value="dairy">🥛 Dairy</option>
                                    <option value="meat">🥩 Meat</option>
                                    <option value="bakery">🍞 Bakery</option>
                                    <option value="beverages">🥤 Beverages</option>
                                    <option value="snacks">🍿 Snacks</option>
                                    <option value="other">📦 Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="kawaii-button secondary-button"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="kawaii-button"
                                onClick={handleAddItem}
                                disabled={!newItemName.trim()}
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HomePage
