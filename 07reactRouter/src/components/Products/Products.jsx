import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { deleteProduct, getProducts } from '../../api/products'

const CATEGORIES = ['All', 'Home Decor & Plants', 'Ceramics', 'Electronics']

function isImageUrl(value) {
  if (!value || typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      (/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname) ||
        ['images.unsplash.com', 'images.pexels.com'].includes(url.hostname) ||
        url.hostname === 'res.cloudinary.com')
    )
  } catch {
    return false
  }
}

const CATEGORY_IMAGES = {
  'Home Decor & Plants': '/images/decor-02-indoor-plant.jpg',
  Ceramics: '/images/ceramic-01-mug.jpg',
  Electronics: '/images/elec-02-laptop.jpg',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'

  const location = useLocation()
  const navigate = useNavigate()

  // Handle incoming flash message from add/edit
  useEffect(() => {
    if (location.state?.success) {
      setStatusMessage(location.state.success)
      // Clear location state to prevent re-flashing on reload
      window.history.replaceState({}, document.title)
      const timer = setTimeout(() => setStatusMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      // Category match
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory

      // Search match (case-insensitive name)
      const matchesSearch =
        !query || (product.name && product.name.toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchTerm])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length }
    CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length
    })
    return counts
  }, [products])

  const handleCategorySelect = (category) => {
    if (category === 'All') {
      searchParams.delete('category')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ category })
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    searchParams.delete('category')
    setSearchParams(searchParams)
  }

  const handleEdit = (product) => {
    navigate(`/edit-product/${encodeURIComponent(product.id)}`, {
      state: { product },
    })
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\nThis cannot be undone.`
    )
    if (!confirmed) return

    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setStatusMessage(`"${product.name}" was successfully deleted.`)
      setTimeout(() => setStatusMessage(''), 5000)
    } catch (delError) {
      alert(`Could not delete product: ${delError.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section className="page-width products-page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">Our Products</h1>
          <p className="page-description">
            Explore our collection of amazing products.
          </p>
        </div>
        <div className="collection-tools">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search products by name"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <Link to="/add-product" className="btn btn-primary add-product-button">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Status / Alert Banner */}
      {statusMessage && (
        <div role="status" className="status-banner animate-fade-in">
          <span className="status-icon">✓</span>
          <span>{statusMessage}</span>
          <button
            type="button"
            className="status-close"
            onClick={() => setStatusMessage('')}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div role="status" className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading curated products...</p>
        </div>
      ) : error ? (
        <div className="error-box">
          <h3>Unable to load collection</h3>
          <p>{error}</p>
          <button type="button" onClick={loadProducts} className="btn btn-secondary">
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍃</div>
          <h3>Your collection is empty</h3>
          <p>Get started by adding your first aesthetic product to the boutique catalog.</p>
          <Link to="/add-product" className="btn btn-primary">
            + Add your first product
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching products found</h3>
          <p>
            We couldn&apos;t find any items matching &ldquo;<strong>{searchTerm}</strong>&rdquo;
            {activeCategory !== 'All' ? ` in the ${activeCategory} category` : ''}.
          </p>
          <button type="button" onClick={handleClearFilters} className="btn btn-secondary">
            Clear search & filters
          </button>
        </div>
      ) : (
        <>
          <div className="results-info">
            <span>
              Showing {filteredProducts.length} of {products.length} products
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
              {searchTerm ? ` matching "${searchTerm}"` : ''}
            </span>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => {
              const imageUrl = product.image || (
                isImageUrl(product.link)
                  ? product.link
                  : CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES['Home Decor & Plants']
              )
              const fallbackUrl = CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES['Home Decor & Plants']

              return (
                <article key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      onError={(event) => {
                        if (event.currentTarget.dataset.fallback !== 'true') {
                          event.currentTarget.dataset.fallback = 'true'
                          event.currentTarget.src = fallbackUrl
                        } else {
                          event.currentTarget.classList.add('image-unavailable')
                        }
                      }}
                    />
                    <span className="category-pill-tag">
                      {product.category || 'Curated'}
                    </span>
                  </div>

                  <div className="product-content">
                    <span className="product-category-label">{product.category}</span>
                    <div className="product-details-top">
                      <h2 className="product-title">{product.name}</h2>
                    </div>

                    <p className="product-description">{product.description}</p>

                    <div className="product-footer-row">
                      <span className="product-price">{formatPrice(product.price)}</span>
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noreferrer"
                        className="product-link btn btn-primary"
                        title="Open product link in new tab"
                      >
                        View Details
                        <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </a>
                    </div>

                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="action-btn edit-btn"
                        title="Edit product details"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-icon">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="action-btn delete-btn"
                        title="Delete product"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-icon">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
