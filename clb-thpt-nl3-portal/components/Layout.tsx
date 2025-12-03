import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, Notification } from '../types';
import { db } from '../services/mockDatabase';
import { Menu, X, Bell, User as UserIcon, Search, LogOut, CheckCircle, Clock, Info, LayoutDashboard, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (u: User | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [stats, setStats] = useState(db.getStats());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{message: string, link?: string} | null>(null);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const lastNotifIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Refresh stats when location changes to capture updates
    setStats(db.getStats());
  }, [location]);

  // Load Notifications and Real-time Polling
  useEffect(() => {
    if (user) {
      // Initial Load
      const initialNotifs = db.getUserNotifications(user.id);
      setNotifications(initialNotifs);
      if (initialNotifs.length > 0) {
        lastNotifIdRef.current = initialNotifs[0].id;
      }

      const checkNotifications = () => {
        const latestNotifs = db.getUserNotifications(user.id);
        setNotifications(latestNotifs);

        if (latestNotifs.length > 0) {
            const newest = latestNotifs[0];
            // Check if this is a new notification compared to what we last saw
            if (newest.id !== lastNotifIdRef.current) {
                // If we had no notifications before, or the ID changed, it's new
                // We show toast if it's genuinely a new event during this session
                if (lastNotifIdRef.current !== null || initialNotifs.length === 0) {
                     setToast({ message: newest.message, link: newest.link });
                     // Auto hide after 5 seconds
                     setTimeout(() => setToast(null), 5000);
                }
                lastNotifIdRef.current = newest.id;
            }
        }
      };

      // Poll every 3 seconds
      const interval = setInterval(checkNotifications, 3000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      lastNotifIdRef.current = null;
    }
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    db.saveUser(null);
    setUser(null);
    navigate('/');
  };

  const handleNotificationClick = (notif: Notification) => {
    db.markNotificationAsRead(notif.id);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    if (notif.link) {
      navigate(notif.link);
      // If same page, scroll to events
      if (notif.link === '/#events' || notif.link === '/') {
        setTimeout(() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Blue Top Bar */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white px-4 py-2">
          <div className="container mx-auto flex justify-between items-center text-xs md:text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-bold">CLUB THPT NL3</span>
              <span className="hidden md:inline">| Nơi kết nối đam mê</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  to={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/my-events"}
                  className="flex items-center gap-2 hover:bg-white/10 px-2 py-0.5 rounded transition cursor-pointer"
                  title={user.role === UserRole.ADMIN ? "Vào trang quản trị" : "Trang cá nhân"}
                >
                  <span className="font-medium">Chào, {user.username}</span>
                  {user.role === UserRole.ADMIN && (
                     <span className="flex items-center gap-0.5 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        <Shield className="w-2.5 h-2.5" /> ADMIN
                     </span>
                  )}
                  <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                    {user.points} điểm
                  </span>
                </Link>
              ) : (
                <Link to="/login" className="hover:underline">Đăng nhập / Đăng ký</Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo area */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">NL3 CLUB</h1>
                <p className="text-xs text-gray-500">Trường THPT Nguyễn Lương Bằng</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
              <Link to="/" className="hover:text-blue-600 transition">TRANG CHỦ</Link>
              <Link to="/#events" className="hover:text-blue-600 transition">SỰ KIỆN MỚI</Link>
              {user && (
                 <Link to="/my-events" className="hover:text-blue-600 transition">SỰ KIỆN CỦA TÔI</Link>
              )}
              <Link to="/#about" className="hover:text-blue-600 transition">BAN QUẢN TRỊ</Link>
              <Link to="/#contact" className="hover:text-blue-600 transition">LIÊN HỆ</Link>
              {user?.role === UserRole.ADMIN && (
                <Link 
                  to="/admin/dashboard" 
                  className="text-white bg-blue-600 font-bold border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="w-4 h-4" /> QUẢN TRỊ VIÊN
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="pl-8 pr-4 py-1.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 text-sm w-40 lg:w-64 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
              </div>
              
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700 text-sm">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          {unreadCount} chưa đọc
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {!user ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Vui lòng đăng nhập để xem thông báo.
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 py-8">
                          <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          Không có thông báo mới
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition flex gap-3 ${!n.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                          >
                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <div>
                              <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                {n.message}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {new Date(n.timestamp).toLocaleDateString('vi-VN')} {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {user && (
                 <button onClick={handleLogout} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Đăng xuất">
                   <LogOut className="w-5 h-5" />
                 </button>
              )}

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="flex flex-col p-4 space-y-3">
              <Link to="/" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link>
              <Link to="/#events" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Sự kiện</Link>
              {user && (
                 <Link to="/my-events" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Sự kiện của tôi</Link>
              )}
              <Link to="/#contact" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Liên hệ</Link>
              {user?.role === UserRole.ADMIN && (
                <Link to="/admin/dashboard" className="text-blue-600 font-bold flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển Admin
                </Link>
              )}
              <div className="pt-2 border-t">
                 <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="w-full px-4 py-2 rounded bg-gray-100 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div 
            onClick={() => {
                if(toast.link) {
                    navigate(toast.link);
                    if (toast.link.includes('#events')) {
                        setTimeout(() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                }
                setToast(null);
            }}
            className="fixed bottom-6 left-6 z-[100] bg-white border-l-4 border-blue-600 shadow-2xl rounded-r-lg p-4 max-w-sm cursor-pointer hover:bg-gray-50 transition-all animate-fade-in flex items-start gap-3 group"
        >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
               <Bell className="w-5 h-5" />
            </div>
            <div className="flex-grow">
               <h4 className="font-bold text-gray-800 text-sm flex justify-between items-center">
                  Thông báo mới
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Mới</span>
               </h4>
               <p className="text-gray-600 text-sm mt-1 leading-snug">{toast.message}</p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setToast(null); }} 
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6" id="contact">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Về chúng tôi</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Câu lạc bộ THPT NL3 - Nơi phát triển tài năng và kết nối đam mê. 
                Chúng tôi tạo ra môi trường năng động cho học sinh phát triển toàn diện.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-blue-400">Trang chủ</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Sự kiện</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Ban quản trị</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center"><span className="w-6">f</span> Facebook</li>
                <li className="flex items-center"><span className="w-6">🌐</span> Website</li>
                <li className="flex items-center"><span className="w-6">📷</span> Instagram</li>
                <li className="flex items-center"><span className="w-6">▶️</span> YouTube</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Thống kê</h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Truy cập:</span>
                  <span className="font-mono text-green-400">{stats.visitors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Thành viên:</span>
                  <span className="font-mono text-blue-400">{stats.members.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Online:</span>
                  <span className="font-mono text-yellow-400 flex items-center gap-1">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     59
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © 2025 Câu lạc bộ Trường THPT NL3. Mọi quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;