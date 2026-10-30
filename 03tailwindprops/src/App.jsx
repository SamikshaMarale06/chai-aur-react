
import './App.css';
import ProductCard from './components/ProductCard';
import products from './data/products';

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Our Products</h1>

      <div className="products-container">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
