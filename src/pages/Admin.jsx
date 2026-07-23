import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { LogOut, Users, BookOpen } from 'lucide-react';
import AdminUserModal from '../components/AdminUserModal';

export default function Admin() {
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // { name, books }
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in as admin
    const isAdmin = localStorage.getItem('bookstorage_admin');
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchAllData = async () => {
      try {
        const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const stats = {};
        
        snapshot.forEach((doc) => {
          const book = { id: doc.id, ...doc.data() };
          const userName = book.userName || '알 수 없음';
          
          if (!stats[userName]) {
            stats[userName] = {
              name: userName,
              books: [],
              lastActive: book.createdAt
            };
          }
          stats[userName].books.push(book);
        });

        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching data for admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bookstorage_admin');
    navigate('/');
  };

  const usersList = Object.values(userStats).sort((a, b) => b.books.length - a.books.length);
  const totalBooks = usersList.reduce((sum, user) => sum + user.books.length, 0);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={32} />
            관리자 대시보드
          </h1>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '1rem', marginTop: '0.5rem' }}>
            총 {usersList.length}명의 학생이 {totalBooks}권의 책을 기록했습니다.
          </p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={18} />
          로그아웃
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          학생별 독서 현황
        </h2>

        {loading ? (
          <div className="flex-center" style={{ height: '200px', opacity: 0.5 }}>
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className="flex-center" style={{ height: '200px', opacity: 0.5 }}>
            <p>아직 등록된 독서 기록이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {usersList.map((user) => (
              <div 
                key={user.name}
                onClick={() => setSelectedUser(user)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{user.name}</h3>
                  <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>
                    최근 기록: {new Date(user.lastActive).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-secondary)' }}>
                    <BookOpen size={20} />
                  </div>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--accent-secondary)' }}>{user.books.length}권</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminUserModal 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        userName={selectedUser?.name}
        userBooks={selectedUser?.books || []}
      />
    </div>
  );
}
