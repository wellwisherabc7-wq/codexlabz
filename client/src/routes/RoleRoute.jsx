import { Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const dest = user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
}
