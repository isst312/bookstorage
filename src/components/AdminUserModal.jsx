import { useState } from 'react';
import { X, Star, ChevronDown, ChevronUp, Trash2, KeyRound } from 'lucide-react';

export default function AdminUserModal({ isOpen, onClose, userName, userPin, userBooks, onBookDeleted, onUpdatePin, onDeleteUser }) {
  const [expandedBookId, setExpandedBookId] = useState(null);

  if (!isOpen) return null;

  const toggleBook = (bookId) => {
    if (expandedBookId === bookId) {
      setExpandedBookId(null);
    } else {
      setExpandedBookId(bookId);
    }
  };

  const handleDeleteClick = (e, bookId) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 학생의 독서 기록을 강제로 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      onBookDeleted(bookId);
    }
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
        width: '90%', maxWidth: '700px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>{userName}</span> 학생의 독서 기록
              {userPin ? (
                <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#fbbf24', marginLeft: '0.5rem' }}>
                  PIN: {userPin}
                </span>
              ) : (
                <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#fbbf24', marginLeft: '0.5rem' }}>
                  PIN: 정보 없음
                </span>
              )}
              <button 
                onClick={() => {
                  const newPin = window.prompt('새로운 4자리 숫자 비밀번호를 입력하세요:');
                  if (newPin && newPin.length === 4 && !isNaN(Number(newPin))) {
                    onUpdatePin(newPin);
                  } else if (newPin) {
                    alert('비밀번호는 4자리 숫자여야 합니다.');
                  }
                }} 
                className="btn btn-outline" 
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <KeyRound size={14} /> 변경
              </button>
            </h2>
            <p style={{ margin: 0, opacity: 0.7, marginTop: '0.5rem' }}>총 {userBooks.length}권의 책을 읽었습니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => {
                if (window.confirm('정말로 이 학생의 계정과 모든 독서 기록을 영구적으로 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
                  onDeleteUser();
                }
              }}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', opacity: 0.8 }}
            >
              <Trash2 size={18} /> 계정 삭제
            </button>
            <button  
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {userBooks.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.6, margin: '2rem 0' }}>아직 등록된 독서 기록이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userBooks.map(book => (
                <div key={book.id} style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden'
                }}>
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleBook(book.id)}
                    style={{ 
                      padding: '1rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: expandedBookId === book.id ? 'rgba(255,255,255,0.02)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <img 
                        src={book.thumbnail || 'https://via.placeholder.com/40x60?text=No+Image'} 
                        alt="cover" 
                        style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{book.title}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>
                          <span>{book.category}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Star size={12} fill="var(--accent-secondary)" color="var(--accent-secondary)" /> 
                            {book.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {expandedBookId === book.id ? <ChevronUp size={20} opacity={0.5} /> : <ChevronDown size={20} opacity={0.5} />}
                    </div>
                  </div>

                  {/* Accordion Body (Review) */}
                  {expandedBookId === book.id && (
                    <div style={{ 
                      padding: '1.5rem', 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.2)',
                      position: 'relative'
                    }} className="animate-fade-in">
                      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                        <button 
                          onClick={(e) => handleDeleteClick(e, book.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.8 }}
                          title="이 기록 삭제하기"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--accent-primary)', paddingRight: '2rem' }}>감상평</h4>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', paddingRight: '2rem' }}>
                        {book.review}
                      </p>
                      <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5 }}>
                        작성일: {new Date(book.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
