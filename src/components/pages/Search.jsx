import React from 'react';
import { Search as SearchIcon, ChevronLeft, X, Users } from 'lucide-react';
import { Glass, Avatar } from '../ui/primitives';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING } from '../layout/Nav';
import { formatUsername } from '../../lib/supabase';
import { useSearch } from '../../lib/hooks';
import { C } from '../../lib/constants';

const SearchResult = ({ user, onClick }) => (
  <button
    onClick={() => onClick(user.id)}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      background: 'transparent',
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      cursor: 'pointer',
      marginBottom: 8,
      textAlign: 'left',
      WebkitTapHighlightColor: 'transparent',
      transition: 'all 0.2s'
    }}
  >
    <Avatar src={user.avatar_url} size={48} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        margin: 0,
        fontSize: 15,
        fontWeight: 500,
        color: C.text,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {user.display_name || user.username}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
        {formatUsername(user.username)}
      </p>
    </div>
  </button>
);

export const Search = ({ onClose, onUserClick }) => {
  const { query, setQuery, results, loading, clear } = useSearch();

  const handleUserClick = (userId) => {
    clear();
    onUserClick(userId);
  };

  return (
    <div style={{
      paddingBottom: SAFE_BOTTOM_PADDING,
      paddingTop: SAFE_TOP_PADDING,
      paddingLeft: 16,
      paddingRight: 16,
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 10,
              minWidth: 44,
              minHeight: 44,
              cursor: 'pointer',
              color: C.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 300, color: C.text }}>Search</h2>
        </div>

        <div style={{ position: 'relative', marginBottom: 24 }}>
          <SearchIcon
            size={20}
            color={C.muted}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username or name..."
            autoFocus
            style={{
              width: '100%',
              padding: '16px 48px 16px 48px',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              color: C.text,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {query && (
            <button
              onClick={clear}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.muted
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {loading && (
          <p style={{ color: C.muted, textAlign: 'center', padding: 20 }}>Searching...</p>
        )}

        {!loading && query && results.length === 0 && (
          <Glass style={{ textAlign: 'center', padding: 48 }}>
            <Users size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>Quiet moment.</p>
            <p style={{ margin: '8px 0 0', color: C.muted, fontSize: 13 }}>No one here yet.</p>
          </Glass>
        )}

        {!loading && !query && (
          <Glass style={{ textAlign: 'center', padding: 48 }}>
            <SearchIcon size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>Find someone.</p>
            <p style={{ margin: '8px 0 0', color: C.muted, fontSize: 13 }}>Search by username or display name.</p>
          </Glass>
        )}

        {!loading && results.length > 0 && (
          <div>
            {results.map(user => (
              <SearchResult key={user.id} user={user} onClick={handleUserClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
