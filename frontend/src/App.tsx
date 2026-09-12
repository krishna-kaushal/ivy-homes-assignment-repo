import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Home, Key, Heart, Building, LayoutDashboard, LogOut } from 'lucide-react';
import { getToken, api } from './api';
import Login from './pages/Login';
import Listings from './pages/Listings';
import Rentals from './pages/Rentals';
import Projects from './pages/Projects';
import Favourites from './pages/Favourites';
import Insights from './pages/Insights';
import ListingDetail from './pages/ListingDetail';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

const Navigation = () => {
  const location = useLocation();
  const token = getToken();
  
  if (!token) return null;

  const handleLogout = () => {
    api.logout();
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', label: 'Listings', icon: Home },
    { path: '/rentals', label: 'Rentals', icon: Key },
    { path: '/projects', label: 'Projects', icon: Building },
    { path: '/favourites', label: 'Favourites', icon: Heart },
    { path: '/insights', label: 'Insights', icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold text-blue-600">Ivy Homes</span>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Listings /></PrivateRoute>} />
            <Route path="/listing/:id" element={<PrivateRoute><ListingDetail /></PrivateRoute>} />
            <Route path="/rentals" element={<PrivateRoute><Rentals /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
            <Route path="/favourites" element={<PrivateRoute><Favourites /></PrivateRoute>} />
            <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
