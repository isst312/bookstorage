import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim() === '') {
      setError('이름을 입력해주세요.');
      return;
    }
    
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setError('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }

    // 관리자 모드 예외 처리 (백도어)
    if (name.trim() === '관리자' && pin === '1234') {
      localStorage.setItem('bookstorage_admin', 'true');
      navigate('/admin');
      return;
    }

    setLoading(true);
    try {
      // Use the name as the document ID in the 'users' collection
      const userRef = doc(db, 'users', name.trim());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.pin === pin) {
          // Login successful
          localStorage.setItem('bookstorage_user', name.trim());
          navigate('/bookshelf');
        } else {
          setError('비밀번호가 틀렸습니다.');
        }
      } else {
        // First time user, register them
        await setDoc(userRef, {
          name: name.trim(),
          pin: pin,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('bookstorage_user', name.trim());
        navigate('/bookshelf');
      }
    } catch (err) {
      console.error(err);
      setError('로그인 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="btn-icon" style={{ background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>나만의 마법 책장</h1>
          <p style={{ margin: 0, marginTop: '0.5rem' }}>나만의 책을 기록하고 간직하세요</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">이름</label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="pin">비밀번호 (숫자 4자리)</label>
            <input
              id="pin"
              type="password"
              className="input-field"
              placeholder="****"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} // Only allow numbers
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? '들어가는 중...' : '책장 열기'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1.5rem', opacity: 0.6 }}>
          * 처음 오신 분은 이름과 4자리 숫자를 입력하면 자동으로 등록됩니다.
        </p>
      </div>
    </div>
  );
}
