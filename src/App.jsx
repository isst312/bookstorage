import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Bookshelf from './pages/Bookshelf';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/bookshelf" element={<Bookshelf />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
