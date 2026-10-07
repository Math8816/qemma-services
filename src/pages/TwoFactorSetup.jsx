// ═══════════════════════════════════════════════
//  src/pages/TwoFactorSetup.jsx
//  تفعيل/تعطيل 2FA
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { enable2FA, verify2FA, get2FAStatus, disable2FA, getUser, clearSession } from '../api';

export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const [user] = useState(getUser());
  const [status, setStatus] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await get2FAStatus();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await enable2FA();
      setSecret(data.secret);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await verify2FA(code);
      setSecret('');
      setCode('');
      await loadStatus();
      alert('✅ تم تفعيل 2FA بنجاح');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('هل أنت متأكد من تعطيل 2FA؟')) return;
    setLoading(true);
    try {
      await disable2FA();
      await loadStatus();
      alert('✅ تم تعطيل 2FA');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  // ─── QR Code URL (للإنتاج مع speakeasy) ───
  const qrUrl = secret
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Qemma:${user?.email}?secret=${secret}&issuer=Qemma`
    : '';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>🔐 إعدادات 2FA</h1>
          <p style={styles.headerSubtitle}>مرحباً، {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>تسجيل خروج</button>
      </div>

      <div style={styles.nav}>
        <Link to="/products" style={styles.navLink}>📦 المنتجات</Link>
        <Link to="/customers" style={styles.navLink}>👥 العملاء</Link>
        <Link to="/users" style={styles.navLink}>👤 المستخدمون</Link>
        <Link to="/audit" style={styles.navLink}>📋 السجل</Link>
        <Link to="/backups" style={styles.navLink}>💾 النسخ</Link>
        <Link to="/settings/2fa" style={{ ...styles.navLink, ...styles.navActive }}>🔐 2FA</Link>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}

          {/* ─── الحالة ─── */}
          {status && (
            <div style={styles.status}>
              <span style={styles.statusLabel}>حالة 2FA:</span>
              <span style={{
                ...styles.badge,
                background: status.enabled ? '#27ae60' : '#95a5a6',
              }}>
                {status.enabled ? '✅ مُفعّل' : '❌ غير مُفعّل'}
              </span>
            </div>
          )}

          {/* ─── الحالة 1: غير مُفعّل → زر التفعيل ─── */}
          {!secret && status && !status.enabled && (
            <div>
              <p style={styles.text}>
                المصادقة الثنائية تضيف طبقة أمان إضافية لحسابك.
                بعد التفعيل، ستحتاج إلى إدخال رمز من تطبيق Google Authenticator عند كل تسجيل دخول.
              </p>
              <button
                onClick={handleEnable}
                disabled={loading}
                style={loading ? styles.buttonDisabled : styles.button}
              >
                {loading ? 'جاري التفعيل...' : '➕ تفعيل 2FA'}
              </button>
            </div>
          )}

          {/* ─── الحالة 2: Secret مُولَّد → عرض QR + التحقق ─── */}
          {secret && (
            <div>
              <h2 style={styles.stepTitle}>1️⃣ امسح QR Code</h2>
              <p style={styles.text}>
                افتح Google Authenticator، واضغط +، ثم اختر "Scan QR code".
              </p>

              {qrUrl && (
                <div style={styles.qrContainer}>
                  <img src={qrUrl} alt="QR Code" style={styles.qrImage} />
                </div>
              )}

              <details style={styles.details}>
                <summary>أو أدخل السر يدوياً</summary>
                <code style={styles.secret}>{secret}</code>
              </details>

              <h2 style={styles.stepTitle}>2️⃣ أدخل الرمز للتحقق</h2>
              <input
                type="text"
                placeholder="• • • • • •"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={styles.input}
                maxLength="6"
                autoFocus
              />
              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                style={loading || code.length !== 6 ? styles.buttonDisabled : styles.button}
              >
                {loading ? 'جاري التحقق...' : '✅ تحقق وتفعيل'}
              </button>
            </div>
          )}

          {/* ─── الحالة 3: مُفعّل → زر التعطيل ─── */}
          {status && status.enabled && (
            <div>
              <p style={styles.text}>
                ✅ 2FA مُفعّل على حسابك.
                {status.enabled_at && (
                  <>
                    <br />
                    <small style={styles.small}>
                      تاريخ التفعيل: {new Date(status.enabled_at).toLocaleString('ar-EG')}
                    </small>
                  </>
                )}
              </p>
              <button
                onClick={handleDisable}
                disabled={loading}
                style={styles.dangerButton}
              >
                {loading ? 'جاري...' : '🗑️ تعطيل 2FA'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Tahoma, sans-serif', padding: '20px' },
  header: { maxWidth: '800px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a223a', color: '#fff', padding: '20px 24px', borderRadius: '12px' },
  headerTitle: { margin: '0 0 4px', fontSize: '22px' },
  headerSubtitle: { margin: 0, fontSize: '14px', opacity: 0.8 },
  logoutButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer' },
  nav: { maxWidth: '800px', margin: '0 auto 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navLink: { padding: '10px 20px', background: '#fff', color: '#1a223a', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', border: '1px solid #e0e0e0', fontWeight: 'bold' },
  navActive: { background: '#1a223a', color: '#fff', borderColor: '#1a223a' },
  content: { maxWidth: '800px', margin: '0 auto' },
  card: { background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e0e0e0' },
  status: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' },
  statusLabel: { fontSize: '16px', color: '#333', fontWeight: 'bold' },
  badge: { padding: '6px 14px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: 'bold' },
  stepTitle: { fontSize: '18px', color: '#1a223a', marginTop: '24px', marginBottom: '12px' },
  text: { color: '#555', lineHeight: 1.7, fontSize: '14px', marginBottom: '16px' },
  small: { color: '#888', fontSize: '12px' },
  qrContainer: { textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '16px' },
  qrImage: { width: '200px', height: '200px' },
  details: { padding: '12px', background: '#f0f2f5', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' },
  secret: { display: 'block', marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' },
  input: { width: '100%', padding: '16px', marginBottom: '16px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '24px', textAlign: 'center', letterSpacing: '12px', boxSizing: 'border-box', fontFamily: 'monospace' },
  button: { width: '100%', padding: '14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { width: '100%', padding: '14px', background: '#999', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed' },
  dangerButton: { width: '100%', padding: '14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  error: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
};