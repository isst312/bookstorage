import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { LogOut, Plus, Search, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AddBookModal from '../components/AddBookModal';
import BookDetailModal from '../components/BookDetailModal';

// Categories and their colors
const CATEGORIES = {
  '문학': '#ff8787',
  '인문': '#fcc419',
  '과학': '#38d9a9',
  '실용': '#4dabf7',
  '마음': '#b197fc',
  '기타': '#ced4da'
};

const CATEGORY_DESC = {
  '문학': '재미있는 이야기',
  '과학': '궁금한 원리',
  '인문': '역사와 세상 이야기',
  '실용': '돈·생활 지식',
  '마음': '감정과 마음을 배우는 책'
};

export default function Bookshelf() {
  const [userName, setUserName] = useState('');
  const [books, setBooks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetailBook, setSelectedDetailBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('bookstorage_user');
    if (!user) {
      navigate('/');
      return;
    }
    setUserName(user);

    // Fetch user's books from Firestore
    const q = query(collection(db, 'books'), where('userName', '==', user));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookData = [];
      snapshot.forEach((doc) => {
        bookData.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending
      bookData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBooks(bookData);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bookstorage_user');
    navigate('/');
  };

  // Prepare data for the Pie Chart
  const getChartData = () => {
    const counts = {};
    books.forEach(book => {
      counts[book.category] = (counts[book.category] || 0) + 1;
    });
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: CATEGORIES[key] || CATEGORIES['기타']
    }));
  };

  const chartData = getChartData();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>
            <span style={{ color: 'var(--accent-primary)' }}>{userName}</span>님의 마법 책장
          </h1>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '1rem', marginTop: '0.5rem' }}>총 {books.length}권의 책이 꽂혀 있습니다.</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={18} />
          로그아웃
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Bookshelf */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '2rem', minHeight: '60vh', position: 'relative' }}>
            {/* Add Button */}
            <button 
              className="btn btn-primary btn-icon" 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}
              title="책 추가하기"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              나의 독서 기록
            </h2>

            {books.length === 0 ? (
              <div className="flex-center" style={{ flexDirection: 'column', height: '300px', opacity: 0.6 }}>
                <Search size={48} style={{ marginBottom: '1rem' }} />
                <p>아직 읽은 책이 없어요.</p>
                <p>우측 상단의 '+' 버튼을 눌러 첫 번째 책을 기록해 보세요!</p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'flex-end',
                gap: '2px', // Books very close to each other
                padding: '1rem 1rem 0 1rem', 
                minHeight: '260px',
                borderBottom: '20px solid #5c4033', // Wooden shelf base
                borderLeft: '12px solid #4a332a',   // Left wall
                borderRight: '12px solid #4a332a',  // Right wall
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))', // Shadow inside shelf
                boxShadow: 'inset 0 -15px 20px rgba(0,0,0,0.6), 0 10px 15px rgba(0,0,0,0.3)',
                borderRadius: '4px',
                marginBottom: '2rem'
              }}>
                {books.map((book) => {
                  // Generate a pseudo-random height based on book ID so the shelf looks natural
                  const heightVariation = book.id ? (book.id.charCodeAt(0) % 5) * 15 : 0;
                  const spineHeight = 170 + heightVariation;

                  return (
                    <div 
                      key={book.id} 
                      onClick={() => setSelectedDetailBook(book)}
                      style={{ 
                        width: '45px', 
                        height: `${spineHeight}px`,
                        backgroundColor: CATEGORIES[book.category] || CATEGORIES['기타'],
                        borderRadius: '4px 4px 0 0',
                        border: '1px solid rgba(0,0,0,0.4)',
                        borderLeft: '3px solid rgba(255,255,255,0.35)', // 3D highlight effect on the spine
                        boxShadow: '-3px 0 6px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                        e.currentTarget.style.zIndex = 10;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.zIndex = 1;
                      }}
                    >
                      <span style={{ 
                        writingMode: 'vertical-rl', 
                        color: 'rgba(0,0,0,0.85)', 
                        fontWeight: '800', 
                        fontSize: '0.95rem', 
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: '90%',
                        fontFamily: "'Outfit', sans-serif"
                      }}>
                        {book.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Stats (Pie Chart) & Categories info */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>나의 독서 취향</h2>
            
            {books.length > 0 ? (
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-center" style={{ height: '200px', opacity: 0.5, border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                <p style={{ margin: 0 }}>책을 기록하면 통계가 나타납니다.</p>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8 }}>카테고리 설명</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
              {Object.entries(CATEGORY_DESC).map(([key, desc]) => (
                <li key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: CATEGORIES[key], 
                    marginRight: '0.75rem' 
                  }}></span>
                  <strong>{key}</strong>: <span style={{ opacity: 0.8, marginLeft: '0.5rem' }}>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
      
      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        userName={userName} 
      />
      
      <BookDetailModal
        isOpen={!!selectedDetailBook}
        onClose={() => setSelectedDetailBook(null)}
        book={selectedDetailBook}
      />
    </div>
  );
}
