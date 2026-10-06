// ═══════════════════════════════════════════════
//  src/pages/Customers.jsx
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getUser,
  clearSession,
} from '../api';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useState(getUser());

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomers();
      setCustomers(data.data || []);
    } catch (err) {
      setError(err.message);
      if (err.message === 'No token') navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ full_name: '', phone: '', email: '' });
    setFormError('');
    setShowForm(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ full_name: '', phone: '', email: '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await addCustomer(formData);
      }
      handleCloseForm();
      await loadCustomers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await deleteCustomer(id);
      await loadCustomers();
    } catch (err) {
      alert('فشل الحذف: ' + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>👥 العملاء</h1>
          <p style={styles.headerSubtitle}>
            مرحباً، {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          تسجيل خروج
        </button>
      </div>

      <div style={styles.nav}>
  <Link to="/products" style={styles.navLink}>📦 المنتجات</Link>
  <Link to="/customers" style={{ ...styles.navLink, ...styles.navActive }}>
    👥 العملاء
  </Link>
  <Link to="/users" style={styles.navLink}>👤 المستخدمون</Link>
  <Link to="/audit" style={styles.navLink}>📋 السجل</Link>
  <Link to="/backups" style={styles.navLink}>💾 النسخ</Link>
</div>

      <div style={styles.content}>
        <div style={styles.toolbar}>
          <div style={styles.counter}>{customers.length} عميل</div>
          <button onClick={handleOpenAdd} style={styles.addButton}>
            ➕ إضافة عميل
          </button>
        </div>

        {loading && <p style={styles.loading}>⏳ جاري التحميل...</p>}
        {error && <div style={styles.error}>❌ {error}</div>}

        {!loading && !error && customers.length === 0 && (
          <div style={styles.empty}>لا يوجد عملاء</div>
        )}

        {!loading && customers.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>الهاتف</th>
                <th style={styles.th}>البريد</th>
                <th style={styles.th}>الرصيد</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}><strong>{c.full_name}</strong></td>
                  <td style={styles.td}>{c.phone || '—'}</td>
                  <td style={styles.tdMono}>{c.email || '—'}</td>
                  <td style={styles.tdMono}>{c.balance || 0}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleOpenEdit(c)} style={styles.editButton}>✏️</button>
                    <button onClick={() => handleDelete(c.id)} style={styles.deleteButton}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingId ? '✏️ تعديل عميل' : '➕ إضافة عميل'}
            </h2>

            {formError && <div style={styles.error}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="الاسم الكامل *"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                style={styles.input}
                required
                autoFocus
              />
              <input
                type="text"
                placeholder="الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={styles.input}
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
              />

              <div style={styles.modalActions}>
                <button type="button" onClick={handleCloseForm} style={styles.cancelButton} disabled={submitting}>
                  إلغاء
                </button>
                <button type="submit" style={styles.saveButton} disabled={submitting}>
                  {submitting ? 'جاري...' : editingId ? 'حفظ' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.footer}>🏢 منصة القمة — Demo v1.0</div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Tahoma, sans-serif', padding: '20px' },
  header: {
    maxWidth: '900px', margin: '0 auto 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1a223a', color: '#fff', padding: '20px 24px', borderRadius: '12px',
  },
  headerTitle: { margin: '0 0 4px', fontSize: '22px' },
  headerSubtitle: { margin: 0, fontSize: '14px', opacity: 0.8 },
  logoutButton: {
    padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  nav: { maxWidth: '900px', margin: '0 auto 20px', display: 'flex', gap: '8px' },
  navLink: {
    padding: '10px 20px', background: '#fff', color: '#1a223a',
    textDecoration: 'none', borderRadius: '8px', fontSize: '14px',
    border: '1px solid #e0e0e0', fontWeight: 'bold',
  },
  navActive: { background: '#1a223a', color: '#fff', borderColor: '#1a223a' },
  content: { maxWidth: '900px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  counter: { padding: '8px 12px', background: '#e8f4fd', color: '#1a5276', borderRadius: '6px', fontSize: '14px' },
  addButton: {
    padding: '10px 20px', background: '#27ae60', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
  },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  error: { background: '#fee', color: '#c00', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'right', padding: '12px', borderBottom: '2px solid #1a223a', fontSize: '13px', color: '#1a223a' },
  td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' },
  tdMono: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '12px', fontFamily: 'monospace', color: '#666' },
  editButton: { padding: '6px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' },
  deleteButton: { padding: '6px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '32px', borderRadius: '12px', width: '400px', maxWidth: '90%' },
  modalTitle: { margin: '0 0 20px', color: '#1a223a', fontSize: '20px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelButton: { padding: '10px 20px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  saveButton: { padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  footer: { maxWidth: '900px', margin: '20px auto 0', textAlign: 'center', color: '#999', fontSize: '12px' },
};