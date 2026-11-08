import { useEffect, useState } from 'react'
import P01Ledgerline from './practices/p01-ledgerline/P01Ledgerline.jsx'
import P02Relay from './practices/p02-relay/P02Relay.jsx'
import P03Stridebook from './practices/p03-stridebook/P03Stridebook.jsx'
import P04Fieldgrid from './practices/p04-fieldgrid/P04Fieldgrid.jsx'

const PRACTICES = [
  { id: 'p01', name: '01 · Ledgerline — premium landing (light pole)', Comp: P01Ledgerline },
  { id: 'p02', name: '02 · Relay — releases & incidents dashboard (dark pole)', Comp: P02Relay },
  { id: 'p03', name: '03 · Stridebook — onboarding + activation (measured patterns)', Comp: P03Stridebook },
  { id: 'p04', name: '04 · Fieldgrid — sidebar fleet dashboard (interactive)', Comp: P04Fieldgrid },
]

const styles = {
  home: {
    minHeight: '100vh', background: '#101418', color: '#E6EBF0', padding: '48px 24px',
    fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box',
  },
  list: { maxWidth: 720, margin: '24px auto', display: 'grid', gap: 14 },
  card: {
    display: 'block', background: '#171D24', border: '1px solid #2A3441', borderRadius: 14,
    padding: '18px 22px', color: '#E6EBF0', textDecoration: 'none',
  },
  cardTitle: { fontWeight: 650, fontSize: 15 },
  cardMeta: { color: '#9AA7B5', fontSize: 13, marginTop: 4 },
  bar: {
    position: 'sticky', top: 0, zIndex: 50, display: 'flex', gap: 14, alignItems: 'center',
    padding: '10px 18px', background: '#0B0E11', borderBottom: '1px solid #222C36',
    fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
  },
  barLink: { color: '#7FA6D9', textDecoration: 'none', fontWeight: 600 },
  barName: { color: '#9AA7B5' },
  h1: { fontSize: 26, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em' },
  p: { textAlign: 'center', color: '#9AA7B5', fontSize: 14, marginTop: 8, lineHeight: 1.6 },
}

function Home() {
  return (
    <div style={styles.home}>
      <h1 style={styles.h1}>Design Sandbox</h1>
      <p style={styles.p}>
        Practice exercises built by applying the design-intelligence system
        (design-intelligence/ in this repo). Render at <code>npm run dev</code> → port 5174.
      </p>
      <div style={styles.list}>
        {PRACTICES.map(p => (
          <a key={p.id} href={`#${p.id}`} style={styles.card}>
            <div style={styles.cardTitle}>{p.name}</div>
            <div style={styles.cardMeta}>
              Built with the decision framework · evaluated with the 10-section checklist ·
              full loop log in design-intelligence/evaluations/design-test-results.md
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash.replace('#', '') || 'home')
  useEffect(() => {
    const onHash = () => setHash(window.location.hash.replace('#', '') || 'home')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const current = PRACTICES.find(p => p.id === hash)
  if (!current) return <Home />
  return (
    <div>
      <div style={styles.bar}>
        <a style={styles.barLink} href="#home">← Sandbox index</a>
        <span style={styles.barName}>{current.name}</span>
      </div>
      <current.Comp />
    </div>
  )
}
