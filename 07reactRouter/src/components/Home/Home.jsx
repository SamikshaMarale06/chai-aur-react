import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page-width home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-welcome">
            <span aria-hidden="true">✦</span> Welcome to ProductHub
            <span aria-hidden="true" className="welcome-heart">♥</span>
          </span>
          <h1 className="hero-title">
            Discover Amazing
            <br />
            Products for <span>Your Life</span>
          </h1>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Explore Products <span aria-hidden="true">→</span>
            </Link>
            <Link to="/add-product" className="btn btn-secondary">
              Add Product
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-art-backdrop" />
          <img
            className="hero-image"
            src="/images/decor-02-indoor-plant.jpg"
            alt=""
          />
          <span className="hero-heart">♡</span>
        </div>
      </section>
    </div>
  )
}
