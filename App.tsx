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
import { UserConfiguration, AppSettings, User } from './types';
import { getCurrentUser, mockUsers } from './services/authService';
import SupportBubble from './components/ui/SupportBubble';
import BotRunner from './components/pages/BotRunner';

export const AppContext = React.createContext<{
  userConfigurations: UserConfiguration[];
  addUserConfiguration: (config: Omit<UserConfiguration, 'id' | 'createdAt' | 'status' | 'userId'>) => void;
  updateUserConfiguration: (id: string, updates: Partial<UserConfiguration>) => void;
  deleteUserConfiguration: (id: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
} | null>(null);

const defaultSettings: AppSettings = {
  n8nWebhookUrl: '',
  geminiApiKey: '',
};

const App: React.FC = () => {
  const [userConfigurations, setUserConfigurations] = useState<UserConfiguration[]>(() => {
    try {
      const saved = localStorage.getItem('mibotpro_userConfigurations');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('mibotpro_appSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch { return defaultSettings; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    // Initialize mock users if they don't exist in localStorage
    if (!localStorage.getItem('mibotpro_users')) {
      localStorage.setItem('mibotpro_users', JSON.stringify(mockUsers));
    }
  }, []);

  useEffect(() => {
    // Persist configurations to localStorage whenever they change
    try {
      localStorage.setItem('mibotpro_userConfigurations', JSON.stringify(userConfigurations));
    } catch (error) {
      console.error("Failed to save configurations:", error);
    }
  }, [userConfigurations]);

  useEffect(() => {
    // Persist settings to localStorage whenever they change
    try {
      localStorage.setItem('mibotpro_appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [settings]);

  const loginUser = (user: User) => {
    localStorage.setItem('mibotpro_currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logoutUser = useCallback(() => {
    localStorage.removeItem('mibotpro_currentUser');
    setCurrentUser(null);
  }, []);

  const addUserConfiguration = (config: Omit<UserConfiguration, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!currentUser) return;
    const newConfig: UserConfiguration = {
      ...config,
      id: `config_${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'pending_payment',
    };
    setUserConfigurations(prev => [...prev, newConfig]);
  };

  const updateUserConfiguration = (id: string, updates: Partial<UserConfiguration>) => {
    setUserConfigurations(prev => 
      prev.map(config => config.id === id ? { ...config, ...updates } : config)
    );
  };
  
  const deleteUserConfiguration = (id: string) => {
    setUserConfigurations(prev => prev.filter(config => config.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Filter configurations to only show the ones for the currently logged-in user
  const currentUserConfigurations = userConfigurations.filter(c => c.userId === currentUser?.id);

  return (
    <AppContext.Provider value={{ 
      userConfigurations: currentUserConfigurations, 
      addUserConfiguration, 
      updateUserConfiguration, 
      deleteUserConfiguration, 
      settings, 
      updateSettings,
      currentUser,
      login: loginUser,
      logout: logoutUser
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
               <Route path="/bot/:configId" element={
                <ProtectedRoute>
                  <BotRunner />
                </ProtectedRoute>
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