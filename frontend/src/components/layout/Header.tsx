import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    appContext?.logout();
    navigate('/login');
  };

  const activeLinkClass = "text-primary-500 border-b-2 border-primary-500";
  const inactiveLinkClass = "text-gray-600 hover:text-primary-500 transition-colors";

  const linkClasses = ({ isActive }: { isActive: boolean }) => 
    `${isActive ? activeLinkClass : inactiveLinkClass} inline-flex items-center px-1 pt-1 text-sm font-medium`;
  
  const isAdmin = appContext?.currentUser?.role === 'ADMIN';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center space-x-2">
               <div className="text-primary-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
               </div>
              <span className="text-2xl font-bold text-gray-800">MiBotPro</span>
            </NavLink>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/catalog" className={linkClasses}>
              Catálogo de Bots
            </NavLink>
            {appContext?.currentUser && (
              <>
                {isAdmin ? (
                  <NavLink to="/admin/dashboard" className={linkClasses}>
                    Panel de Admin
                  </NavLink>
                ) : (
                  <NavLink to="/dashboard" className={linkClasses}>
                    Mi Panel
                  </NavLink>
                )}
                <NavLink to="/settings" className={linkClasses}>
                  Ajustes
                </NavLink>
              </>
            )}
          </nav>
          <div className="hidden md:flex items-center space-x-2">
            {appContext?.currentUser ? (
              <>
                <span className="text-sm text-gray-600">Hola, {appContext.currentUser.name}</span>
                <Button onClick={handleLogout} variant="secondary" className="!py-1.5 !px-3">
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="secondary" className="!py-1.5 !px-3">
                  Iniciar Sesión
                </Button>
                <Button onClick={() => navigate('/register')} className="!py-1.5 !px-3">
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
