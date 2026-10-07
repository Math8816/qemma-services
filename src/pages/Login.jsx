// ═══════════════════════════════════════════════
//  src/pages/Login.jsx
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@qemma.local');
  const [password, setPassword] = useState('Admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
  const data = await login(email, password);

  // ─── هل يحتاج 2FA؟ ───
  if (data.requires_2fa) {
    navigate('/2fa-verify', {
      state: { tempToken: data.temp_token },
    });
    return;
  }

  // ─── لا يوجد 2FA → ادخل مباشرة ───
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
        <h1 style={styles.title}>🏢 منصة القمة</h1>
        <p style={styles.subtitle}>تسجيل الدخول</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>

          <div style={styles.links}>
            <Link to="/signup" style={styles.link}>ليس لديك حساب؟ سجّل الآن</Link>
            <Link to="/reset-password" style={styles.link}>نسيت كلمة المرور؟</Link>
          </div>
        </form>

        <div style={styles.hint}>
          <p style={{ margin: '0 0 8px' }}>للتجربة:</p>
          <p style={{ margin: '4px 0' }}>📧 admin@qemma.local / Admin123</p>
          <p style={{ margin: '4px 0' }}>📧 user@qemma.local / Admin123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
    fontFamily: 'Tahoma, sans-serif',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '400px',
    maxWidth: '90%',
  },
  title: {
    margin: '0 0 8px',
    textAlign: 'center',
    color: '#1a223a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1a223a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    width: '100%',
    padding: '12px',
    background: '#999',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'not-allowed',
  },

  links: { marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  link: { color: '#3498db', textDecoration: 'none' },
  
  error: {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
  },
  hint: {
    marginTop: '24px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
  },
};