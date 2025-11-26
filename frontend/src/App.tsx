import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Catalog from './components/pages/Catalog';
import Dashboard from './components/pages/Dashboard';
import Settings from './components/pages/Settings';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminDashboard from './components/pages/AdminDashboard';
import { User } from './types';
import SupportBubble from './components/ui/SupportBubble';

export const AppContext = React.createContext<{
  currentUser: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
} | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mibotpro_token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('mibotpro_token');
    localStorage.removeItem('mibotpro_user');
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('mibotpro_token');
    const storedUser = localStorage.getItem('mibotpro_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = (user: User, token: string) => {
    localStorage.setItem('mibotpro_token', token);
    localStorage.setItem('mibotpro_user', JSON.stringify(user));
    setToken(token);
    setCurrentUser(user);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      currentUser,
      token,
      login,
      logout
    }}>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-light font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/catalog" replace />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                 <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />

            </Routes>
          </main>
          <Footer />
          <SupportBubble />
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
