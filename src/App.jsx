import React from 'react';
import AppRoutes from './routes';
import Header from './components/common/Header';


function App() {
  return (
    <div className="App">
      <Header />
      <AppRoutes />
    </div>
  );
}

export default App;