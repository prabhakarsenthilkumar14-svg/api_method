import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // fetch data whenever the query changes (with a short debounce)
  useEffect(() => {
    if (!query) {
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      setLoading(true)
      setError(null)
      fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((data) => {
          setResults(data.items || [])
        })
        .catch((e) => {
          if (e.name !== 'AbortError') {
            setError(e.message || 'Failed to fetch results')
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [query])



  return (
    <div className="app-container">
      <header>
        <h1>Search GitHub Users</h1>
        <input
          type="text"
          placeholder="Type username..."
          value={query}
          onChange={(e) => {
            const val = e.target.value
            setQuery(val)
            if (!val) {
              setResults([])
              setError(null)
            }
          }}
        />
      </header>

      <main>
        {loading && <div className="status">Loading...</div>}
        {error && <div className="status error">Error: {error}</div>}
        {!loading && !error && results.length === 0 && query && (
          <div className="status">No users found</div>
        )}
        <ul className="results">
          {results.map((user) => (
            <li key={user.id} className="result-item">
              <a href={user.html_url} target="_blank" rel="noreferrer">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="avatar"
                />
                <span>{user.login}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App
