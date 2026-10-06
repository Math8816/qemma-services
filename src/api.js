// ═══════════════════════════════════════════════
//  src/api.js
//  كل طلبات الـ API (عبر Vite Proxy)
// ═══════════════════════════════════════════════

// ─── حفظ الجلسة ───
export function saveToken(token, user) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem('access_token');
}

export function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

// ─── تسجيل الدخول ───
export async function login(email, password) {
  const res = await fetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error_description || 'Login failed');
  }

  saveToken(data.access_token, data.user);
  return data;
}

// ─── جلب المنتجات (RLS-aware) ───
export async function getProducts() {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/products/rls/list', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to load products');
  }

  return data;
}

// ─── إضافة منتج ───
export async function addProduct(product) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/products/rls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add product');
  return data;
}

// ─── تحديث منتج ───
export async function updateProduct(id, product) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/products/rls/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data;
}

// ─── حذف منتج ───
export async function deleteProduct(id) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/products/rls/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete product');
  return data;
}

// ═══════════════════════════════════════════════
//  Customers API (Generic CRUD)
// ═══════════════════════════════════════════════

export async function getCustomers() {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/generic/customers', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load customers');
  return data;
}

export async function addCustomer(customer) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/generic/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customer),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add customer');
  return data;
}

export async function updateCustomer(id, customer) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/generic/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customer),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update customer');
  return data;
}

export async function deleteCustomer(id) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/generic/customers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete customer');
  return data;
}

// ═══════════════════════════════════════════════
//  Users API
// ═══════════════════════════════════════════════

export async function getUsers() {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/users', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load users');
  return data;
}

export async function addUser(user) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add user');
  return data;
}

export async function updateUser(id, user) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user');
  return data;
}

export async function changeUserRole(id, role) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/users/${id}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change role');
  return data;
}

export async function toggleUserActive(id, is_active) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/users/${id}/active`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_active }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle status');
  return data;
}

export async function deleteUser(id) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete user');
  return data;
}

// ═══════════════════════════════════════════════
//  Signup API
// ═══════════════════════════════════════════════

export async function signup(email, password, full_name) {
  const res = await fetch('/auth/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Signup failed');
  return data;
}

// ═══════════════════════════════════════════════
//  Password Reset API
// ═══════════════════════════════════════════════

export async function requestPasswordReset(email) {
  const res = await fetch('/auth/v1/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Request failed');
  return data;
}

export async function verifyResetCode(email, code) {
  const res = await fetch('/auth/v1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Verify failed');
  return data;
}

export async function updatePassword(tempToken, password) {
  const res = await fetch('/auth/v1/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Update failed');
  return data;
}

// ═══════════════════════════════════════════════
//  Audit Log API
// ═══════════════════════════════════════════════

export async function getAuditLog(filters = {}) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const params = new URLSearchParams();
  Object.keys(filters).forEach((k) => {
    if (filters[k]) params.append(k, filters[k]);
  });

  const query = params.toString();
  const res = await fetch(`/api/audit${query ? '?' + query : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load audit log');
  return data;
}

export async function getAuditStats() {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/api/audit/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load stats');
  return data;
}

// ═══════════════════════════════════════════════
//  Storage API (Backups)
// ═══════════════════════════════════════════════

export async function getBuckets() {
  const res = await fetch('/storage/v1/buckets');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load buckets');
  return data;
}

export async function listFiles(bucket, prefix = '') {
  const token = getToken();
  if (!token) throw new Error('No token');

  const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
  const res = await fetch(`/storage/v1/list/${bucket}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list files');
  return data;
}

export async function uploadFile(bucket, file) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/storage/v1/object/${bucket}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload');
  return data;
}

export async function deleteFile(bucket, fileName) {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`/storage/v1/object/${bucket}/${fileName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete');
  return data;
}

export function getFileUrl(bucket, fileName) {
  return `/storage/v1/object/${bucket}/${fileName}`;
}

// ═══════════════════════════════════════════════
//  Backup API
// ═══════════════════════════════════════════════

export async function createBackup() {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch('/storage/v1/backup/create', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create backup');
  return data;
}