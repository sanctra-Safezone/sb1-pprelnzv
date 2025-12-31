import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { Glass, Btn, Input } from '../ui/primitives';
import { supabase, sanitizeUsername } from '../../lib/supabase';
import { C } from '../../lib/constants';

export const Auth = ({ onAuth }) => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData.user) {
          const cleanUsername = sanitizeUsername(username) || email.split('@')[0];
          const { error: profileError } = await supabase.from('user_profiles').insert({
            id: authData.user.id,
            username: cleanUsername,
            display_name: cleanUsername,
            cty_balance: 50
          });
          if (profileError && !profileError.message.includes('duplicate')) throw profileError;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
      onAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      paddingTop: 'calc(24px + env(safe-area-inset-top))',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      background: C.bg,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            background: C.gradient,
            border: '1px solid rgba(52,211,153,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 16px 48px rgba(16,185,129,0.15)'
          }}>
            <Leaf size={42} color={C.emeraldLight} />
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 200, margin: 0, color: C.text, letterSpacing: '-1px' }}>Sanctra</h1>
          <p style={{ color: C.muted, marginTop: 12, fontSize: '16px', fontWeight: 300, letterSpacing: '0.5px' }}>
            The place you were looking for
          </p>
        </div>
        <Glass style={{ padding: '32px' }}>
          <div style={{ display: 'flex', marginBottom: 28, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: 14,
                  minHeight: 48,
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: mode === m ? 'rgba(16,185,129,0.3)' : 'transparent',
                  color: mode === m ? C.text : C.muted,
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              marginBottom: 16
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#fca5a5' }}>{error}</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <Input value={username} onChange={setUsername} placeholder="Username" />
            )}
            <Input value={email} onChange={setEmail} placeholder="Email" type="email" />
            <Input value={password} onChange={setPassword} placeholder="Password" type="password" />
            <Btn
              onClick={handleAuth}
              disabled={loading || !email || !password}
              size="lg"
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Enter Sanctuary' : 'Create Account'}
            </Btn>
          </div>
        </Glass>
        <p style={{
          textAlign: 'center',
          marginTop: 40,
          fontSize: 11,
          color: 'rgba(156,198,198,0.35)',
          letterSpacing: 3,
          textTransform: 'uppercase'
        }}>
          Powered by <span style={{ color: 'rgba(204,163,94,0.5)' }}>Cryptinity</span>
        </p>
      </div>
    </div>
  );
};
