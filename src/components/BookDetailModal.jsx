import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Star, User } from 'lucide-react';

export default function BookDetailModal({ isOpen, onClose, book }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      const fetchReviews = async () => {
        setLoading(true);
        try {
          // Fetch reviews for the exact same book (using ISBN if available, else title)
          const q = book.isbn 
            ? query(collection(db, 'books'), where('isbn', '==', book.isbn))
            : query(collection(db, 'books'), where('title', '==', book.title));
            
          const querySnapshot = await getDocs(q);
          const reviewData = [];
          querySnapshot.forEach((doc) => {
            reviewData.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort reviews by date
          reviewData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setReviews(reviewData);
        } catch (error) {
          console.error("Error fetching reviews:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchReviews();
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

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

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
          <img 
            src={book.thumbnail || 'https://via.placeholder.com/120x170?text=No+Image'} 
            alt="cover" 
            style={{ width: '120px', height: '170px', objectFit: 'cover', borderRadius: '8px', boxShadow: 'var(--shadow-glass)' }} 
          />
          <div>
            <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'var(--accent-primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {book.category}
            </span>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{book.title}</h2>
            <p style={{ margin: 0, opacity: 0.8, marginBottom: '1rem' }}>
              {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>
              <Star fill="currentColor" size={18} />
              <span>{book.rating} / 5.0</span>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          독서 감상평 모아보기 ({reviews.length}개)
          {reviews.length > 0 && (
            <span style={{ fontSize: '1rem', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}>
              <Star fill="currentColor" size={16} />
              {(reviews.reduce((acc, rev) => acc + Number(rev.rating || 0), 0) / reviews.length).toFixed(1)}
            </span>
          )}
        </h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>리뷰를 불러오는 중입니다...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(rev => (
              <div key={rev.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={14} color="white" />
                    </div>
                    <span style={{ fontWeight: 'bold' }}>{rev.userName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>
                    <Star fill="currentColor" size={14} />
                    <span>{rev.rating}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {rev.review}
                </p>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.75rem', textAlign: 'right' }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
