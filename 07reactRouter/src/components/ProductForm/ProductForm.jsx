import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProduct, updateProduct } from '../../api/products'

const initialForm = {
  name: '',
  link: '',
  description: '',
  price: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isEditMode = Boolean(id)

  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode)
  const [error, setError] = useState('')

  // Pre-fill or fetch product details in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setForm(initialForm)
      setIsLoadingProduct(false)
      return
    }

    // If passed via navigation state, use it immediately
    if (location.state?.product) {
      const p = location.state.product
      setForm({
        name: p.name || '',
        link: p.link || '',
        description: p.description || '',
        price: p.price != null ? String(p.price) : '',
      })
      setIsLoadingProduct(false)
      return
    }

    // Otherwise fetch from server
    let isMounted = true
    setIsLoadingProduct(true)
    getProduct(id)
      .then((p) => {
        if (!isMounted) return
        setForm({
          name: p.name || '',
          link: p.link || '',
          description: p.description || '',
          price: p.price != null ? String(p.price) : '',
        })
      })
      .catch((fetchErr) => {
        if (!isMounted) return
        setError(`Could not load product for editing: ${fetchErr.message}`)
      })
      .finally(() => {
        if (isMounted) setIsLoadingProduct(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isEditMode, location.state])

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const payload = {
      name: form.name.trim(),
      link: form.link.trim(),
      description: form.description.trim(),
      price: Number(form.price),
    }

    try {
      if (isEditMode) {
        await updateProduct(id, payload)
        navigate('/products', {
          state: { success: `"${payload.name}" was updated successfully!` },
        })
      } else {
        await createProduct(payload)
        setForm(initialForm)
        navigate('/products', {
          state: { success: `"${payload.name}" was added to the collection!` },
        })
      }
    } catch (submitError) {
      setError(submitError.message || 'An error occurred while saving.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-width">
      <div className="form-panel">
        <div className="form-header">
          <h1 className="form-title">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="form-subtitle">
            {isEditMode
              ? 'Update details for this collection piece and save changes.'
              : 'Fill in the details below to add a new product.'}
          </p>
        </div>

        {isLoadingProduct ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-fields">
            {/* Product Name */}
            <div className="form-field">
              <label htmlFor="name">
                Product Name <span className="req-star">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={updateField}
                maxLength={120}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Product Link */}
            <div className="form-field">
              <label htmlFor="link">
                Product Link / Image URL <span className="req-star">*</span>
              </label>
              <input
                id="link"
                name="link"
                type="url"
                value={form.link}
                onChange={updateField}
                placeholder="Enter product link (image or website URL)"
                required
              />
              <span className="field-hint">
                Provide a valid image or product URL. Direct photo links will display a card image.
              </span>
            </div>

            {/* Description */}
            <div className="form-field">
              <label htmlFor="description">
                Description <span className="req-star">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={updateField}
                maxLength={3000}
                rows={4}
                placeholder="Write a short description of the product"
                required
              />
              <span className="field-hint">
                {form.description.length} / 3000 characters
              </span>
            </div>

            {/* Price */}
            <div className="form-field">
              <label htmlFor="price">
                Price (INR ₹) <span className="req-star">*</span>
              </label>
              <div className="price-input-wrapper">
                <span className="currency-prefix">₹</span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={updateField}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="form-error-banner">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-actions-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting
                  ? isEditMode
                    ? 'Updating...'
                    : 'Saving...'
                  : isEditMode
                  ? 'Update Product'
                  : 'Submit'}
              </button>

              <Link to="/products" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
