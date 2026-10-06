// ═══════════════════════════════════════════════
//  src/pages/Backups.jsx
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listFiles, deleteFile, getFileUrl, createBackup, getUser, clearSession } from '../api';

export default function Backups() {
  const navigate = useNavigate();
  const [user] = useState(getUser());
  const [creating, setCreating] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listFiles('backups');
      setFiles(data.data || []);
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

  const handleDelete = async (fileName) => {
    if (!window.confirm(`حذف "${fileName}"؟`)) return;
    try {
      await deleteFile('backups', fileName);
      await loadFiles();
    } catch (err) {
      alert('فشل الحذف: ' + err.message);
    }
  };

  const handleCreateBackup = async () => {
  setCreating(true);
  try {
    await createBackup();
    await loadFiles();
    alert('✅ تم إنشاء النسخة الاحتياطية');
  } catch (err) {
    alert('❌ فشل الإنشاء: ' + err.message);
  } finally {
    setCreating(false);
  }
};

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>💾 النسخ الاحتياطية</h1>
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
        <Link to="/products" style={styles.navLink}>📦 المنتجات</Link>
        <Link to="/customers" style={styles.navLink}>👥 العملاء</Link>
        <Link to="/users" style={styles.navLink}>👤 المستخدمون</Link>
        <Link to="/audit" style={styles.navLink}>📋 السجل</Link>
        <Link to="/backups" style={{ ...styles.navLink, ...styles.navActive }}>💾 النسخ</Link>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>عدد النسخ</div>
          <div style={styles.statValue}>{files.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>إجمالي الحجم</div>
          <div style={styles.statValue}>{formatSize(totalSize)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>آخر نسخة</div>
          <div style={styles.statValueSmall}>
            {files.length > 0 ? formatDate(files[0].created_at) : '—'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.toolbar}>
  <div style={styles.counter}>{files.length} نسخة احتياطية</div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={handleCreateBackup}
      disabled={creating}
      style={{
        ...styles.refreshButton,
        background: creating ? '#999' : '#27ae60',
      }}
    >
      {creating ? '⏳ جاري الإنشاء...' : '➕ إنشاء نسخة جديدة'}
    </button>
    <button onClick={loadFiles} style={styles.refreshButton}>🔄 تحديث</button>
  </div>
</div>

        {loading && <p style={styles.loading}>⏳ جاري التحميل...</p>}
        {error && <div style={styles.error}>❌ {error}</div>}

        {!loading && files.length === 0 && (
          <div style={styles.empty}>
            <p>لا توجد نسخ احتياطية</p>
            <p style={styles.emptyHint}>
              شغّل: <code>node scripts/backup.js</code> في مجلد Backend
            </p>
          </div>
        )}

        {!loading && files.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>الحجم</th>
                <th style={styles.th}>التاريخ</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f, i) => (
                <tr key={f.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.tdMono}>{f.name}</td>
                  <td style={styles.td}>{formatSize(f.size)}</td>
                  <td style={styles.tdSmall}>{formatDate(f.created_at)}</td>
                  <td style={styles.td}>
                    <a
                      href={getFileUrl('backups', f.name)}
                      download
                      style={styles.downloadButton}
                    >
                      ⬇️ تنزيل
                    </a>
                    <button
                      onClick={() => handleDelete(f.name)}
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

      <div style={styles.footer}>🏢 منصة القمة — Demo v1.0</div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Tahoma, sans-serif', padding: '20px' },
  header: { maxWidth: '1100px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a223a', color: '#fff', padding: '20px 24px', borderRadius: '12px' },
  headerTitle: { margin: '0 0 4px', fontSize: '22px' },
  headerSubtitle: { margin: 0, fontSize: '14px', opacity: 0.8 },
  logoutButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  nav: { maxWidth: '1100px', margin: '0 auto 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navLink: { padding: '10px 20px', background: '#fff', color: '#1a223a', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', border: '1px solid #e0e0e0', fontWeight: 'bold' },
  navActive: { background: '#1a223a', color: '#fff', borderColor: '#1a223a' },
  statsGrid: { maxWidth: '1100px', margin: '0 auto 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e0e0e0' },
  statLabel: { fontSize: '13px', color: '#666', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: '#1a223a' },
  statValueSmall: { fontSize: '14px', fontWeight: 'bold', color: '#1a223a', fontFamily: 'monospace' },
  content: { maxWidth: '1100px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  counter: { padding: '8px 12px', background: '#e8f4fd', color: '#1a5276', borderRadius: '6px', fontSize: '14px' },
  refreshButton: { padding: '8px 16px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  error: { background: '#fee', color: '#c00', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  emptyHint: { marginTop: '12px', fontSize: '13px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'right', padding: '12px', borderBottom: '2px solid #1a223a', fontSize: '13px', color: '#1a223a' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '12px', fontSize: '14px' },
  tdSmall: { padding: '12px', fontSize: '12px', color: '#666', fontFamily: 'monospace' },
  tdMono: { padding: '12px', fontSize: '12px', fontFamily: 'monospace', color: '#1a223a' },
  downloadButton: { padding: '6px 12px', background: '#27ae60', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', marginLeft: '4px', display: 'inline-block' },
  deleteButton: { padding: '6px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  footer: { maxWidth: '1100px', margin: '20px auto 0', textAlign: 'center', color: '#999', fontSize: '12px' },
};