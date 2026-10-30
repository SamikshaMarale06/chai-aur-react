import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('producthub-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('producthub-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="nav-inner">
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-icon-wrapper" aria-hidden="true">
            {/* Cute minimal vase + leaf / modern hub icon */}
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3c-1.5 0-3 1.2-3 2.8 0 1.5 1.5 2.5 3 4.2 1.5-1.7 3-2.7 3-4.2C15 4.2 13.5 3 12 3z" fill="currentColor" fillOpacity="0.25" />
              <path d="M8 10h8l1.5 8.5a2 2 0 0 1-2 2.5H8.5a2 2 0 0 1-2-2.5L8 10z" />
              <line x1="12" y1="10" x2="12" y2="21" />
            </svg>
          </span>
          <span className="brand-text">
            Product<span className="brand-accent">Hub</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={linkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={linkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </NavLink>

          <NavLink
            to="/add-product"
            className={linkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Add Product
          </NavLink>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            className="theme-button"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? (
              <>
                <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
