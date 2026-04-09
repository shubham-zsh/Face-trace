import React, { useState } from 'react';
import { Menu, User, Shield, X, LayoutDashboard, Info, Mail, ScanSearch } from 'lucide-react';
import {Link} from 'react-router-dom';
import { clearAuth, getAuthUser, isAuthenticated, logoutRequest } from '../utils/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [currentUser, setCurrentUser] = useState(getAuthUser());

  React.useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setCurrentUser(getAuthUser());
    };

    window.addEventListener('auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className="bg-[#121417]/95 backdrop-blur-md border-b border-[#1F2227] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        
        {/* Left Section: Sidebar Toggle & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-[#1F2227] rounded-lg transition-colors text-[#E0E0E0]"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-[#0078D4] p-1.5 rounded-md group-hover:bg-[#0086ED] transition-all">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#E0E0E0]">
              Face<span className="text-[#0078D4]">Trace</span>
            </span>
          </div>
          
        </div>

        {/* Right Section: Login Button */}
        
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300 bg-transparent border border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4] hover:text-white"
          >
            <User size={18} />
            <span className="hidden sm:inline">
              Logout {currentUser?.name ? `(${currentUser.name})` : ''}
            </span>
          </button>
        ) : (
          <Link to='/login'>
            <button 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300
                ${isHovered 
                  ? 'bg-[#0078D4] text-white shadow-[0_0_15px_rgba(0,120,212,0.4)]' 
                  : 'bg-transparent border border-[#0078D4] text-[#0078D4]'}
              `}
            >
              <User size={18} />
              <span className="hidden sm:inline">
                Expert Login
              </span>
            </button>
          </Link>
        )}

      </nav>

      {/* Slide-out Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="relative w-72 bg-[#121417] h-full border-r border-[#1F2227] shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="text-[#E0E0E0] font-semibold text-lg uppercase tracking-widest">Menu</span>
              <button onClick={() => setIsOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Menu Items (Manual - No Map) */}
            <div className="flex flex-col gap-2">

               <Link to='/'
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-3 text-[#E0E0E0] hover:bg-[#1F2227] rounded-xl transition-all group">
                <LayoutDashboard size={20} className="text-[#0078D4] group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
              </Link>

              <Link to='/lab'
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-3 text-[#E0E0E0] hover:bg-[#1F2227] rounded-xl transition-all group">
                <LayoutDashboard size={20} className="text-[#0078D4] group-hover:scale-110 transition-transform" />
                <span className="font-medium">Lab</span>
              </Link>

              <Link to='/face-match'
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-3 text-[#E0E0E0] hover:bg-[#1F2227] rounded-xl transition-all group">
                <ScanSearch size={20} className="text-[#0078D4] group-hover:scale-110 transition-transform" />
                <span className="font-medium">Face Match</span>
              </Link>

              <button className="flex items-center gap-4 p-3 text-[#E0E0E0] hover:bg-[#1F2227] rounded-xl transition-all group">
                <Info size={20} className="text-[#0078D4] group-hover:scale-110 transition-transform" />
                <span className="font-medium">About</span>
              </button>

              <button className="flex items-center gap-4 p-3 text-[#E0E0E0] hover:bg-[#1F2227] rounded-xl transition-all group">
                <Mail size={20} className="text-[#0078D4] group-hover:scale-110 transition-transform" />
                <span className="font-medium">Contact</span>
              </button>

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-3 text-[#E0E0E0] hover:bg-[#1F2227] rounded-xl transition-all group"
                >
                  <User size={20} className="text-[#0078D4] group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>

            {/* Bottom Branding */}
            <div className="mt-auto pt-6 border-t border-[#1F2227] text-xs text-[#555]">
              FaceTrace Forensic System v1.0.4
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
