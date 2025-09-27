import { useEffect, useState } from 'react'
import './App.css'
import { Api } from './lib/api'
import { app, registerOrLogin, login, logout } from './lib/auth'

function App() {
  const [authed, setAuthed] = useState(!!app.currentUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [authError, setAuthError] = useState<string | null>(null)
  const [householdName, setHouseholdName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!authed) { setHouseholdName(null); return }
      try {
        const res = await Api.householdGet()
        if (!cancelled) setHouseholdName(res.household?.name || null)
      } catch {
        if (!cancelled) setHouseholdName(null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [authed])
  const doRegister = async () => {
    setAuthError(null)
    try {
      await registerOrLogin(email, password)
      setAuthed(true)
    } catch (e: any) {
      setAuthError(e?.message || 'Registration failed')
    }
  }
  const doLogin = async () => { await login(email, password); setAuthed(true) }
  const doLogout = async () => { await logout(); setAuthed(false) }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, flex: 1 }}>
          Cook-e-Nova — Receipt Parser {authed && householdName ? `· ${householdName}` : ''}
        </h2>
        {authed ? (
          <button onClick={doLogout}>Logout</button>
        ) : null}
      </header>
      {authed ? (
        <Receipt />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, margin: '0 auto' }}>
          <input placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {authError && <div style={{ color: 'red' }}>{authError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={doRegister}>Register</button>
            <button onClick={doLogin}>Login</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Receipt() {
  const [images, setImages] = useState<string[]>([])
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState<any | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const reads = Array.from(files)
      .filter((f) => allowed.includes(f.type))
      .map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.onload = () => resolve(String(reader.result))
        reader.readAsDataURL(file)
      }))
    const dataUrls = await Promise.all(reads)
    setImages(dataUrls)
  }

  const parse = async () => {
    if (!images.length) return alert('Select one or more images first')
    setLoading(true)
    try {
      const obj = await Api.parseReceipt(images)
      setRaw(JSON.stringify(obj, null, 2))
      setParsed(obj)
      setItems(obj.items.map((li: any) => ({
        displayName: li.name,
        qty: li.qty,
        unit: li.unit,
        price: li.price,
        category: li.category,
        estimatedShelfLifeDays: li.estimatedShelfLifeDays,
        expiryDate: li.expiryDate,
        reasoning: li.reasoning,
      })))
      // Immediately persist to DB for demo simplicity
      const saved = await Api.saveReceipt(obj as any, images)
      console.log('Saved receipt', saved)
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!parsed) return
    const res = await Api.saveReceipt(parsed, images)
    alert(`Saved ${res.itemsCreated} items`)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input type="file" accept="image/*" multiple onChange={(e) => onFilesSelected(e.target.files)} />
        <button onClick={() => setImages([])}>Clear</button>
        <button onClick={parse} disabled={loading || images.length === 0}>{loading ? 'Parsing…' : 'Parse'}</button>
      </div>
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {images.map((src, i) => (
            <img key={i} src={src} alt={`receipt ${i+1}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #444' }} />
          ))}
        </div>
      )}
      {raw && (
        <details open>
          <summary>Model JSON output</summary>
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{raw}</pre>
        </details>
      )}
      {parsed && (
        <div style={{ textAlign: 'left' }}>
          <p><b>Purchase</b>: {parsed.purchaseDate}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Category</th>
                <th>Est. Shelf Life (days)</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td><input value={it.displayName} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, displayName: e.target.value } : x))} /></td>
                  <td><input type="number" value={it.qty ?? 1} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, qty: Number(e.target.value || 0) } : x))} style={{ width: 80 }} /></td>
                  <td><input value={it.unit || ''} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))} style={{ width: 120 }} /></td>
                  <td><input type="number" value={it.price ?? ''} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, price: Number(e.target.value || 0) } : x))} style={{ width: 120 }} /></td>
                  <td><input value={it.category || ''} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, category: e.target.value } : x))} style={{ width: 140 }} /></td>
                  <td><input type="number" value={it.estimatedShelfLifeDays ?? ''} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, estimatedShelfLifeDays: Number(e.target.value || 0) } : x))} style={{ width: 160 }} /></td>
                  <td><input value={it.expiryDate || ''} onChange={(e) => setItems((arr) => arr.map((x, i) => i === idx ? { ...x, expiryDate: e.target.value } : x))} style={{ width: 130 }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ marginTop: 8 }} onClick={save}>Save Items</button>
        </div>
      )}
    </div>
  )
}

export default App
