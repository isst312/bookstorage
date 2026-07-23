import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, deleteDoc, doc, setDoc, where } from 'firebase/firestore';
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
        // Fetch all users to get PIN numbers
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const stats = {};
        
        usersSnapshot.forEach((doc) => {
          stats[doc.id] = {
            name: doc.id,
            pin: doc.data().pin, // Fixed field name
            books: [],
            lastActive: doc.data().createdAt || new Date().toISOString()
          };
        });

        // Fetch all books
        const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        snapshot.forEach((doc) => {
          const book = { id: doc.id, ...doc.data() };
          const userName = book.userName || '알 수 없음';
          
          if (!stats[userName]) {
            stats[userName] = {
              name: userName,
              pin: '알 수 없음',
              books: [],
              lastActive: book.createdAt
            };
          }
          stats[userName].books.push(book);
          // Update lastActive if book is newer
          if (new Date(book.createdAt) > new Date(stats[userName].lastActive)) {
            stats[userName].lastActive = book.createdAt;
          }
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

  const handleBookDeleted = async (userName, bookId) => {
    try {
      await deleteDoc(doc(db, 'books', bookId));
      
      // Update UI locally
      setUserStats(prev => {
        const newStats = { ...prev };
        if (newStats[userName]) {
          newStats[userName].books = newStats[userName].books.filter(b => b.id !== bookId);
        }
        return newStats;
      });

      // Update selected user to reflect changes in modal
      setSelectedUser(prev => {
        if (prev && prev.name === userName) {
          return { ...prev, books: prev.books.filter(b => b.id !== bookId) };
        }
        return prev;
      });
    } catch (error) {
      console.error("Error deleting book as admin:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleUpdatePin = async (userName, newPin) => {
    try {
      // Use setDoc with merge to ensure it works even if the user document doesn't exist yet
      await setDoc(doc(db, 'users', userName), { pin: newPin, password: newPin }, { merge: true });
      
      setUserStats(prev => {
        const newStats = { ...prev };
        if (newStats[userName]) {
          newStats[userName].pin = newPin;
        }
        return newStats;
      });

      setSelectedUser(prev => {
        if (prev && prev.name === userName) {
          return { ...prev, pin: newPin };
        }
        return prev;
      });
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error("Error updating pin:", error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async (userName) => {
    try {
      // 1. Delete all books for this user
      const q = query(collection(db, 'books'), where('userName', '==', userName));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'books', d.id)));
      await Promise.all(deletePromises);
      
      // 2. Delete user document
      await deleteDoc(doc(db, 'users', userName));
      
      // 3. Update UI
      setUserStats(prev => {
        const newStats = { ...prev };
        delete newStats[userName];
        return newStats;
      });
      setSelectedUser(null);
      alert(`${userName} 학생의 계정과 모든 기록이 영구적으로 삭제되었습니다.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
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
        userPin={selectedUser?.pin}
        userBooks={selectedUser?.books || []}
        onBookDeleted={(bookId) => handleBookDeleted(selectedUser?.name, bookId)}
        onUpdatePin={(newPin) => handleUpdatePin(selectedUser?.name, newPin)}
        onDeleteUser={() => handleDeleteUser(selectedUser?.name)}
      />
    </div>
  );
}
