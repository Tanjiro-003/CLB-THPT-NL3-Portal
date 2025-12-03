import React, { useState, useRef, useEffect } from 'react';
import { EventPost, User, UserRole, RegistrationInfo } from '../types';
import { Calendar, MapPin, Clock, Heart, MessageSquare, Share2, ChevronDown, ChevronUp, Check, LogIn, Users, Trash2, Edit, X, Save, Link as LinkIcon, Facebook, Twitter, CheckCircle, Trophy, ArrowRight, AlertTriangle, Clock as ClockIcon, XCircle, Hourglass, Folder } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { Link } from 'react-router-dom';

interface EventCardProps {
  post: EventPost;
  currentUser: User | null;
  onRefresh: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ post, currentUser, onRefresh }) => {
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Admin View State
  const [showRegistrations, setShowRegistrations] = useState(false);
  
  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    fullName: currentUser?.fullName || '',
    grade: '',
    className: '',
    email: '',
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EventPost>(post);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Share State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // User Data for Comments
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});

  const isRegistered = currentUser && post.registeredUserIds?.includes(currentUser.id);
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  
  const likedBy = post.likedBy || [];
  const isLiked = currentUser && likedBy.includes(currentUser.id);
  const likeCount = likedBy.length;

  // Get current user registration details if registered
  const myRegistration = currentUser && post.registrations?.find(r => r.userId === currentUser.id);
  const regStatus = myRegistration?.status || 'PENDING';

  // For Admin: Get detailed registration info
  const registrations = isAdmin ? (post.registrations || []) : [];

  // Check Registration Deadline
  const isDeadlinePassed = post.registrationDeadline 
      ? new Date().getTime() > new Date(post.registrationDeadline).getTime() + 86400000 // End of day check roughly
      : false;

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch authors data when expanded to show points in comments
  useEffect(() => {
    if (isExpanded) {
      const users = db.getAllUsers();
      const authorMap: Record<string, User> = {};
      users.forEach(u => authorMap[u.id] = u);
      setCommentAuthors(authorMap);
    }
  }, [isExpanded, post.comments.length]);

  const handleOpenRegister = () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đăng ký!");
      return;
    }
    if (isDeadlinePassed) {
      alert("Đã hết hạn đăng ký tham gia sự kiện này.");
      return;
    }
    setRegForm({
      fullName: currentUser.fullName || '',
      grade: '10', // Default
      className: '',
      email: '',
    });
    setIsRegisterModalOpen(true);
  };

  const handleConfirmRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!regForm.fullName || !regForm.grade || !regForm.className) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const info: RegistrationInfo = {
      userId: currentUser.id,
      fullName: regForm.fullName,
      grade: regForm.grade,
      className: regForm.className,
      email: regForm.email,
      timestamp: Date.now(),
      status: 'PENDING'
    };

    db.registerForEvent(post.id, info);
    alert(`Đã gửi yêu cầu đăng ký tham gia: ${post.title}. Vui lòng chờ Ban Quản Trị phê duyệt.`);
    setIsRegisterModalOpen(false);
    onRefresh();
  };

  const handleCancelRegister = () => {
    if (!currentUser) return;
    if (window.confirm(`Bạn có chắc muốn hủy đăng ký sự kiện: ${post.title}?`)) {
      db.cancelRegistration(post.id, currentUser.id);
      onRefresh();
    }
  };

  // Admin Actions
  const handleApprove = (userId: string) => {
    if (window.confirm('Duyệt thành viên này tham gia sự kiện?')) {
        db.updateRegistrationStatus(post.id, userId, 'APPROVED');
        onRefresh();
    }
  };

  const handleReject = (userId: string) => {
    if (window.confirm('Từ chối thành viên này?')) {
        db.updateRegistrationStatus(post.id, userId, 'REJECTED');
        onRefresh();
    }
  };

  const handleLike = () => {
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    db.toggleLike(post.id, currentUser.id);
    onRefresh();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    if (!commentText.trim()) return;

    db.addComment(post.id, {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      content: commentText,
      timestamp: Date.now()
    });
    setCommentText('');
    onRefresh();
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    db.deletePost(post.id);
    onRefresh();
    setIsDeleteModalOpen(false);
  };

  const handleEdit = () => {
    setEditForm({...post}); // Clone data to edit form
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    db.updatePost(editForm);
    alert('Cập nhật sự kiện thành công!');
    setIsEditModalOpen(false);
    onRefresh();
  };

  // Share Handlers
  const getEventLink = () => {
    return `${window.location.origin}/#event-${post.id}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getEventLink());
    setCopied(true);
    if(currentUser) db.shareEvent(post.id, currentUser.id);
    setTimeout(() => {
      setCopied(false);
      setIsShareOpen(false);
    }, 2000);
  };

  const handleShareSocial = (platform: 'facebook' | 'twitter') => {
    if(currentUser) db.shareEvent(post.id, currentUser.id);
    const url = encodeURIComponent(getEventLink());
    const text = encodeURIComponent(`Tham gia sự kiện ${post.title} tại CLB NL3!`);
    let shareUrl = '';

    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsShareOpen(false);
  };

  // Helper to generate class options based on grade
  const getClassOptions = (grade: string) => {
    const classes = [];
    const prefix = grade === '10' ? '10' : grade === '11' ? '11' : '12';
    // Generate A1-A10
    for(let i=1; i<=10; i++) classes.push(`${prefix}A${i}`);
    return classes;
  };

  // Helpers for Admin Author View
  const getAuthorInfo = () => {
    const users = db.getAllUsers();
    return users.find(u => u.id === post.authorId);
  };

  const getAuthorPostCount = () => {
    const posts = db.getPosts();
    return posts.filter(p => p.authorId === post.authorId).length;
  };

  // Helper for formatting time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
      <div id={`event-${post.id}`} className={`bg-white rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden flex flex-col border border-gray-100 group ${isExpanded ? '' : 'h-full'}`}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden shrink-0">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Prominent Badge for Image */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md flex items-center gap-1.5
              ${post.status === 'OPEN' ? 'bg-green-600/95 ring-2 ring-green-400' : post.status === 'ENDED' ? 'bg-red-600/95' : 'bg-gray-600/95'}`}>
              <div className={`w-2 h-2 rounded-full ${post.status === 'OPEN' ? 'bg-white animate-pulse' : 'bg-white/50'}`}></div>
              {post.status === 'OPEN' ? 'Đang mở' : post.status === 'ENDED' ? 'Đã hết' : 'Đóng'}
            </span>
          </div>
          {post.duration && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                <Hourglass className="w-3 h-3" /> {post.duration}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-2">
            <div className="text-blue-600 text-xs font-bold uppercase tracking-wide bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{post.club}</div>
             
             {/* Approval Status Badge for Registered User */}
             {isRegistered && (
                 <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1
                    ${regStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      regStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {regStatus === 'APPROVED' && <CheckCircle className="w-3 h-3"/>}
                    {regStatus === 'REJECTED' && <XCircle className="w-3 h-3"/>}
                    {regStatus === 'PENDING' && <Clock className="w-3 h-3"/>}
                    {regStatus === 'APPROVED' ? 'Đã Duyệt' : regStatus === 'REJECTED' ? 'Từ Chối' : 'Chờ Duyệt'}
                 </div>
             )}
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors" title={post.title}>
            {post.title}
          </h3>
          
          <div className="space-y-2 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
              {post.registrationDeadline && (
                  <span className={`text-xs ml-auto px-2 py-0.5 rounded ${isDeadlinePassed ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {isDeadlinePassed ? 'Hết hạn' : `Hạn: ${new Date(post.registrationDeadline).toLocaleDateString('vi-VN')}`}
                  </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{post.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-600 hover:underline truncate"
                title="Xem trên bản đồ"
              >
                  {post.location}
              </a>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.description}</p>
          
          {/* Expandable Section (Accordion Animation) */}
          <div 
            className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${
              isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden">
                <div className="border-t border-gray-100 pt-4 mb-6">
                  {/* Folder Info for Admin */}
                  {isAdmin && post.folderPath && (
                    <div className="mb-4 text-xs font-mono bg-gray-800 text-gray-300 p-2 rounded flex items-center gap-2 overflow-hidden">
                        <Folder className="w-3 h-3 text-yellow-400 shrink-0" />
                        <span className="truncate">{post.folderPath}</span>
                    </div>
                  )}

                  <h4 className="font-bold text-gray-800 mb-2">Chi tiết sự kiện:</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line mb-4">{post.content}</p>
                  
                  {/* Admin View: Author Stats */}
                  {isAdmin && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Tác giả:</span> <span className="font-bold text-gray-800 ml-1">{getAuthorInfo()?.fullName || 'Unknown'}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500">Tổng bài viết:</span> <span className="font-bold text-blue-600 ml-1">{getAuthorPostCount()}</span>
                      </div>
                      <Link 
                        to="/admin/events" 
                        state={{ search: getAuthorInfo()?.fullName }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white border border-blue-100 px-2 py-1 rounded shadow-sm hover:shadow"
                      >
                        Xem tất cả <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Admin View: Registrations Collapsible */}
                  {isAdmin && (
                    <div className="mb-4">
                      <button 
                        onClick={() => setShowRegistrations(!showRegistrations)}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition font-bold text-sm border border-blue-100"
                      >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Danh sách đăng ký ({post.registrations?.length || 0})</span>
                          </div>
                          {showRegistrations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                          showRegistrations ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}>
                          <div className="overflow-hidden">
                              <div className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm">
                                {registrations.length > 0 ? (
                                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                      <thead className="bg-blue-50 text-blue-800 text-xs uppercase sticky top-0">
                                        <tr>
                                          <th className="px-3 py-2">Tên</th>
                                          <th className="px-3 py-2">Lớp</th>
                                          <th className="px-3 py-2">Trạng thái</th>
                                          <th className="px-3 py-2 text-center">Xử lý</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-blue-50">
                                        {registrations.map((reg, idx) => (
                                          <tr key={idx} className="hover:bg-blue-50/50">
                                            <td className="px-3 py-2 font-medium text-gray-800">
                                                {reg.fullName}
                                                <div className="text-[10px] text-gray-400">{new Date(reg.timestamp).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-3 py-2 text-gray-600 text-xs">{reg.className}</td>
                                            <td className="px-3 py-2 text-xs">
                                                {reg.status === 'APPROVED' && <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">Đã duyệt</span>}
                                                {reg.status === 'REJECTED' && <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">Từ chối</span>}
                                                {(!reg.status || reg.status === 'PENDING') && <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full flex w-fit items-center gap-1"><ClockIcon className="w-3 h-3"/> Chờ duyệt</span>}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {(!reg.status || reg.status === 'PENDING') ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(reg.userId)}
                                                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition" 
                                                            title="Duyệt"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(reg.userId)}
                                                            className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition" 
                                                            title="Từ chối"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-4 text-center text-sm text-blue-600 italic">Chưa có thành viên nào đăng ký.</div>
                                )}
                              </div>
                          </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex gap-2 mb-4">
                        {post.status !== 'ENDED' && (
                            <button 
                                onClick={() => {
                                    if(window.confirm(`Đánh dấu "${post.title}" là Đã Kết Thúc?`)) {
                                        db.toggleEventStatus(post.id, 'ENDED');
                                        onRefresh();
                                    }
                                }}
                                className="flex-1 flex items-center justify-center gap-1 bg-purple-100 text-purple-700 py-2 rounded text-sm font-bold hover:bg-purple-200 transition"
                            >
                                <CheckCircle className="w-4 h-4" /> Hoàn thành
                            </button>
                        )}
                        <button onClick={handleEdit} className="flex-1 flex items-center justify-center gap-1 bg-yellow-100 text-yellow-700 py-2 rounded text-sm font-bold hover:bg-yellow-200 transition">
                          <Edit className="w-4 h-4" /> Sửa
                        </button>
                        <button onClick={handleDeleteClick} className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 py-2 rounded text-sm font-bold hover:bg-red-200 transition">
                          <Trash2 className="w-4 h-4" /> Xóa
                        </button>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Bình luận ({post.comments.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto mb-3 space-y-3 custom-scrollbar">
                      {post.comments.length > 0 ? post.comments.map(c => {
                        const author = commentAuthors[c.userId];
                        const points = author?.points;
                        const isPostAuthor = c.userId === post.authorId;
                        return (
                          <div key={c.id} className="bg-gray-50 p-3 rounded-lg text-sm group">
                            <div className="flex items-center mb-1">
                              <span className="font-bold text-blue-600 mr-2 flex items-center gap-1">
                                {isPostAuthor && <span className="text-red-600 text-xs font-extrabold border border-red-200 bg-red-50 px-1 rounded">[Admin]</span>}
                                {c.username}
                              </span>
                              {points !== undefined && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5" title="Điểm tích lũy">
                                  <Trophy className="w-2.5 h-2.5" /> {points}
                                </span>
                              )}
                              <span className="text-gray-400 text-xs ml-auto hidden group-hover:inline-block">
                                {formatTimeAgo(c.timestamp)}
                              </span>
                            </div>
                            <span className="text-gray-700 block">{c.content}</span>
                          </div>
                        );
                      }) : (
                        <p className="text-gray-400 text-xs italic">Chưa có bình luận nào.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {currentUser && (
                        <div className="text-xs text-gray-500 ml-1">
                            Bình luận với tư cách <span className="font-bold text-blue-600">{currentUser.username}</span> ({currentUser.points} điểm)
                        </div>
                      )}
                      <form onSubmit={handleComment} className="flex gap-2">
                        <input 
                          type="text" 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={currentUser ? "Viết bình luận..." : "Đăng nhập để bình luận"}
                          disabled={!currentUser}
                          className="flex-grow px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button 
                          type="submit" 
                          disabled={!currentUser}
                          className="text-blue-600 font-bold text-sm px-3 hover:bg-blue-50 rounded disabled:text-gray-400 disabled:hover:bg-transparent"
                        >
                          Gửi
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50 gap-2 relative z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition text-sm group"
                title={isLiked ? "Bỏ thích" : "Thích"}
              >
                <Heart className={`w-5 h-5 group-hover:fill-current transform group-hover:scale-110 transition-transform ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
              
              <div className="relative" ref={shareRef}>
                <button 
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition text-sm hover:scale-105"
                  title="Chia sẻ"
                >
                  <Share2 className="w-5 h-5" />
                  {post.sharedBy && post.sharedBy.length > 0 && <span>{post.sharedBy.length}</span>}
                </button>
                
                {/* Share Popup */}
                {isShareOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden animate-fade-in">
                    <button 
                      onClick={handleCopyLink}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                      {copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
                    </button>
                    <button 
                      onClick={() => handleShareSocial('facebook')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                    </button>
                    <button 
                      onClick={() => handleShareSocial('twitter')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4 text-blue-400" /> Twitter (X)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition transform active:scale-95"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>

              {post.status === 'OPEN' ? (
                isRegistered ? (
                   <button 
                    onClick={handleCancelRegister}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition flex items-center gap-2 group border ${
                        regStatus === 'PENDING' ? 'text-yellow-700 bg-yellow-100 hover:bg-red-100 border-yellow-200' :
                        regStatus === 'REJECTED' ? 'text-red-700 bg-red-100 border-red-200' :
                        'text-green-700 bg-green-100 hover:bg-red-100 hover:text-red-600 border-green-200'
                    }`}
                    title={regStatus === 'REJECTED' ? 'Đăng ký bị từ chối' : 'Click để hủy đăng ký'}
                   >
                     {regStatus === 'PENDING' && (
                         <>
                            <ClockIcon className="w-4 h-4 group-hover:hidden" />
                            <span className="group-hover:hidden">Đang chờ duyệt</span>
                         </>
                     )}
                     {regStatus === 'APPROVED' && (
                         <>
                            <Check className="w-4 h-4 group-hover:hidden" /> 
                            <span className="group-hover:hidden">Đã Được Duyệt</span>
                         </>
                     )}
                     {regStatus === 'REJECTED' && (
                         <>
                            <XCircle className="w-4 h-4" /> 
                            <span>Bị Từ Chối</span>
                         </>
                     )}
                     
                     <span className="hidden group-hover:inline-flex items-center gap-1"><X className="w-4 h-4"/> Hủy Đăng Ký</span>
                   </button>
                ) : (
                  <button 
                    onClick={handleOpenRegister}
                    disabled={isDeadlinePassed}
                    className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition shadow-md flex items-center gap-2 transform active:scale-95 ${isDeadlinePassed ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-1'}`}
                  >
                    {isDeadlinePassed ? (
                      <>
                        <XCircle className="w-4 h-4" /> Hết hạn đăng ký
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" /> Đăng Ký Ngay
                      </>
                    )}
                  </button>
                )
              ) : (
                 <button disabled className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-200 rounded-lg cursor-not-allowed">
                   {post.status === 'ENDED' ? 'Đã Kết Thúc' : 'Đóng Đăng Ký'}
                 </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRegisterModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center text-white">
              <h3 className="text-xl font-bold uppercase tracking-wide">Đăng Ký Tham Gia CLB</h3>
              <p className="text-blue-100 text-sm mt-1">{post.club}</p>
            </div>
            
            <form onSubmit={handleConfirmRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Họ và Tên *</label>
                <input 
                  type="text" 
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({...regForm, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Lớp *</label>
                   <select 
                      value={regForm.grade}
                      onChange={(e) => setRegForm({...regForm, grade: e.target.value, className: ''})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                   >
                     <option value="">Chọn khối</option>
                     <option value="10">Khối 10</option>
                     <option value="11">Khối 11</option>
                     <option value="12">Khối 12</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Chi tiết *</label>
                   <select 
                      value={regForm.className}
                      onChange={(e) => setRegForm({...regForm, className: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={!regForm.grade}
                      required
                   >
                     <option value="">Chọn lớp</option>
                     {regForm.grade && getClassOptions(regForm.grade).map(cls => (
                       <option key={cls} value={cls}>{cls}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Email *</label>
                <input 
                  type="email" 
                  value={regForm.email}
                  onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Câu lạc bộ muốn đăng ký *</label>
                <input 
                  type="text" 
                  value={post.club}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-0.5 mt-2"
              >
                GỬI YÊU CẦU ĐĂNG KÝ
              </button>
              
              <p className="text-center text-[10px] text-gray-400">
                Đăng ký của bạn sẽ được Admin duyệt trước khi chính thức tham gia.
              </p>
            </form>

            <button 
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-5 text-white flex justify-between items-center sticky top-0 z-10">
               <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit className="w-5 h-5" /> Chỉnh Sửa Sự Kiện
                  </h3>
                  <p className="text-yellow-100 text-xs mt-0.5">Cập nhật thông tin cho sự kiện này</p>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
               </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày diễn ra</label>
                    <input 
                      type="date" 
                      value={editForm.date} // Note: simple date format check might be needed if date format differs
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian</label>
                    <input 
                      type="text" 
                      value={editForm.time}
                      onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                      required
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Thời lượng</label>
                     <input 
                       type="text" 
                       value={editForm.duration || ''}
                       onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                       placeholder="VD: 2 giờ"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Hạn đăng ký</label>
                     <input 
                       type="date" 
                       value={editForm.registrationDeadline || ''}
                       onChange={(e) => setEditForm({...editForm, registrationDeadline: e.target.value})}
                       className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Địa điểm</label>
                  <input 
                    type="text" 
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="OPEN">Đang mở đăng ký (OPEN)</option>
                    <option value="CLOSED">Đóng đăng ký (CLOSED)</option>
                    <option value="ENDED">Đã kết thúc (ENDED)</option>
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link Ảnh</label>
                  <input 
                    type="text" 
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn</label>
                  <textarea 
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  ></textarea>
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung chi tiết</label>
                  <textarea 
                    rows={4}
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  ></textarea>
               </div>

               <div className="pt-4 flex gap-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Lưu Thay Đổi
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative overflow-hidden animate-fade-in p-6">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                   <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa sự kiện</h3>
                <p className="text-gray-500 mb-6 text-sm">
                   Bạn có chắc chắn muốn xóa sự kiện <span className="font-bold text-gray-800">"{post.title}"</span>? 
                   Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3 w-full">
                   <button 
                     onClick={() => setIsDeleteModalOpen(false)}
                     className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                   >
                     Hủy
                   </button>
                   <button 
                     onClick={handleConfirmDelete}
                     className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                   >
                     Xóa
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;