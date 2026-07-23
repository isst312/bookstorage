import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Star, User, Trash2, Edit2 } from 'lucide-react';

export default function BookDetailModal({ isOpen, onClose, book }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editReview, setEditReview] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when book changes
  useEffect(() => {
    if (book) {
      setEditReview(book.review || '');
      setEditRating(book.rating || 5);
      setIsEditing(false);
    }
  }, [book]);

  const fetchReviews = async () => {
        setLoading(true);
        try {
          // Fetch reviews for the exact same book (using ISBN if available, else title)
          const q = book.isbn 
            ? query(collection(db, 'books'), where('isbn', '==', book.isbn))
            : query(collection(db, 'books'), where('title', '==', book.title));
            
          const querySnapshot = await getDocs(q);
          const reviewData = [];
          querySnapshot.forEach((document) => {
            reviewData.push({ id: document.id, ...document.data() });
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

  const handleUpdate = async () => {
    if (!editReview.trim()) {
      alert('감상평을 입력해주세요.');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'books', book.id), {
        review: editReview,
        rating: editRating
      });
      
      // Update local book object to reflect changes immediately
      book.review = editReview;
      book.rating = editRating;
      
      // Refetch reviews
      await fetchReviews();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating review:", error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 책을 내 책장에서 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'books', book.id));
        onClose(); // Delete successful, close modal
      } catch (error) {
        console.error("Error deleting book:", error);
        alert('삭제 중 오류가 발생했습니다.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

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
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem' }}>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              title="내 감상평 수정하기"
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer' }}
            >
              <Edit2 size={24} />
            </button>
          )}
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            title="내 책장에서 삭제하기"
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: isDeleting ? 'wait' : 'pointer', opacity: isDeleting ? 0.5 : 1 }}
          >
            <Trash2 size={24} />
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
          <img 
            src={book.thumbnail || 'https://via.placeholder.com/120x174?text=No+Image'} 
            alt="cover" 
            style={{ width: '100px', height: '145px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', lineHeight: '1.2' }}>{book.title}</h2>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.7, fontSize: '0.9rem' }}>
              {book.authors?.join(', ')} | {book.publisher} | {book.category}
            </p>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>별점 수정:</span>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={20} 
                        fill={star <= editRating ? "var(--accent-secondary)" : "none"}
                        color={star <= editRating ? "var(--accent-secondary)" : "rgba(255,255,255,0.3)"}
                        onClick={() => setEditRating(star)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
                <textarea 
                  value={editReview}
                  onChange={(e) => setEditReview(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '0.5rem', 
                    borderRadius: '4px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    resize: 'none',
                    minHeight: '60px'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>취소</button>
                  <button onClick={handleUpdate} disabled={isUpdating} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                    {isUpdating ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.95rem', lineHeight: '1.6', flex: 1, overflowY: 'auto' }}>
                <strong style={{ color: 'var(--accent-secondary)', display: 'block', marginBottom: '0.5rem' }}>내 감상평</strong>
                {book.review}
              </p>
            )}
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
