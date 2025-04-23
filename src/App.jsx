import React, { useEffect } from 'react';
import AppRoutes from './routes';
import Header from './components/common/Header';
import { useDispatch } from 'react-redux';
import ProductCache from './utils/productCache';
import { initializeCart } from './redux/slices/cartSlice';
import { fetchProducts } from './redux/slices/productSlice';
import CartCache from './utils/cartCache';


function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const initialize = async () => {
      try {
        await ProductCache.init();

        await CartCache.init();

        dispatch(fetchProducts());

        dispatch(initializeCart());

      } catch (error) {
        console.error('Error al inicializar la aplicación:', error);

        dispatch(fetchProducts());
        dispatch(initializeCart());
      }
    };

    initialize();
  }, [dispatch]);

  return (
    <div className="App">
      <Header />
      <AppRoutes />
    </div>
  );
}

export default App;