import React, { useEffect, useState } from 'react';
import { User, EventPost, ClubType } from '../types';
import { db } from '../services/mockDatabase';
import EventCard from '../components/EventCard';
import { Users, Calendar, Trophy, ArrowRight, ChevronLeft, ChevronRight, Bell, BellOff, Filter, Check } from 'lucide-react';

interface HomeProps {
  user: User | null;
  setUser?: (u: User | null) => void;
}

const Home: React.FC<HomeProps> = ({ user, setUser }) => {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [stats, setStats] = useState(db.getStats());
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  
  // Filter State
  const [selectedClubFilter, setSelectedClubFilter] = useState<ClubType | 'ALL'>('ALL');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  const refreshData = () => {
    setPosts(db.getPosts());
    setStats(db.getStats());
    const updatedUser = db.getUser();
    setCurrentUser(updatedUser);
    if (setUser) setUser(updatedUser);
  };

  useEffect(() => {
    refreshData();
    db.incrementVisitor();
  }, [user]);

  // Filter posts
  const filteredPosts = selectedClubFilter === 'ALL' 
    ? posts 
    : posts.filter(p => p.club === selectedClubFilter);

  // Pagination Logic on Filtered Posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClubFilter]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleFollow = (e: React.MouseEvent, club: ClubType) => {
    e.stopPropagation(); // Prevent triggering the card click (filter)
    if (!currentUser) {
      alert("Vui lòng đăng nhập để theo dõi câu lạc bộ!");
      return;
    }
    const updatedUser = db.toggleFollowClub(currentUser.id, club);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      if (setUser) setUser(updatedUser);
    }
  };

  // Enhanced Club List with Images and Descriptions
  const clubList = [
    { 
      type: ClubType.DTC, 
      icon: '💻', 
      shortName: 'Chuyển Đổi Số', 
      fullName: 'CLB Chuyển Đổi Số & Công Nghệ',
      description: 'Nơi hội tụ những đam mê công nghệ, lập trình và sáng tạo số.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
      color: 'bg-blue-100 text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      type: ClubType.ENGLISH, 
      icon: '🗣️', 
      shortName: 'Tiếng Anh', 
      fullName: 'CLB Tiếng Anh (NEC)',
      description: 'Môi trường rèn luyện tiếng Anh năng động qua các hoạt động debate, kịch, và trò chơi.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
      color: 'bg-red-100 text-red-600',
      gradient: 'from-red-500 to-pink-500'
    },
    { 
      type: ClubType.BOOKS, 
      icon: '📚', 
      shortName: 'Sách & Hành Động', 
      fullName: 'CLB Sách và Hành Động',
      description: 'Lan tỏa văn hóa đọc và thực hiện các dự án xã hội ý nghĩa.',
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600',
      color: 'bg-yellow-100 text-yellow-600',
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      type: ClubType.SCIENCE, 
      icon: '🧬', 
      shortName: 'Khoa Học TN', 
      fullName: 'CLB Khoa Học Tự Nhiên',
      description: 'Khám phá bí ẩn của vũ trụ, hóa học và sinh học qua các thí nghiệm thực tế.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
      color: 'bg-green-100 text-green-600',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      type: ClubType.LITERATURE, 
      icon: '✒️', 
      shortName: 'Văn Học', 
      fullName: 'CLB Văn Học & Nghệ Thuật',
      description: 'Nơi cảm xúc thăng hoa qua những trang viết và các tác phẩm nghệ thuật.',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600',
      color: 'bg-purple-100 text-purple-600',
      gradient: 'from-purple-500 to-indigo-500'
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
             alt="Background" 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Tham gia ngay <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">CLB NL3</span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Khám phá các sự kiện và hoạt động thú vị của chúng tôi! Nơi hội tụ của tri thức, sáng tạo và nhiệt huyết tuổi trẻ.
          </p>
          
          {/* Stats Cards in Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col items-center">
              <Users className="w-10 h-10 text-blue-400 mb-3" />
              <div className="text-3xl font-bold">{stats.members}+</div>
              <div className="text-sm text-gray-300">Thành viên</div>
            </div>
            <div className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col items-center">
              <Calendar className="w-10 h-10 text-green-400 mb-3" />
              <div className="text-3xl font-bold">{stats.eventsCount}+</div>
              <div className="text-sm text-gray-300">Sự kiện</div>
            </div>
            <div className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col items-center">
              <Trophy className="w-10 h-10 text-yellow-400 mb-3" />
              <div className="text-3xl font-bold">{stats.awards}+</div>
              <div className="text-sm text-gray-300">Giải thưởng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Selection / Filter Section */}
      <section className="py-16 bg-white" id="clubs">
         <div className="container mx-auto px-4">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-800 mb-3">Các Câu Lạc Bộ Thành Viên</h2>
               <p className="text-gray-500 max-w-2xl mx-auto">Chọn câu lạc bộ để khám phá không gian riêng, xem các sự kiện sắp tới và tham gia cộng đồng của chúng tôi.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
               {/* "All" Card */}
               <div 
                  onClick={() => setSelectedClubFilter('ALL')}
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 h-64 border ${selectedClubFilter === 'ALL' ? 'ring-4 ring-blue-500 ring-offset-2 scale-105' : 'hover:-translate-y-2 hover:shadow-xl'}`}
               >
                   <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                       <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl mb-4 border border-white/20">
                           🏫
                       </div>
                       <h3 className="text-white font-bold text-lg">Tất cả CLB</h3>
                       <p className="text-gray-300 text-xs mt-2">Xem hoạt động của toàn trường</p>
                   </div>
               </div>

               {clubList.map((item, i) => {
                 const isFollowed = currentUser?.followedClubs?.includes(item.type);
                 const isSelected = selectedClubFilter === item.type;
                 
                 return (
                   <div 
                      key={i}
                      onClick={() => setSelectedClubFilter(item.type)}
                      className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 h-64 border-2 ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 border-blue-500' : 'border-transparent hover:-translate-y-2 hover:shadow-xl'}`}
                   >
                      {/* Background Image */}
                      <img 
                        src={item.image} 
                        alt={item.shortName} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-blue-900/90 to-blue-900/40' : 'from-black/80 to-black/20 group-hover:from-blue-900/80'}`}></div>
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                          <div className="mb-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0">
                               <p className="text-white text-xs line-clamp-3 leading-relaxed">{item.description}</p>
                          </div>

                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3 backdrop-blur-md ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'}`}>
                              {item.icon}
                          </div>
                          <h4 className="text-white font-bold text-lg leading-tight mb-1">{item.shortName}</h4>
                          <p className="text-gray-300 text-xs mb-3 truncate">{item.fullName}</p>
                          
                          <button 
                            onClick={(e) => handleToggleFollow(e, item.type)}
                            className={`w-full py-2 text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-colors backdrop-blur-sm
                              ${isFollowed 
                                ? 'bg-white/90 text-blue-700 hover:bg-white' 
                                : 'bg-blue-600/90 text-white hover:bg-blue-600'}`}
                          >
                            {isFollowed ? (
                              <>
                                <BellOff className="w-3 h-3" /> Đã theo dõi
                              </>
                            ) : (
                              <>
                                <Bell className="w-3 h-3" /> Theo dõi
                              </>
                            )}
                          </button>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Selected Club Detail View (Interactive Detail) */}
            {selectedClubFilter !== 'ALL' && (
                <div className="mt-12 animate-fade-in">
                    {(() => {
                        const clubInfo = clubList.find(c => c.type === selectedClubFilter);
                        if (!clubInfo) return null;
                        return (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                                <div className="md:w-1/3 relative h-48 md:h-auto">
                                    <img src={clubInfo.image} className="w-full h-full object-cover" alt={clubInfo.fullName} />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${clubInfo.gradient} opacity-80 mix-blend-multiply`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl">{clubInfo.icon}</div>
                                    </div>
                                </div>
                                <div className="p-8 md:w-2/3 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${clubInfo.color} bg-opacity-20`}>
                                            Câu Lạc Bộ
                                        </span>
                                        {currentUser?.followedClubs?.includes(clubInfo.type) && (
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                <Check className="w-3 h-3" /> Đang theo dõi
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{clubInfo.fullName}</h2>
                                    <p className="text-gray-600 mb-6 text-lg">{clubInfo.description}</p>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xl text-gray-800">{posts.filter(p => p.club === clubInfo.type).length}</span>
                                            <span className="text-xs text-gray-500 uppercase">Sự kiện</span>
                                        </div>
                                        <div className="w-px bg-gray-200"></div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xl text-gray-800">50+</span>
                                            <span className="text-xs text-gray-500 uppercase">Thành viên</span>
                                        </div>
                                        <div className="ml-auto">
                                            <button 
                                                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                                                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2"
                                            >
                                                Xem sự kiện bên dưới <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </div>
            )}
         </div>
      </section>

      {/* Events Section */}
      <section className="py-12 bg-gray-50 min-h-[600px]" id="events">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <h2 className="text-3xl font-bold text-gray-800">
                    Sự kiện nổi bật
                 </h2>
              </div>
              <p className="text-gray-500 text-sm">
                  Đang hiển thị {currentPosts.length} sự kiện {selectedClubFilter !== 'ALL' && `của ${selectedClubFilter}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-gray-400" />
                 <span className="text-sm text-gray-500">
                    Trang {currentPage} / {totalPages || 1}
                 </span>
            </div>
          </div>

          {/* Filter Chips Row */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
                onClick={() => setSelectedClubFilter('ALL')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedClubFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
                Tất cả
            </button>
            {Object.values(ClubType).map((club) => (
                <button
                    key={club}
                    onClick={() => setSelectedClubFilter(club)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                        selectedClubFilter === club
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {club}
                    {selectedClubFilter === club && <Check className="w-3 h-3 ml-1 inline" />}
                </button>
            ))}
          </div>

          {filteredPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {currentPosts.map(post => (
                  <EventCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser} 
                    onRefresh={refreshData} 
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-lg border border-gray-300 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-lg border border-gray-300 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border-dashed border-2 border-gray-200">
               <div className="text-4xl mb-4">📅</div>
               <h3 className="text-xl font-bold text-gray-700 mb-2">Không có sự kiện nào</h3>
               <p className="text-gray-500">
                  {selectedClubFilter === 'ALL' 
                    ? 'Hiện tại chưa có sự kiện nào được đăng.' 
                    : `CLB ${selectedClubFilter} chưa có sự kiện nào.`}
               </p>
               {selectedClubFilter !== 'ALL' && (
                  <button 
                    onClick={() => setSelectedClubFilter('ALL')}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                  >
                    Xem tất cả sự kiện
                  </button>
               )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;