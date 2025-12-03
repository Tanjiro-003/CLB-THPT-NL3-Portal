import React, { useEffect, useState } from 'react';
import { User, EventPost, ClubType, UserRole } from '../types';
import { db } from '../services/mockDatabase';
import EventCard from '../components/EventCard';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, Bell, BellOff, Trophy, User as UserIcon, Edit2, X, Save, History, Clock, LayoutDashboard, PlusCircle, Users } from 'lucide-react';

interface MyEventsProps {
  user: User | null;
  setUser?: (u: User | null) => void;
}

const MyEvents: React.FC<MyEventsProps> = ({ user, setUser }) => {
  const [myPosts, setMyPosts] = useState<EventPost[]>([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  
  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', avatar: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    refreshData();
    // Initialize edit form
    setEditForm({
        fullName: user.fullName || '',
        avatar: user.avatar || ''
    });
  }, [user, navigate]);

  const refreshData = () => {
    if (user) {
      setMyPosts(db.getUserEvents(user.id));
      const updatedUser = db.getUser();
      if (setUser) setUser(updatedUser);
    }
  };

  const handleUnfollow = (club: ClubType) => {
    if (!user) return;
    if (window.confirm(`Bạn có chắc muốn bỏ theo dõi ${club}?`)) {
      const updatedUser = db.toggleFollowClub(user.id, club);
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = db.updateUserInfo(user.id, {
        fullName: editForm.fullName,
        avatar: editForm.avatar
    });

    if (updatedUser && setUser) {
        setUser(updatedUser);
        alert("Cập nhật thông tin thành công!");
        setIsEditProfileOpen(false);
    }
  };

  if (!user) return null;

  // Split events into Upcoming and History
  const upcomingEvents = myPosts.filter(p => p.status !== 'ENDED');
  const historyEvents = myPosts.filter(p => p.status === 'ENDED');

  const displayedEvents = activeTab === 'UPCOMING' ? upcomingEvents : historyEvents;

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Profile & Followed Clubs */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition"
                title="Chỉnh sửa hồ sơ"
              >
                  <Edit2 className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 overflow-hidden border-4 border-white shadow-md group relative">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                       <UserIcon className="w-10 h-10" />
                     </div>
                   )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                
                <div className="mt-4 w-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-yellow-700 font-bold text-sm">
                      <Trophy className="w-4 h-4" /> Điểm tích lũy
                   </div>
                   <span className="text-xl font-bold text-yellow-600">{user.points}</span>
                </div>
              </div>
            </div>

            {/* Admin Shortcuts (Visible only to Admins) */}
            {user.role === UserRole.ADMIN && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-purple-600" /> Menu Quản Trị
                    </h3>
                    <div className="space-y-2">
                        <Link to="/admin/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition text-sm font-medium">
                            <LayoutDashboard className="w-4 h-4" /> Bảng Điều Khiển
                        </Link>
                        <Link to="/admin/create-event" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition text-sm font-medium">
                            <PlusCircle className="w-4 h-4" /> Đăng Sự Kiện
                        </Link>
                        <Link to="/admin/events" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition text-sm font-medium">
                            <Calendar className="w-4 h-4" /> Quản Lý Sự Kiện
                        </Link>
                        <Link to="/admin/users" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition text-sm font-medium">
                            <Users className="w-4 h-4" /> Quản Lý Thành Viên
                        </Link>
                    </div>
                </div>
            )}

            {/* Followed Clubs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Bell className="w-4 h-4 text-blue-600" /> CLB Đang Theo Dõi
               </h3>
               
               {user.followedClubs && user.followedClubs.length > 0 ? (
                 <div className="space-y-3">
                   {user.followedClubs.map((club, idx) => (
                     <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition">
                        <span className="text-sm font-medium text-gray-700">{club}</span>
                        <button 
                          onClick={() => handleUnfollow(club)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                          title="Bỏ theo dõi"
                        >
                           <BellOff className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-6 text-gray-400 text-sm">
                   Bạn chưa theo dõi câu lạc bộ nào.
                   <Link to="/#clubs" className="block mt-2 text-blue-600 hover:underline">Khám phá ngay</Link>
                 </div>
               )}
            </div>
          </div>

          {/* Main Content: Registered Events */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <UserCheck className="text-blue-600 w-6 h-6" />
                  Sự kiện của tôi
                </h1>
                <p className="text-gray-500 text-sm mt-1">Quản lý lịch trình và xem lại các sự kiện đã tham gia</p>
              </div>
              <Link to="/" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-500 transition shadow-sm">
                 + Tìm thêm sự kiện
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('UPCOMING')}
                    className={`pb-3 px-6 text-sm font-bold transition relative ${
                        activeTab === 'UPCOMING' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Sắp diễn ra
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{upcomingEvents.length}</span>
                    </div>
                    {activeTab === 'UPCOMING' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`pb-3 px-6 text-sm font-bold transition relative ${
                        activeTab === 'HISTORY' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4" /> Lịch sử tham gia
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{historyEvents.length}</span>
                    </div>
                    {activeTab === 'HISTORY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
            </div>

            {displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {displayedEvents.map(post => (
                  <EventCard 
                    key={post.id} 
                    post={post} 
                    currentUser={user} 
                    onRefresh={refreshData} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   {activeTab === 'UPCOMING' ? <Calendar className="w-8 h-8 text-blue-400" /> : <History className="w-8 h-8 text-gray-400" />}
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">
                     {activeTab === 'UPCOMING' ? 'Không có sự kiện sắp tới' : 'Chưa có lịch sử tham gia'}
                 </h3>
                 <p className="text-gray-500 mb-6 max-w-md mx-auto">
                   {activeTab === 'UPCOMING' 
                     ? 'Bạn chưa đăng ký sự kiện nào đang diễn ra.' 
                     : 'Bạn chưa tham gia sự kiện nào đã kết thúc.'}
                 </p>
                 {activeTab === 'UPCOMING' && (
                     <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        Xem danh sách sự kiện
                     </Link>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Edit Profile Modal */}
    {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditProfileOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Chỉnh Sửa Hồ Sơ
                </h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
             </div>
             
             <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và Tên</label>
                   <input 
                     type="text" 
                     value={editForm.fullName}
                     onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     required
                   />
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Avatar (URL)</label>
                   <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={editForm.avatar}
                         onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                         className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="https://..."
                       />
                       {editForm.avatar && (
                           <img src={editForm.avatar} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                       )}
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Dán link ảnh từ internet vào đây.</p>
                </div>

                <div className="pt-2">
                   <button 
                     type="submit" 
                     className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                   >
                     <Save className="w-4 h-4" /> Lưu Thay Đổi
                   </button>
                </div>
             </form>
          </div>
        </div>
    )}
    </>
  );
};

export default MyEvents;