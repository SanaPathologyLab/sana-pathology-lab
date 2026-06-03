import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Search, MapPin, Phone, Mail, Menu, X } from 'lucide-react';
import Logo from './Logo';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render layout elements on the print route
  if (location.pathname.includes('/print/')) {
    return <div className="print-only bg-white">{children}</div>;
  }

  let links = [];
  if (user?.userType === 'PATIENT') {
    links = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'My Reports', path: '/reports' }
    ];
  } else if (user?.userType === 'DOCTOR') {
    links = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'My Patients', path: '/reports' }
    ];
  } else {
    links = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Patients', path: '/patients' },
      { name: 'Doctors', path: '/doctors' },
      { name: 'Dr. Analytics', path: '/doctors/analytics' },
      { name: 'Tests', path: '/tests' },
      { name: 'Reports', path: '/reports' },
      { name: 'Billing', path: '/billing' },
      { name: 'Appointments', path: '/appointments' },
      { name: 'Inventory', path: '/inventory' },
      { name: 'Staff', path: '/staff' },
      { name: 'Settings', path: '/settings' },
    ];
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Top utility bar */}
      <div className="bg-[#00488d] text-white text-xs py-1 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Datawali Road, Near Aara Machine, Hayat Nagar</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> 6396786939 / 6397240575</span>
            <span>|</span>
            <span className="font-semibold">{user?.name} ({user?.role})</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Logo className="w-12 h-12 mr-2" />
              <div className="text-[#00488d] font-extrabold text-2xl tracking-tight flex items-center mr-6">
                SANA PATHOLOGY LAB
              </div>
            </div>

            {/* Global Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-sm mr-4">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Global Search (Patients, Reports)..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      navigate('/patients?search=' + encodeURIComponent(e.target.value));
                    }
                  }}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors nav-link ${
                      isActive ? 'text-[#00488d] active' : 'text-gray-600 hover:text-[#00488d]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={logout}
                className="bg-[#ffb800] hover:bg-yellow-500 text-gray-900 px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#00488d] p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-bold uppercase ${
                      isActive ? 'bg-[#00488d] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <button 
                onClick={logout}
                className="w-full text-left mt-4 bg-[#ffb800] text-gray-900 px-3 py-2 rounded-md text-base font-bold uppercase"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#00488d] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Sana Pathology Lab. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
