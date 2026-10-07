// ═══════════════════════════════════════════════
//  src/pages/Users.jsx
//  User Management
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getUsers,
  addUser,
  updateUser,
  changeUserRole,
  toggleUserActive,
  deleteUser,
  getUser,
  clearSession,
} from '../api';

const ROLES = ['developer', 'owner', 'org_admin', 'store_admin', 'employee'];

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser] = useState(getUser());

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    full_name: '',
    role: 'employee',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data.data || []);
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
    setFormData({
      id: crypto.randomUUID(), // توليد UUID تلقائي
      email: '',
      full_name: '',
      role: 'employee',
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      id: user.id,
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editingId) {
        // تحديث: تجاهل id
        const { id, ...updates } = formData;
        if (!updates.password) delete updates.password;
        await updateUser(editingId, updates);
      } else {
        // إنشاء: يتطلب id + email + role + password
        if (!formData.password) {
          throw new Error('كلمة المرور مطلوبة للمستخدم الجديد');
        }
        await addUser(formData);
      }
      handleCloseForm();
      await loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await changeUserRole(id, newRole);
      await loadUsers();
    } catch (err) {
      alert('فشل تغيير الدور: ' + err.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await toggleUserActive(user.id, !user.is_active);
      await loadUsers();
    } catch (err) {
      alert('فشل التغيير: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف المستخدم؟')) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      alert('فشل الحذف: ' + err.message);
    }
  };

  const isCurrentUser = (id) => id === currentUser?.id;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>👤 المستخدمون</h1>
          <p style={styles.headerSubtitle}>
            مرحباً، {currentUser?.user_metadata?.full_name || currentUser?.email}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          تسجيل خروج
        </button>
      </div>

      <div style={styles.nav}>
  <Link to="/products" style={styles.navLink}>📦 المنتجات</Link>
  <Link to="/customers" style={styles.navLink}>👥 العملاء</Link>
  <Link to="/users" style={{ ...styles.navLink, ...styles.navActive }}>
    👤 المستخدمون
  </Link>
  <Link to="/audit" style={styles.navLink}>📋 السجل</Link>
  <Link to="/backups" style={styles.navLink}>💾 النسخ</Link>
  <Link to="/settings/2fa" style={styles.navLink}>🔐 2FA</Link>
</div>

      <div style={styles.content}>
        <div style={styles.toolbar}>
          <div style={styles.counter}>{users.length} مستخدم</div>
          <button onClick={handleOpenAdd} style={styles.addButton}>
            ➕ إضافة مستخدم
          </button>
        </div>

        {loading && <p style={styles.loading}>⏳ جاري التحميل...</p>}
        {error && <div style={styles.error}>❌ {error}</div>}

        {!loading && users.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>البريد</th>
                <th style={styles.th}>الدور</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>
                    <strong>{u.full_name || '—'}</strong>
                    {isCurrentUser(u.id) && (
                      <span style={styles.badge}>أنت</span>
                    )}
                  </td>
                  <td style={styles.tdMono}>{u.email}</td>
                  <td style={styles.td}>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      style={styles.select}
                      disabled={isCurrentUser(u.id)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={isCurrentUser(u.id)}
                      style={{
                        ...styles.statusButton,
                        background: u.is_active ? '#27ae60' : '#95a5a6',
                      }}
                    >
                      {u.is_active ? '✅ نشط' : '⛔ معطل'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleOpenEdit(u)} style={styles.editButton}>✏️</button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={isCurrentUser(u.id)}
                      style={{
                        ...styles.deleteButton,
                        opacity: isCurrentUser(u.id) ? 0.5 : 1,
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && users.length === 0 && (
          <div style={styles.empty}>لا يوجد مستخدمون</div>
        )}
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingId ? '✏️ تعديل مستخدم' : '➕ إضافة مستخدم'}
            </h2>

            {formError && <div style={styles.error}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>البريد الإلكتروني *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                required
                disabled={!!editingId}
              />

              <label style={styles.label}>الاسم الكامل</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                style={styles.input}
              />

              <label style={styles.label}>الدور *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={styles.input}
                required
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <label style={styles.label}>
                {editingId ? 'كلمة المرور (اتركها فارغة إن لم تُرِد التغيير)' : 'كلمة المرور *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                required={!editingId}
              />

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  style={styles.cancelButton}
                  disabled={submitting}
                >
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
    maxWidth: '1100px', margin: '0 auto 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1a223a', color: '#fff', padding: '20px 24px', borderRadius: '12px',
  },
  headerTitle: { margin: '0 0 4px', fontSize: '22px' },
  headerSubtitle: { margin: 0, fontSize: '14px', opacity: 0.8 },
  logoutButton: {
    padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  nav: { maxWidth: '1100px', margin: '0 auto 20px', display: 'flex', gap: '8px' },
  navLink: {
    padding: '10px 20px', background: '#fff', color: '#1a223a',
    textDecoration: 'none', borderRadius: '8px', fontSize: '14px',
    border: '1px solid #e0e0e0', fontWeight: 'bold',
  },
  navActive: { background: '#1a223a', color: '#fff', borderColor: '#1a223a' },
  content: { maxWidth: '1100px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0' },
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
  tdMono: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '13px', fontFamily: 'monospace', color: '#555' },
  select: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', background: '#fff' },
  statusButton: {
    padding: '6px 12px', color: '#fff', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
  },
  badge: {
    marginRight: '8px', padding: '2px 8px', background: '#f39c12',
    color: '#fff', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold',
  },
  editButton: {
    padding: '6px 10px', background: '#3498db', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '4px', fontSize: '12px',
  },
  deleteButton: {
    padding: '6px 10px', background: '#e74c3c', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '32px', borderRadius: '12px', width: '450px', maxWidth: '90%' },
  modalTitle: { margin: '0 0 20px', color: '#1a223a', fontSize: '20px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555', fontWeight: 'bold' },
  input: {
    width: '100%', padding: '10px', marginBottom: '14px',
    border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' },
  cancelButton: { padding: '10px 20px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  saveButton: { padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  footer: { maxWidth: '1100px', margin: '20px auto 0', textAlign: 'center', color: '#999', fontSize: '12px' },
};