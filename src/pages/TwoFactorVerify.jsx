// ═══════════════════════════════════════════════
//  src/pages/TwoFactorVerify.jsx
//  التحقق من 2FA بعد Login
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verify2FALogin, saveToken } from '../api';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tempToken = location.state?.tempToken;

  // ─── إذا لا يوجد توكن → ارجع لـ Login ───
  if (!tempToken) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await verify2FALogin(tempToken, code);
      saveToken(data.access_token, data.user);
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 التحقق الثنائي</h1>
        <p style={styles.subtitle}>
          أدخل الرمز المُكوَّن من 6 أرقام من تطبيق Google Authenticator
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="• • • • • •"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={styles.input}
            maxLength="6"
            autoFocus
            required
          />

          <button type="submit" disabled={loading || code.length !== 6} style={loading || code.length !== 6 ? styles.buttonDisabled : styles.button}>
            {loading ? 'جاري التحقق...' : 'تحقق'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>العودة لتسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: 'Tahoma, sans-serif' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '400px', maxWidth: '90%' },
  title: { margin: '0 0 8px', textAlign: 'center', color: '#1a223a', fontSize: '24px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 },
  input: { width: '100%', padding: '16px', marginBottom: '16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '24px', textAlign: 'center', letterSpacing: '12px', boxSizing: 'border-box', fontFamily: 'monospace' },
  button: { width: '100%', padding: '12px', background: '#1a223a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { width: '100%', padding: '12px', background: '#999', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed' },
  error: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  links: { marginTop: '24px', textAlign: 'center' },
  link: { color: '#3498db', textDecoration: 'none', fontSize: '14px' },
};