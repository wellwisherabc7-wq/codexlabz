import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ClientLayout from '../components/layout/ClientLayout';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import Clients from '../pages/admin/Clients';
import ClientDetails from '../pages/admin/ClientDetails';
import Projects from '../pages/admin/Projects';
import AdminProjectDetails from '../pages/admin/ProjectDetails';
import ClientDashboard from '../pages/client/Dashboard';
import ClientProjectDetails from '../pages/client/ProjectDetails';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

function HomeRedirect() {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['ADMIN']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetails />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<AdminProjectDetails />} />
      </Route>

      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['CLIENT']}>
              <ClientLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects/:id" element={<ClientProjectDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
