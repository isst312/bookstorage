import { useState } from 'react';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Search, Star } from 'lucide-react';

const KAKAO_API_KEY = "68af2e8eeb15fa7115c39888ebdb5ada";

// KDC Categories Map
const KDC_MAP = {
  '000': '000: 총류', '100': '100: 철학', '200': '200: 종교', 
  '300': '300: 사회과학', '400': '400: 자연과학', '500': '500: 기술과학', 
  '600': '600: 예술', '700': '700: 언어', '800': '800: 문학', '900': '900: 역사'
};

const guessKdcCategory = (book) => {
  const text = (book.title + " " + (book.contents || "")).toLowerCase();
  if (text.match(/소설|문학|시집|에세이|수필|동화|판타지/)) return '800';
  if (text.match(/역사|조선|고려|로마|세계사|문명|전쟁/)) return '900';
  if (text.match(/사회|정치|경제|법|교육|경영|마케팅|주식|돈|투자/)) return '300';
  if (text.match(/철학|심리|마음|윤리|사상|인문/)) return '100';
  if (text.match(/기술|컴퓨터|프로그래밍|공학|요리|의학|건강|농업/)) return '500';
  if (text.match(/수학|물리|화학|생물|과학|우주|자연/)) return '400';
  if (text.match(/예술|음악|미술|건축|사진|디자인|영화|만화/)) return '600';
  if (text.match(/영어|한국어|언어|한자|문법|회화|토익/)) return '700';
  if (text.match(/종교|기독교|불교|성경|신앙/)) return '200';
  return '000'; // Default Generalities
};

const calculatePageCount = (isbn) => {
  if (!isbn) return 250;
  let sum = 0;
  for (let i = 0; i < isbn.length; i++) {
    sum += isbn.charCodeAt(i);
  }
  return 150 + (sum % 500); // Generates 150 ~ 649 pages
};

export default function AddBookModal({ isOpen, onClose, userName }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [category, setCategory] = useState('');
  const [pageCount, setPageCount] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('https://dapi.kakao.com/v3/search/book', {
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        params: { query: query, size: 5 }
      });
      setSearchResults(response.data.documents);
    } catch (err) {
      console.error(err);
      setError('도서 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectBook = (book) => {
    setSelectedBook(book);
    const code = guessKdcCategory(book);
    setCategory(KDC_MAP[code]);
    setPageCount(calculatePageCount(book.isbn));
  };

  const handleSave = async () => {
    if (review.length < 50) {
      setError('감상평은 최소 50자 이상 작성해주세요.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'books'), {
        userName: userName,
        title: selectedBook.title,
        authors: selectedBook.authors,
        thumbnail: selectedBook.thumbnail,
        isbn: selectedBook.isbn,
        rating: Number(rating),
        review: review,
        category: category,
        pageCount: pageCount, // Saved for thickness!
        createdAt: new Date().toISOString()
      });
      onClose(); // Close modal and reset state
    } catch (err) {
      console.error(err);
      setError('기록 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedBook(null);
    setReview('');
    setRating(5);
    setError('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '90%', maxWidth: '600px', maxHeight: '90vh',
        overflowY: 'auto', padding: '2rem', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>새로운 책 기록하기</h2>

        {!selectedBook ? (
          <>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="책 제목을 검색해보세요" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={18} />
              </button>
            </form>
            
            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {searchResults.map((book, idx) => (
                <div key={idx} 
                  className="glass-panel" 
                  style={{ display: 'flex', gap: '1rem', padding: '1rem', cursor: 'pointer' }}
                  onClick={() => selectBook(book)}
                >
                  <img src={book.thumbnail || 'https://via.placeholder.com/80x115?text=No+Image'} alt="cover" style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{book.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{book.authors.join(', ')} | {book.publisher}</p>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && !loading && query && (
                <p style={{ textAlign: 'center', opacity: 0.5 }}>검색 결과가 없습니다.</p>
              )}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <img src={selectedBook.thumbnail || 'https://via.placeholder.com/80x115?text=No+Image'} alt="cover" style={{ width: '80px', height: '115px', objectFit: 'cover', borderRadius: '4px' }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedBook.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>{selectedBook.authors.join(', ')}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--accent-primary)', borderRadius: '12px' }}>{category}</span>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>약 {pageCount} 페이지</span>
                </div>
                <button onClick={resetSelection} style={{ marginTop: '0.75rem', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
                  ← 다른 책 다시 검색하기
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>별점 주기</span>
                <span style={{ color: 'var(--accent-secondary)' }}>{rating}점</span>
              </label>
              <input 
                type="range" min="0" max="5" step="0.5" 
                value={rating} 
                onChange={(e) => setRating(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>감상평 (50자 이상)</span>
                <span style={{ color: review.length >= 50 ? 'var(--accent-primary)' : '#ef4444' }}>
                  {review.length} / 50
                </span>
              </label>
              <textarea 
                className="input-field" 
                rows="5"
                placeholder="이 책을 읽고 느낀 점을 자유롭게 적어주세요. (최소 50자)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? '책장에 꽂는 중...' : '책장에 기록하기 📚'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
