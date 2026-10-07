import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import TwoFactorVerify from './pages/TwoFactorVerify';
import TwoFactorSetup from './pages/TwoFactorSetup';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Users from './pages/Users';
import AuditLog from './pages/AuditLog';
import Backups from './pages/Backups';
import { getToken } from './api';

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/2fa-verify" element={<TwoFactorVerify />} />
        <Route path="/settings/2fa" element={<PrivateRoute><TwoFactorSetup /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/audit" element={<PrivateRoute><AuditLog /></PrivateRoute>} />
        <Route path="/backups" element={<PrivateRoute><Backups /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}