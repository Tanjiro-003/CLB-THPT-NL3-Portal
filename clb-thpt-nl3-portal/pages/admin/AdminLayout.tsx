import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Home, PlusCircle, Menu, X } from 'lucide-react';
import { db } from '../../services/mockDatabase';

interface AdminLayoutProps {
  user: User | null;
  setUser: (u: User | null) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Route protection
  if (!user || user.role !== UserRole.ADMIN) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    db.saveUser(null);
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { path: '/admin/events', label: 'Quản Lý Sự Kiện', icon: Calendar },
    { path: '/admin/create-event', label: 'Đăng Sự Kiện', icon: PlusCircle },
    { path: '/admin/users', label: 'Quản Lý Thành Viên', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            NL3 ADMIN PORTAL
          </h1>
          <p className="text-xs text-slate-400 mt-1">Hệ thống quản trị tập trung</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link 
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
          >
             <Home className="w-5 h-5" /> Về Trang Chủ
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
          >
             <LogOut className="w-5 h-5" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
             <span className="font-bold text-gray-800">Admin Portal</span>
          </div>
          <div className="flex gap-2">
             <Link to="/" className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-blue-600 font-bold">Trang chủ</Link>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-900 text-white absolute top-[60px] left-0 w-full z-20 shadow-xl border-t border-slate-700 animate-fade-in">
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-300 hover:bg-slate-800'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                        );
                    })}
                    <div className="border-t border-slate-700 my-2 pt-2">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg text-sm font-medium"
                        >
                            <LogOut className="w-5 h-5" /> Đăng Xuất
                        </button>
                    </div>
                </nav>
            </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-100">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;