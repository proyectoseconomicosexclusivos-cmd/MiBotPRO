import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../App';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const appContext = useContext(AppContext);

  if (!appContext?.currentUser) {
    // Redirect them to the /login page if not logged in.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;