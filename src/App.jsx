import React, { useEffect } from 'react';
import AppRoutes from './routes';
import Header from './components/common/Header';
import { useDispatch } from 'react-redux';
import ProductCache from './utils/productCache';
import { initializeCart } from './redux/slices/cartSlice';
import CartCache from './utils/cartCache';

function App() {
  const dispatch = useDispatch();

  // Efecto para inicializar la aplicación al cargar
  useEffect(() => {
    const initialize = async () => {
      try {
        // Inicializa la caché de productos
        await ProductCache.init();

        // Inicializa la caché del carrito
        await CartCache.init();

        // Carga los items del carrito
        dispatch(initializeCart());

      } catch (error) {
        // Si hay error durante la inicialización, intenta cargar el carrito de todas formas
        console.error('Error al inicializar la aplicación:', error);
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