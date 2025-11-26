import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../App';

interface AdminProtectedRouteProps {
  children: React.ReactElement;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const appContext = useContext(AppContext);
  const currentUser = appContext?.currentUser;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'ADMIN') {
    // If a non-admin user tries to access an admin route, send them to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
