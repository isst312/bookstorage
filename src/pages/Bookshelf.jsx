import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Bookshelf() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('bookstorage_user');
    if (!user) {
      navigate('/');
    } else {
      setUserName(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bookstorage_user');
    navigate('/');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{userName}님의 책장</h1>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>어떤 책들을 읽으셨나요?</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={18} />
          로그아웃
        </button>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>곧 멋진 책장이 이곳에 만들어집니다! 📚</p>
      </div>
    </div>
  );
}
