import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, MessageSquare, LogOut, User, MapPin, Package, AlertTriangle, Users, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertAPI, messageAPI } from '../../lib/api';

interface UnreadCountResponse {
  count: number;
}

interface User {
  firstName: string;
  lastName: string;
  loginId?: string;
  role: string;
  agency?: {
    _id: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth() as AuthContextType;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.agency && typeof user.agency === 'object' && user.agency._id) {
      const fetchUnreadCounts = async () => {
        try {
          if (!user?.agency?._id) return;
          
          const agencyId = user.agency._id;
          const messageCount = await messageAPI.getUnreadCount(agencyId);
          const alertCount = await alertAPI.getUnreadAlertCount(agencyId);
          
          if (typeof messageCount === 'number') setUnreadMessages(messageCount);
          if (typeof alertCount === 'number') setUnreadAlerts(alertCount);
        } catch (error) {
          console.error('Error fetching unread counts:', error);
          // Don't show error to user, just log it
          setUnreadMessages(0);
          setUnreadAlerts(0);
        }
      };

      fetchUnreadCounts();
      // Setup polling for unread counts (every 30 seconds)
      const interval = setInterval(fetchUnreadCounts, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/map', label: 'Map', icon: <MapPin size={18} /> },
    { path: '/inventory', label: 'Inventory', icon: <Package size={18} /> },
    { path: '/agencies', label: 'Agencies' },
    { path: '/alerts', label: 'Alerts', icon: <AlertTriangle size={18} />, count: unreadAlerts },
    { path: '/tracking', label: 'Tracking', icon: <Truck size={18} /> },
    { path: '/messages', label: 'Messages', icon: <MessageSquare size={18} />, count: unreadMessages },
  ];

  // Add Users menu item for managers and admins
  if (user && (user.role === 'manager' || user.role === 'admin')) {
    navItems.push({ path: '/users', label: 'Users', icon: <Users size={18} /> });
  }

  return (

    <nav className="fixed top-0 left-0 right-0 bg-primary-800 text-white shadow-md z-50 pt-4" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold tracking-tight">ResQ Bubble</span>
            </Link>
          </div>
          
          {isAuthenticated && (
            <>
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                        isActive(item.path)
                          ? 'bg-primary-700 text-white'
                          : 'text-white hover:bg-primary-700 hover:text-white'
                      }`}
                    >
                      {item.icon && <span className="mr-1">{item.icon}</span>}
                      {item.label}
                      {item.count && item.count > 0 && (
                        <span className="ml-1 bg-secondary-500 text-white rounded-full px-2 py-0.5 text-xs">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="relative">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center max-w-xs bg-primary-700 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white"
                    >
                      <User size={18} className="mr-2" />
                      <div className="text-left">
                        <div className="truncate">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-primary-200 truncate">
                          {user?.role} {user?.loginId && `• ${user.loginId}`}
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="ml-3 p-1 rounded-full text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
          
          {!isAuthenticated && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-primary-300 bg-transparent hover:bg-primary-700 hover:text-white"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
          
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-800 pb-3 pt-2 absolute top-16 left-0 right-0 shadow-lg">
          <div className="px-2 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      isActive(item.path)
                        ? 'bg-primary-700 text-white'
                        : 'text-white hover:bg-primary-700 hover:text-white'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                    {item.count && item.count > 0 && (
                      <span className="ml-2 bg-secondary-500 text-white rounded-full px-2 py-0.5 text-xs">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
                <div className="pt-4 pb-3 border-t border-primary-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-600 rounded-full p-1">
                        <User size={24} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm font-medium leading-none text-primary-300 mt-1">
                        {user?.role}
                      </div>
                      {user?.loginId && (
                        <div className="text-xs font-medium leading-none text-primary-300 mt-1">
                          ID: {user.loginId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                      onClick={closeMobileMenu}
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>

  );
};

export default Navbar;