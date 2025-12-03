import React, { useEffect, useState } from 'react';
import { db } from '../../services/mockDatabase';
import { EventPost } from '../../types';
import { Link, useLocation } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus, Search, AlertTriangle, Power, CheckSquare, Square, X, Check } from 'lucide-react';

const EventManager: React.FC = () => {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
  
  // Selection State
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{id: string, title: string} | null>(null);

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [postToStatusChange, setPostToStatusChange] = useState<{id: string, title: string, nextStatus: 'OPEN' | 'CLOSED' | 'ENDED'} | null>(null);

  useEffect(() => {
    setPosts(db.getPosts());
  }, []);

  // Update searchTerm if navigated with state (e.g. from EventCard link)
  useEffect(() => {
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state]);

  const initiateDelete = (post: EventPost) => {
    setPostToDelete({ id: post.id, title: post.title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      db.deletePost(postToDelete.id);
      refreshData();
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const initiateStatusChange = (post: EventPost) => {
     // Cycle through statuses: OPEN -> CLOSED -> ENDED -> OPEN
     let newStatus: 'OPEN' | 'CLOSED' | 'ENDED' = 'OPEN';
     if (post.status === 'OPEN') newStatus = 'CLOSED';
     else if (post.status === 'CLOSED') newStatus = 'ENDED';
     else newStatus = 'OPEN';

     setPostToStatusChange({
         id: post.id,
         title: post.title,
         nextStatus: newStatus
     });
     setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
     if (postToStatusChange) {
         db.toggleEventStatus(postToStatusChange.id, postToStatusChange.nextStatus);
         refreshData();
         setIsStatusModalOpen(false);
         setPostToStatusChange(null);
     }
  };

  const refreshData = () => {
      setPosts(db.getPosts());
      setSelectedPostIds(new Set()); // Clear selection after action
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedPostIds.size === filteredPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      const allIds = new Set(filteredPosts.map(p => p.id));
      setSelectedPostIds(allIds);
    }
  };

  const toggleSelectPost = (id: string) => {
    const newSelected = new Set(selectedPostIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPostIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedPostIds.size} sự kiện đã chọn?`)) {
      selectedPostIds.forEach(id => db.deletePost(id));
      refreshData();
    }
  };

  const handleBulkStatusChange = (status: 'OPEN' | 'CLOSED' | 'ENDED') => {
    if (window.confirm(`Chuyển trạng thái ${selectedPostIds.size} sự kiện sang ${status}?`)) {
      selectedPostIds.forEach(id => db.toggleEventStatus(id, status));
      refreshData();
    }
  };

  const handleApproveAll = () => {
    if (window.confirm(`Bạn có chắc muốn DUYỆT và MỞ ĐĂNG KÝ (OPEN) cho ${selectedPostIds.size} sự kiện đã chọn?`)) {
      selectedPostIds.forEach(id => db.toggleEventStatus(id, 'OPEN'));
      refreshData();
    }
  };

  const users = db.getAllUsers();

  const filteredPosts = posts.filter(p => {
    const author = users.find(u => u.id === p.authorId);
    const authorName = author?.fullName || '';
    const searchLower = searchTerm.toLowerCase();

    return (
      p.title.toLowerCase().includes(searchLower) ||
      p.club.toLowerCase().includes(searchLower) ||
      authorName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản Lý Sự Kiện</h2>
           <p className="text-gray-500 text-sm">Danh sách tất cả các sự kiện của các CLB</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Tìm theo tên, CLB, tác giả..." 
                 className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Link to="/admin/create-event" className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
             <Plus className="w-4 h-4" /> Thêm Mới
           </Link>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedPostIds.size > 0 && (
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between animate-fade-in sticky top-4 z-20">
          <div className="font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Đã chọn {selectedPostIds.size} sự kiện
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button 
                onClick={handleApproveAll} 
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded text-sm font-bold flex items-center gap-1 shadow-sm transition"
            >
                <Check className="w-4 h-4" /> Duyệt Tất Cả (Open)
            </button>
            <div className="w-px bg-white/30 mx-1"></div>
            <button onClick={() => handleBulkStatusChange('CLOSED')} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium">Đóng Đăng Ký</button>
            <button onClick={() => handleBulkStatusChange('ENDED')} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium">Kết Thúc</button>
            <div className="w-px bg-white/30 mx-1"></div>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded text-sm font-bold flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
            <button onClick={() => setSelectedPostIds(new Set())} className="ml-2 p-1.5 hover:bg-white/20 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                    {selectedPostIds.size === filteredPosts.length && filteredPosts.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">Sự kiện</th>
                <th className="px-6 py-3">CLB</th>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3 text-center">Đăng ký</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => {
                   const author = users.find(u => u.id === post.authorId);
                   const isSelected = selectedPostIds.has(post.id);
                   return (
                    <tr key={post.id} className={`hover:bg-blue-50/30 transition ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelectPost(post.id)} className="text-gray-400 hover:text-blue-600">
                          {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{post.title}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">{post.description}</div>
                        <div className="text-xs text-blue-500 mt-1">Đăng bởi: {author?.fullName || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          {post.club}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div>{post.date}</div>
                        <div className="text-xs text-gray-400">{post.time}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-blue-600 text-lg">
                            {post.registrations?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <button 
                           onClick={() => initiateStatusChange(post)}
                           className={`px-2 py-1 rounded-full text-xs font-bold uppercase transition hover:opacity-80 flex items-center gap-1
                             ${post.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                               post.status === 'ENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                           title="Click để thay đổi trạng thái"
                         >
                            {post.status === 'OPEN' ? 'Đang mở' : post.status === 'ENDED' ? 'Đã hết' : 'Đóng'}
                            <Power className="w-3 h-3 ml-1" />
                         </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => alert('Tính năng xem nhanh đang phát triển')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => alert('Vui lòng sử dụng tính năng Sửa ở Trang Chủ hoặc thẻ sự kiện')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => initiateDelete(post)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa sự kiện">
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy sự kiện nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-fade-in p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Bạn có chắc chắn muốn xóa sự kiện <span className="font-bold text-gray-800">"{postToDelete.title}"</span>?<br/> 
                Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {isStatusModalOpen && postToStatusChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-fade-in p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Power className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thay đổi trạng thái</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Bạn có chắc chắn muốn chuyển trạng thái sự kiện <span className="font-bold text-gray-800">"{postToStatusChange.title}"</span> sang <span className="font-bold text-blue-600">{postToStatusChange.nextStatus}</span>?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsStatusModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmStatusChange}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;