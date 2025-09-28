import { useEffect, useRef, useState } from 'react'
import './App.css'
import { app, login, registerOrLogin, logout } from './lib/auth'
import { Api } from './lib/api'

function App() {
  const [authed, setAuthed] = useState(!!app.currentUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [notifOffersCount, setNotifOffersCount] = useState(0)
  const [notifRemindersCount, setNotifRemindersCount] = useState(0)
  const [showReminders, setShowReminders] = useState(false)
  const [tab, setTab] = useState<'scan'|'inventory'|'share'>('scan')
  const [inventoryReloadKey, setInventoryReloadKey] = useState(0)
  // Expose a helper for child to switch to inventory and reload
  ;(window as any).__switchToInventory = () => { setTab('inventory'); setInventoryReloadKey((k: number)=>k+1) }

  const refreshNotifCounts = async () => {
    try {
      if (!authed) return;
      const currentId = app.currentUser?.id || null;
      const feed = await Api.notificationsFeed();
      const notifs = (feed?.notifications || []);
      const offers = notifs.filter((n:any)=> n.type === 'offer_created' && !n.seen && n?.payload?.ownerId && currentId && String(n.payload.ownerId) !== String(currentId));
      const reminders = notifs.filter((n:any)=> n.type === 'expiry_soon' && !n.seen);
      setNotifOffersCount(offers.length);
      setNotifRemindersCount(reminders.length);
      setNotifCount(offers.length + reminders.length);
    } catch {}
  }

  return (
    <div className="viewport-center">
      <div className="device">
        <div className="topbar">
          <div className="brand">
            <img src="/app-logo.png" alt="Cookenova" width={36} height={36} style={{ borderRadius: 8 }} />
            <span className="brand-title">Cookenova</span>
          </div>
          <div className="spacer" />
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" title="Notifications" onClick={async()=>{ const next = !notifOpen; setNotifOpen(next); if (next) { await refreshNotifCounts(); } }}>
              <img src="/notification-logo.png" alt="Notifications" width={18} height={18} />
            </button>
            {authed && notifCount > 0 ? <span className="badge">{notifCount}</span> : null}
            {notifOpen && (
              <div className="menu-pop" onClick={(e)=>e.stopPropagation()}>
                <div className="menu-title">Notifications</div>
                <div className="menu-actions">
                  <button className="btn" onClick={async()=>{ 
                    try {
                      const feed = await Api.notificationsFeed();
                      const ids = (feed.notifications || []).filter((n:any)=> n.type==='offer_created').map((n:any)=> String(n._id));
                      if (ids.length) await Api.markNotificationsSeen(ids);
                    } catch {}
                    setTab('share'); setNotifOpen(false); await refreshNotifCounts();
                  }}>Offers{notifOffersCount>0?` (${notifOffersCount})`:''}</button>
                  <button className="btn" onClick={async()=>{ 
                    try {
                      const feed = await Api.notificationsFeed();
                      const ids = (feed.notifications || []).filter((n:any)=> n.type==='expiry_soon').map((n:any)=> String(n._id));
                      if (ids.length) await Api.markNotificationsSeen(ids);
                    } catch {}
                    setTab('inventory'); setNotifOpen(false); await refreshNotifCounts();
                  }}>Reminders{notifRemindersCount>0?` (${notifRemindersCount})`:''}</button>
                </div>
              </div>
            )}
          </div>
          <button className="icon-btn" title="Settings" onClick={()=>setMenuOpen((v)=>!v)}>
            <img src="/settings-logo.png" alt="Settings" width={18} height={18} />
          </button>
          {menuOpen && (
            <div className="menu-pop" onClick={(e)=>e.stopPropagation()}>
              <div className="menu-title">Settings</div>
              <div className="menu-actions">
                {authed ? (
                  <button className="btn" onClick={async ()=>{ await logout(); setAuthed(false); setMenuOpen(false); setNotifCount(0); setNotifOffersCount(0); setNotifRemindersCount(0); }}>Logout</button>
                ) : (
                  <span style={{ color: '#8a9b7a', padding: '6px 8px' }}>Not signed in</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="device-content" onClick={()=>{ if (menuOpen) setMenuOpen(false); if (notifOpen) setNotifOpen(false) }}>
          {!authed ? (
            <Login onAuthed={() => setAuthed(true)} />
          ) : (
          <>
            {tab === 'scan' ? (
              <>
                <div className="card welcome-card">
                  <div className="welcome-media">
                    <img src="/welcome-back-logo.jpg" alt="Welcome" />
                  </div>
                  <div>
                    <h3>Welcome back!</h3>
                    <p>Reduce food waste together &lt;3</p>
                  </div>
                </div>

                <ScannerCard isAuthed={authed} showReminders={showReminders} clearReminders={()=>setShowReminders(false)} setNotificationCounts={(o)=>{ setNotifOffersCount(o.offers); setNotifRemindersCount(o.reminders); setNotifCount(o.offers + o.reminders); }} />
              </>
            ) : null}
            {tab === 'inventory' ? (
              <InventoryList isAuthed={authed} reloadKey={inventoryReloadKey} />
            ) : null}
          {tab === 'share' ? (
            <ShareBoard />
          ) : null}
          </>
          )}
        </div>

        <nav className="tabbar">
          <button className={`tab-item ${tab === 'scan' ? 'active' : ''}`} title="Scan" onClick={()=>setTab('scan')}>
            <i className="icon scan" />
            <span className="label">Scan</span>
          </button>
          <button className={`tab-item ${tab === 'inventory' ? 'active' : ''}`} title="Inventory" onClick={()=>setTab('inventory')}>
            <i className="icon inventory" />
            <span className="label">Inventory</span>
          </button>
          <button className={`tab-item ${tab === 'share' ? 'active' : ''}`} title="Share" onClick={()=>setTab('share')}>
            <i className="icon share" />
            <span className="label">Share</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

function ScannerCard({ isAuthed, showReminders, clearReminders, setNotificationCounts }: { isAuthed: boolean; showReminders?: boolean; clearReminders?: () => void; setNotificationCounts?: (x: { offers: number; reminders: number }) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reminders, setReminders] = useState<Array<{ displayName: string; expiryDate?: string | null }>>([])
  const onPick = () => fileRef.current?.click()
  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }
  const onSave = async () => {
    if (!isAuthed) { setMessage('Please login first'); return }
    if (!preview) { setMessage('Upload a photo first'); return }
    setLoading(true); setMessage(null)
    try {
      const parsed = await Api.parseReceipt([preview])
      const res = await Api.saveReceipt(parsed, [preview])
      setMessage(`Saved ${res.itemsCreated} items`)
    } catch (e: any) {
      setMessage(e?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }
  // Load notifications counts and reminders list
  const loadNotifications = async () => {
    try {
      if (!isAuthed) {
        if (setNotificationCounts) setNotificationCounts({ offers: 0, reminders: 0 });
        setReminders([]);
        return;
      }
      const currentId = app.currentUser?.id || null;
      const [offersRes, soonRes] = await Promise.all([
        Api.listOffers(),
        Api.itemsSoonExpiring(3)
      ]);
      const offers = (offersRes?.offers || []).filter((o:any)=>{
        const owner = o?.item?.ownerId ? String(o.item.ownerId) : null;
        return !o?.claimedBy && owner && currentId && owner !== currentId;
      });
      const soon = soonRes?.items || [];
      if (setNotificationCounts) setNotificationCounts({ offers: offers.length, reminders: soon.length });
      setReminders(soon.map((it:any)=>({ displayName: it.displayName, expiryDate: it.expiryDate || null })));
    } catch {}
  }
  useEffect(() => { loadNotifications(); }, [isAuthed])
  // scanner still loads soon/offer counts for the badge when on Scan
  return (
    <div className="card scanner-card">
      <h4><img src="/receipt-icon.png" alt="Scan" width={28} height={28} /> Receipt Scanner</h4>
      <p>Take a photo of your receipt</p>
      <div className="preview-box" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        {preview ? (
          <img src={preview} alt="preview" />
        ) : (
          <img src="/receipt-upload-logo.png" alt="placeholder" />
        )}
      </div>
      {showReminders && reminders.length > 0 ? (
        <div style={{ marginTop: 10 }}>
          {reminders.map((r, idx) => {
            const exp = r.expiryDate ? new Date(r.expiryDate) : null
            const expStr = exp ? exp.toISOString().slice(0,10) : '—'
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 12px', marginTop: 6 }}>
                <span>{r.displayName}</span>
                <span style={{ color: '#8a9b7a' }}>{expStr}</span>
              </div>
            )
          })}
          <div className="actions actions-center" style={{ marginTop: 8 }}>
            <button className="btn" onClick={clearReminders}>Close</button>
          </div>
        </div>
      ) : null}
      <div className="actions actions-center" style={{ justifyContent: 'center' }}>
        <button className="btn" disabled>Take Photo</button>
        <button className="btn" onClick={onPick}>Upload</button>
        <button className="btn primary" onClick={onSave} disabled={loading || !preview || !isAuthed}>{loading ? 'Saving…' : 'Save'}</button>
        <input ref={fileRef} className="sr-only" type="file" accept="image/*" onChange={(e)=>onFiles(e.target.files)} />
      </div>
      {message ? <p style={{ color: '#8a9b7a', marginTop: 8 }}>{message}</p> : null}
      {!isAuthed ? <p style={{ color: '#8a9b7a', marginTop: 8 }}>Login to save scanned items.</p> : null}
    </div>
  )
}

function Login({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const summarizeError = (raw: any): string => {
    const msg = String(raw?.message || '').toLowerCase()
    if (!email.includes('@')) return 'Please enter a valid email address.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    if (msg.includes('name already in use') || msg.includes('409')) return 'Account already exists. Please login.'
    if (msg.includes('invalid') && msg.includes('credentials')) return 'Incorrect email or password. Please try again.'
    if (msg.includes('unauthorized') || msg.includes('401')) return 'Incorrect email or password. Please try again.'
    return 'Something went wrong. Please try again.'
  }

  const doLogin = async () => {
    setError(null)
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try { await login(email, password); onAuthed() }
    catch (e: any) { setError(summarizeError(e)); setEmail(''); setPassword('') }
    finally { setLoading(false) }
  }
  const doRegister = async () => {
    setError(null)
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try { await registerOrLogin(email, password); onAuthed() }
    catch (e: any) { setError(summarizeError(e)); setEmail(''); setPassword('') }
    finally { setLoading(false) }
  }

  return (
    <div className="card" style={{ marginTop: 6 }}>
      <h3 style={{ marginTop: 0, color: '#e07ea6' }}>Welcome to Cookenova</h3>
      <div className="field" style={{ marginTop: 8 }}>
        <label>Email</label>
        <input className="input" placeholder="Enter email here" value={email} onChange={(e)=>setEmail(e.target.value)} />
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label>Password</label>
        <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} />
      </div>
      {error ? <p style={{ color: '#d66', marginTop: 8 }}>{error}</p> : null}
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn full" onClick={doLogin} disabled={loading}>{loading ? 'Loading…' : 'Login'}</button>
        <button className="btn primary full" onClick={doRegister} disabled={loading}>Register</button>
      </div>
    </div>
  )
}

function InventoryList({ isAuthed, reloadKey }: { isAuthed: boolean; reloadKey?: number }) {
  const [items, setItems] = useState<Array<{ id: string | null; displayName: string; expiryDate?: string | Date | null; offered?: boolean }>>([])
  const [soon, setSoon] = useState<Array<{ id: string | null; displayName: string; expiryDate?: string | Date | null }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offeringId, setOfferingId] = useState<string | null>(null)
  const [offeringSoonId, setOfferingSoonId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const currentUserId = app.currentUser?.id || null

  const load = async () => {
    if (!isAuthed) return
    setLoading(true); setError(null)
    try {
      const [soonRes, itemsRes, offersRes] = await Promise.all([
        Api.itemsSoonExpiring(3),
        Api.itemsList(''),
        Api.listOffers(),
      ])

      const offeredItemIds = new Set(
        ((offersRes?.offers || [])
          .filter((o:any)=> {
            const ownerId = o?.item?.ownerId || o?.owner?.id || null
            return currentUserId && ownerId ? String(ownerId) === String(currentUserId) : false
          })
          .map((o:any)=>{
            const id = o?.item?._id || o?.itemId || null
            return id ? String(id) : null
          })
          .filter(Boolean)) as string[]
      )

      const soonMappedRaw = (soonRes.items || []).map((it:any)=>({ id: it._id ? String(it._id) : null, displayName: it.displayName, expiryDate: it.expiryDate ?? null }))
      const soonMapped = soonMappedRaw.filter((it)=> it.id ? !offeredItemIds.has(it.id) : true)
      setSoon(soonMapped)

      const soonIds = new Set(soonMapped.map((x)=>x.id).filter(Boolean) as string[])
      const mappedAll = (itemsRes.items || []).map((it:any) => {
        const id = it._id ? String(it._id) : null
        return ({ id, displayName: it.displayName, expiryDate: it.expiryDate ?? null, offered: id ? offeredItemIds.has(id) : false })
      })
      const mapped = mappedAll.filter((it)=> {
        const notSoon = it.id ? !soonIds.has(it.id) : true
        const notOffered = it.id ? !offeredItemIds.has(it.id) : true
        return notSoon && notOffered
      })
      setItems(mapped)
    } catch (e: any) {
      setError(e?.message || 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  // load once when entering Inventory
  useEffect(() => {
    if (isAuthed && !initialized) {
      setInitialized(true)
      load()
    }
  }, [isAuthed, initialized])

  // Reload when parent bumps the key (e.g., after claiming an offer)
  useEffect(() => {
    if (isAuthed && reloadKey != null) {
      load()
    }
  }, [reloadKey])

  return (
    <div style={{ marginTop: 6 }}>
      <h2>Inventory</h2>
      {!isAuthed ? <p style={{ color: '#8a9b7a' }}>Login to view your items.</p> : null}
      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: '#d66' }}>{error}</p> : null}
      {message ? <p style={{ color: '#8a9b7a' }}>{message}</p> : null}

      {soon.length > 0 ? (
        <div className="card" style={{ marginTop: 8 }}>
          <h4>Expiry Soon</h4>
    <div>
            {soon.map((it, idx) => {
              const exp = it.expiryDate ? new Date(it.expiryDate) : null
              const expStr = exp ? exp.toISOString().slice(0,10) : '—'
              return (
                <div key={(it.id || String(idx))} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{it.displayName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#8a9b7a' }}>{expStr}</span>
                    <button className="btn" disabled={!it.id || offeringSoonId === it.id} onClick={async ()=>{
                      if (!it.id) return
                      setOfferingSoonId(it.id)
                      // Optimistically remove from list
                      setSoon((arr)=>arr.filter((x)=>x.id !== it.id))
                      try { await Api.createOffer(it.id, 1); setMessage('Offer created') }
                      catch (e:any) { setMessage(e?.message || 'Failed to create offer'); await load() }
                      finally { setOfferingSoonId(null) }
                    }}>{offeringSoonId === it.id ? 'Offering…' : 'Offer'}</button>
                  </div>
                </div>
              )
            })}
      </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 8 }}>
        <h4>Other Items</h4>
        {!loading && items.length === 0 && isAuthed ? <p style={{ color: '#8a9b7a' }}>No items yet.</p> : null}
        <div>
              {items.map((it, idx) => (
            <div key={(it.id || String(idx))} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{it.displayName}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn" disabled={!it.id || offeringId === it.id || it.offered} onClick={async ()=>{
                  if (!it.id) { setMessage('Cannot offer this item'); return }
                  setOfferingId(it.id); setMessage(null)
                  // Optimistically remove from list so it disappears immediately
                  setItems((arr)=>arr.filter((row)=> row.id !== it.id))
                  try {
                    await Api.createOffer(it.id, 1);
                    setMessage('Offer created');
                  }
                  catch (e:any) { setMessage(e?.message || 'Failed to create offer'); await load() }
                  finally { setOfferingId(null) }
                }}>{offeringId === it.id ? 'Offering…' : (it.offered ? 'Offered' : 'Offer')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

function ShareBoard() {
  const [offers, setOffers] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const currentUserId = app.currentUser?.id || null

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await Api.listOffers()
      setOffers(res.offers || [])
    } catch (e:any) { setError(e?.message || 'Failed to load offers') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      load()
    }
  }, [initialized])

  return (
    <div className="card" style={{ marginTop: 6 }}>
      <h2>Household Offers</h2>
      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: '#d66' }}>{error}</p> : null}
      {!loading && offers.length === 0 ? <p style={{ color: '#8a9b7a' }}>No active offers.</p> : null}
      <div>
        {offers.map((o) => {
          const ownerId = o?.item?.ownerId || null
          const isMe = currentUserId && ownerId && currentUserId === ownerId
          const exp = o?.item?.expiryDate ? new Date(o.item.expiryDate) : null
          const expStr = exp ? exp.toISOString().slice(0,10) : '—'
          return (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'grid' }}>
                <span>{o?.item?.displayName || 'Unknown item'}</span>
                <span style={{ color: '#8a9b7a', fontSize: 12 }}>Expires {expStr}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#8a9b7a' }}>{isMe ? 'Me' : (o?.owner?.name || o?.owner?.email || 'User')}</span>
                {isMe ? (
                  <button className="btn" disabled>Offered</button>
                ) : (
                  <button className="btn primary" disabled={claimingId===o._id} onClick={async ()=>{
                    setClaimingId(o._id)
                    // Optimistically remove from offers
                    setOffers((arr)=>arr.filter((x)=>x._id !== o._id))
                    try { await Api.claimOffer(o._id) } catch {}
                    finally {
                      setClaimingId(null)
                      // Switch to inventory and reload it
                      const fn = (window as any).__switchToInventory
                      if (typeof fn === 'function') fn()
                    }
                  }}>{claimingId===o._id ? 'Claiming…' : 'Claim'}</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
