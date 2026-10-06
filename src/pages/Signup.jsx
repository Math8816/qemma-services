// ═══════════════════════════════════════════════
//  src/pages/Signup.jsx
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, saveToken } from '../api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const data = await signup(formData.email, formData.password, formData.full_name);
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
        <h1 style={styles.title}>🏢 منصة القمة</h1>
        <p style={styles.subtitle}>إنشاء حساب جديد</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="full_name"
            placeholder="الاسم الكامل"
            value={formData.full_name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني *"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="كلمة المرور *"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="تأكيد كلمة المرور *"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>لديك حساب؟ سجّل دخول</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: 'Tahoma, sans-serif' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '400px', maxWidth: '90%' },
  title: { margin: '0 0 8px', textAlign: 'center', color: '#1a223a' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '24px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { width: '100%', padding: '12px', background: '#999', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed' },
  error: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  links: { marginTop: '24px', textAlign: 'center' },
  link: { color: '#3498db', textDecoration: 'none', fontSize: '14px' },
};