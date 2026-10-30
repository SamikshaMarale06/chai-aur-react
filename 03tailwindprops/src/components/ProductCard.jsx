function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <div className="product-details">
        <h2 className="product-name">{product.name}</h2>

        <p className="product-price">₹{product.price}</p>

        <p className="product-description">
          {product.description}
        </p>

        <button
          className="add-to-cart"
          onClick={() => alert(`${product.name} added to cart!`)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
