import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <Link 
            href="/en"
            style={{
              padding: '10px 20px',
              backgroundColor: '#536C4A',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </body>
    </html>
  )
}
