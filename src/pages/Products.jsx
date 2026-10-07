// ═══════════════════════════════════════════════
//  src/pages/Products.jsx
//  CRUD كامل مع RLS + Navigation
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getUser,
  clearSession,
} from '../api';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useState(getUser());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProducts();
      setProducts(data.data || []);
    } catch (err) {
      setError(err.message);
      if (err.message === 'No token') {
        navigate('/login');
      }
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
    setFormName('');
    setFormError('');
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setFormName(product.name);
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editingId) {
        await updateProduct(editingId, { name: formName });
      } else {
        await addProduct({ name: formName });
      }

      handleCloseForm();
      await loadProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      alert('فشل الحذف: ' + err.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>📦 المنتجات</h1>
          <p style={styles.headerSubtitle}>
            مرحباً، {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          تسجيل خروج
        </button>
      </div>

      {/* Navigation */}
      <div style={styles.nav}>
  <Link to="/products" style={{ ...styles.navLink, ...styles.navActive }}>
    📦 المنتجات
  </Link>
  <Link to="/customers" style={styles.navLink}>
    👥 العملاء
  </Link>
  <Link to="/users" style={styles.navLink}>
    👤 المستخدمون
  </Link>
  <Link to="/audit" style={styles.navLink}>
    📋 السجل
  </Link>
  <Link to="/backups" style={styles.navLink}>
    💾 النسخ
  </Link>
  <Link to="/settings/2fa" style={styles.navLink}>🔐 2FA</Link>
</div>

      {/* User info */}
      <div style={styles.userInfo}>
        <div><strong>الدور:</strong> {user?.role}</div>
        <div>
          <strong>Tenant:</strong>{' '}
          {user?.app_metadata?.tenant_id?.substring(0, 8) || '—'}...
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.toolbar}>
          <div style={styles.counter}>
            {products.length} منتج
          </div>
          <button onClick={handleOpenAdd} style={styles.addButton}>
            ➕ إضافة منتج
          </button>
        </div>

        {loading && <p style={styles.loading}>⏳ جاري التحميل...</p>}
        {error && <div style={styles.error}>❌ {error}</div>}

        {!loading && !error && products.length === 0 && (
          <div style={styles.empty}>لا توجد منتجات لعرضها</div>
        )}

        {!loading && products.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}><strong>{p.name}</strong></td>
                  <td style={styles.tdMono}>{p.id.substring(0, 8)}...</td>
                  <td style={styles.tdMono}>
                    {p.tenant_id?.substring(0, 8) || '—'}...
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      style={styles.editButton}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingId ? '✏️ تعديل منتج' : '➕ إضافة منتج'}
            </h2>

            {formError && <div style={styles.error}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="اسم المنتج"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={styles.input}
                required
                autoFocus
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
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={submitting}
                >
                  {submitting ? 'جاري...' : editingId ? 'حفظ' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        🏢 منصة القمة — Qemma Platform Demo v1.0
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f2f5',
    fontFamily: 'Tahoma, sans-serif',
    padding: '20px',
  },
  header: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#1a223a',
    color: '#fff',
    padding: '20px 24px',
    borderRadius: '12px',
  },
  headerTitle: { margin: '0 0 4px', fontSize: '22px' },
  headerSubtitle: { margin: 0, fontSize: '14px', opacity: 0.8 },
  logoutButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  nav: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    padding: '10px 20px',
    background: '#fff',
    color: '#1a223a',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    fontWeight: 'bold',
  },
  navActive: {
    background: '#1a223a',
    color: '#fff',
    borderColor: '#1a223a',
  },
  userInfo: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    padding: '12px 20px',
    background: '#fff',
    borderRadius: '8px',
    display: 'flex',
    gap: '24px',
    fontSize: '13px',
    color: '#555',
    border: '1px solid #e0e0e0',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e0e0e0',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  counter: {
    padding: '8px 12px',
    background: '#e8f4fd',
    color: '#1a5276',
    borderRadius: '6px',
    fontSize: '14px',
  },
  addButton: {
    padding: '10px 20px',
    background: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'right',
    padding: '12px',
    borderBottom: '2px solid #1a223a',
    fontSize: '13px',
    color: '#1a223a',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
  tdMono: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#666',
  },
  editButton: {
    padding: '6px 10px',
    background: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '4px',
    fontSize: '12px',
  },
  deleteButton: {
    padding: '6px 10px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    width: '400px',
    maxWidth: '90%',
  },
  modalTitle: {
    margin: '0 0 20px',
    color: '#1a223a',
    fontSize: '20px',
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
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#95a5a6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  saveButton: {
    padding: '10px 20px',
    background: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  footer: {
    maxWidth: '900px',
    margin: '20px auto 0',
    textAlign: 'center',
    color: '#999',
    fontSize: '12px',
  },
};