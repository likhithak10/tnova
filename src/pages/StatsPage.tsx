import { useState } from 'react'

interface StatData {
  period: 'week' | 'month' | 'year'
  itemsTracked: number
  itemsExpired: number
  itemsShared: number
  itemsClaimed: number
  moneySaved: number
  wasteReduced: number
}

const StatsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  
  const statsData: Record<string, StatData> = {
    week: {
      period: 'week',
      itemsTracked: 15,
      itemsExpired: 2,
      itemsShared: 3,
      itemsClaimed: 2,
      moneySaved: 25.50,
      wasteReduced: 1.8
    },
    month: {
      period: 'month',
      itemsTracked: 67,
      itemsExpired: 8,
      itemsShared: 12,
      itemsClaimed: 8,
      moneySaved: 89.30,
      wasteReduced: 7.2
    },
    year: {
      period: 'year',
      itemsTracked: 456,
      itemsExpired: 45,
      itemsShared: 78,
      itemsClaimed: 52,
      moneySaved: 456.80,
      wasteReduced: 42.5
    }
  }

  const currentStats = statsData[selectedPeriod]

  const sustainabilityScore = Math.round(
    ((currentStats.itemsTracked - currentStats.itemsExpired) / currentStats.itemsTracked) * 100
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--matcha-green)'
    if (score >= 60) return '#ffa726'
    return '#ef5350'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌱'
    if (score >= 60) return '🌿'
    return '🌱'
  }

  return (
    <div className="stats-page">
      <div className="kawaii-card">
        <h2>📊 Your Sustainability Stats</h2>
        
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            This Week
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            This Month
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="kawaii-card">
        <h3>🌱 Sustainability Score</h3>
        <div className="score-display">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${getScoreColor(sustainabilityScore)} 0deg, ${getScoreColor(sustainabilityScore)} ${sustainabilityScore * 3.6}deg, #e0e0e0 ${sustainabilityScore * 3.6}deg, #e0e0e0 360deg)`
            }}
          >
            <div className="score-inner">
              <span className="score-number">{sustainabilityScore}</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          <div className="score-info">
            <p className="score-emoji">{getScoreEmoji(sustainabilityScore)}</p>
            <p className="score-text">
              {sustainabilityScore >= 80 ? 'Excellent! You\'re a sustainability champion!' :
               sustainabilityScore >= 60 ? 'Good job! Keep up the great work!' :
               'Room for improvement! Every small step counts!'}
            </p>
          </div>
        </div>
      </div>

      <div className="kawaii-card">
        <h3>📈 Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <span className="metric-number">{currentStats.itemsTracked}</span>
              <span className="metric-label">Items Tracked</span>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">💸</div>
            <div className="metric-content">
              <span className="metric-number">${currentStats.moneySaved.toFixed(2)}</span>
              <span className="metric-label">Money Saved</span>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">♻️</div>
            <div className="metric-content">
              <span className="metric-number">{currentStats.wasteReduced}kg</span>
              <span className="metric-label">Waste Reduced</span>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">🤝</div>
            <div className="metric-content">
              <span className="metric-number">{currentStats.itemsShared}</span>
              <span className="metric-label">Items Shared</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kawaii-card">
        <h3>🎯 Achievements</h3>
        <div className="achievements-list">
          <div className="achievement-item earned">
            <span className="achievement-emoji">🌱</span>
            <div className="achievement-content">
              <h4>Green Thumb</h4>
              <p>Tracked 50+ items this month</p>
            </div>
            <span className="achievement-badge">✅</span>
          </div>
          
          <div className="achievement-item earned">
            <span className="achievement-emoji">🤝</span>
            <div className="achievement-content">
              <h4>Community Helper</h4>
              <p>Shared 10+ items with neighbors</p>
            </div>
            <span className="achievement-badge">✅</span>
          </div>
          
          <div className="achievement-item">
            <span className="achievement-emoji">💰</span>
            <div className="achievement-content">
              <h4>Money Saver</h4>
              <p>Save $100+ in a month</p>
            </div>
            <span className="achievement-badge">🔒</span>
          </div>
          
          <div className="achievement-item">
            <span className="achievement-emoji">♻️</span>
            <div className="achievement-content">
              <h4>Waste Warrior</h4>
              <p>Reduce 20kg of waste in a month</p>
            </div>
            <span className="achievement-badge">🔒</span>
          </div>
        </div>
      </div>

      <div className="kawaii-card">
        <h3>🌍 Environmental Impact</h3>
        <div className="impact-visualization">
          <div className="impact-item">
            <div className="impact-icon">🌱</div>
            <div className="impact-content">
              <span className="impact-number">{Math.round(currentStats.wasteReduced * 2.5)}</span>
              <span className="impact-label">CO₂ kg saved</span>
            </div>
          </div>
          
          <div className="impact-item">
            <div className="impact-icon">💧</div>
            <div className="impact-content">
              <span className="impact-number">{Math.round(currentStats.wasteReduced * 15)}</span>
              <span className="impact-label">Liters of water saved</span>
            </div>
          </div>
          
          <div className="impact-item">
            <div className="impact-icon">🌍</div>
            <div className="impact-content">
              <span className="impact-number">{Math.round(currentStats.wasteReduced * 0.3)}</span>
              <span className="impact-label">Trees equivalent</span>
            </div>
          </div>
        </div>
        
        <div className="sustainability-badge">
          🌟 You're making a real difference for our planet!
        </div>
      </div>

      <div className="kawaii-card">
        <h3>📅 Weekly Goals</h3>
        <div className="goals-list">
          <div className="goal-item">
            <span className="goal-emoji">📸</span>
            <div className="goal-content">
              <h4>Scan 3 receipts</h4>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '66%' }}></div>
                </div>
                <span className="progress-text">2/3</span>
              </div>
            </div>
          </div>
          
          <div className="goal-item">
            <span className="goal-emoji">🤝</span>
            <div className="goal-content">
              <h4>Share 2 items</h4>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '50%' }}></div>
                </div>
                <span className="progress-text">1/2</span>
              </div>
            </div>
          </div>
          
          <div className="goal-item">
            <span className="goal-emoji">♻️</span>
            <div className="goal-content">
              <h4>Reduce waste by 2kg</h4>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <span className="progress-text">1.5/2kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPage
