import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(10);

  return (
    <div className="app-container">
      <h1>Counter App</h1>

      <h2>Count: {count}</h2>

      <div>
        <button onClick={() => setCount(c => c + 1)}>
          INC
        </button>

        <button onClick={() => setCount(c => c - 1)}>
          DEC
        </button>

        <button onClick={() => setCount(10)}>
          RESET
        </button>
      </div>
    </div>
  );
}

export default App;