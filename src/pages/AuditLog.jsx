// ═══════════════════════════════════════════════
//  src/pages/AuditLog.jsx
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../socket';
import { getAuditLog, getAuditStats, getUser, clearSession } from '../api';

export default function AuditLog() {
  const navigate = useNavigate();
  const [user] = useState(getUser());
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ table: '', action: '' });
  const [expanded, setExpanded] = useState(null);

  // ─── Socket (مرة واحدة) ───
useEffect(() => {
  const socket = connectSocket();
  if (socket) {
    socket.on('audit:new', (data) => {
      console.log('🔔 New audit event:', data);
      loadData();
    });
  }
  return () => disconnectSocket();
}, []);

// ─── Data Loading (عند تغيير الفلتر) ───
useEffect(() => {
  loadData();
}, [filters.table, filters.action]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [logsData, statsData] = await Promise.all([
        getAuditLog(filters),
        getAuditStats(),
      ]);
      setLogs(logsData.data || []);
      setStats(statsData);
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

  const actionColors = {
    create: '#27ae60',
    update: '#3498db',
    delete: '#e74c3c',
    'update-role': '#9b59b6',
    activate: '#27ae60',
    deactivate: '#f39c12',
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>📋 سجل العمليات</h1>
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
        <Link to="/audit" style={{ ...styles.navLink, ...styles.navActive }}>📋 السجل</Link>
        <Link to="/backups" style={styles.navLink}>💾 النسخ</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>آخر 24 ساعة</div>
            <div style={styles.statValue}>{stats.last_24h}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>حسب الإجراء</div>
            <div style={styles.statBreakdown}>
              {stats.by_action?.slice(0, 3).map((a) => (
                <div key={a.action} style={styles.statItem}>
                  <span style={{ color: actionColors[a.action] || '#666' }}>●</span>
                  <span style={styles.statItemLabel}>{a.action}</span>
                  <strong>{a.count}</strong>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>حسب الجدول</div>
            <div style={styles.statBreakdown}>
              {stats.by_table?.slice(0, 3).map((t) => (
                <div key={t.table_name} style={styles.statItem}>
                  <span>📄</span>
                  <span style={styles.statItemLabel}>{t.table_name}</span>
                  <strong>{t.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.content}>
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="فلترة حسب الجدول"
            value={filters.table}
            onChange={(e) => setFilters({ ...filters, table: e.target.value })}
            style={styles.filterInput}
          />
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            style={styles.filterInput}
          >
            <option value="">كل الإجراءات</option>
            <option value="create">إنشاء</option>
            <option value="update">تعديل</option>
            <option value="delete">حذف</option>
            <option value="update-role">تغيير دور</option>
            <option value="activate">تفعيل</option>
            <option value="deactivate">تعطيل</option>
          </select>
          <button onClick={loadData} style={styles.refreshButton}>🔄 تحديث</button>
          <div style={styles.counter}>{logs.length} عملية</div>
        </div>

        {loading && <p style={styles.loading}>⏳ جاري التحميل...</p>}
        {error && <div style={styles.error}>❌ {error}</div>}

        {!loading && logs.length === 0 && (
          <div style={styles.empty}>لا توجد عمليات مسجّلة</div>
        )}

        {!loading && logs.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>التاريخ</th>
                <th style={styles.th}>المستخدم</th>
                <th style={styles.th}>الإجراء</th>
                <th style={styles.th}>الجدول</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <>
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.tdSmall}>{formatDate(log.created_at)}</td>
                    <td style={styles.tdSmall}>{log.user_email || '—'}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: actionColors[log.action] || '#666',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={styles.tdMono}>{log.table_name}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        style={styles.expandButton}
                      >
                        {expanded === log.id ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr>
                      <td colSpan="6" style={styles.expandedCell}>
                        <div style={styles.expandedContent}>
                          <div style={styles.expandedSection}>
                            <strong>📌 Record ID:</strong>
                            <code style={styles.code}>{log.record_id || '—'}</code>
                          </div>
                          {log.old_data && (
                            <div style={styles.expandedSection}>
                              <strong>📤 قبل:</strong>
                              <pre style={styles.pre}>{JSON.stringify(log.old_data, null, 2)}</pre>
                            </div>
                          )}
                          {log.new_data && (
                            <div style={styles.expandedSection}>
                              <strong>📥 بعد:</strong>
                              <pre style={styles.pre}>{JSON.stringify(log.new_data, null, 2)}</pre>
                            </div>
                          )}
                          <div style={styles.expandedSection}>
                            <strong>🌐 IP:</strong> {log.ip_address || '—'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
  header: { maxWidth: '1200px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a223a', color: '#fff', padding: '20px 24px', borderRadius: '12px' },
  headerTitle: { margin: '0 0 4px', fontSize: '22px' },
  headerSubtitle: { margin: 0, fontSize: '14px', opacity: 0.8 },
  logoutButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  nav: { maxWidth: '1200px', margin: '0 auto 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navLink: { padding: '10px 20px', background: '#fff', color: '#1a223a', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', border: '1px solid #e0e0e0', fontWeight: 'bold' },
  navActive: { background: '#1a223a', color: '#fff', borderColor: '#1a223a' },
  statsGrid: { maxWidth: '1200px', margin: '0 auto 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e0e0e0' },
  statLabel: { fontSize: '13px', color: '#666', marginBottom: '12px' },
  statValue: { fontSize: '32px', fontWeight: 'bold', color: '#1a223a' },
  statBreakdown: { display: 'flex', flexDirection: 'column', gap: '8px' },
  statItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  statItemLabel: { flex: 1, color: '#666', fontFamily: 'monospace' },
  content: { maxWidth: '1200px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  filterInput: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
  refreshButton: { padding: '8px 16px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  counter: { marginRight: 'auto', padding: '8px 12px', background: '#e8f4fd', color: '#1a5276', borderRadius: '6px', fontSize: '14px' },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  error: { background: '#fee', color: '#c00', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'right', padding: '12px', borderBottom: '2px solid #1a223a', fontSize: '13px', color: '#1a223a' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '12px', fontSize: '14px' },
  tdSmall: { padding: '12px', fontSize: '12px', color: '#666' },
  tdMono: { padding: '12px', fontSize: '13px', fontFamily: 'monospace', color: '#1a223a' },
  badge: { display: 'inline-block', padding: '3px 10px', color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' },
  expandButton: { padding: '4px 10px', background: '#f0f2f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  expandedCell: { padding: '0', background: '#f8f9fa' },
  expandedContent: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  expandedSection: { fontSize: '13px', color: '#333' },
  code: { background: '#e8e8e8', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  pre: { background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '200px', marginTop: '8px' },
  footer: { maxWidth: '1200px', margin: '20px auto 0', textAlign: 'center', color: '#999', fontSize: '12px' },
};