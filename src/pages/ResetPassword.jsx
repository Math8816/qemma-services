// ═══════════════════════════════════════════════
//  src/pages/ResetPassword.jsx
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset, verifyResetCode, updatePassword } from '../api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setMessage('إذا كان البريد مسجلاً، تم إرسال رمز التحقق. افحص نافذة Backend.');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verifyResetCode(email, code);
      setTempToken(data.access_token);
      setMessage('تم التحقق. أدخل كلمة المرور الجديدة.');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(tempToken, password);
      setMessage('تم تحديث كلمة المرور. سيتم توجيهك لتسجيل الدخول...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 استعادة كلمة المرور</h1>

        {/* Progress */}
        <div style={styles.progress}>
          <div style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}>1</div>
          <div style={styles.line} />
          <div style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}>2</div>
          <div style={styles.line} />
          <div style={{ ...styles.step, ...(step >= 3 ? styles.stepActive : {}) }}>3</div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <p style={styles.label}>أدخل بريدك الإلكتروني</p>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </form>
        )}

        {/* Step 2: Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <p style={styles.label}>أدخل الرمز المُرسل</p>
            <input
              type="text"
              placeholder="الرمز (6 أرقام)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
              maxLength="6"
              pattern="\d{6}"
              required
            />
            <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
              {loading ? 'جاري التحقق...' : 'تحقق'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword}>
            <p style={styles.label}>أدخل كلمة المرور الجديدة</p>
            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        )}

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
  title: { margin: '0 0 20px', textAlign: 'center', color: '#1a223a', fontSize: '22px' },
  progress: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '8px' },
  step: { width: '32px', height: '32px', borderRadius: '50%', background: '#e0e0e0', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
  stepActive: { background: '#1a223a', color: '#fff' },
  line: { width: '30px', height: '2px', background: '#e0e0e0' },
  label: { color: '#555', fontSize: '14px', marginBottom: '12px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', textAlign: 'center' },
  button: { width: '100%', padding: '12px', background: '#1a223a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { width: '100%', padding: '12px', background: '#999', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed' },
  error: { background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  success: { background: '#efe', color: '#070', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  links: { marginTop: '24px', textAlign: 'center' },
  link: { color: '#3498db', textDecoration: 'none', fontSize: '14px' },
};