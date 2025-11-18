export default function Home() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#bfff00' }}>
          chaogpt
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          your unhinged ai bestie (fr fr)
        </p>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6 }}>
          ✅ Next.js routing is working!
        </p>
      </div>
    </div>
  )
}
