import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Bookshelf from './pages/Bookshelf';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/bookshelf" element={<Bookshelf />} />
    </Routes>
  );
}

export default App;
