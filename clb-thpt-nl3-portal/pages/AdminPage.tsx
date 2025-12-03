import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, ClubType, EventPost } from '../types';
import { db } from '../services/mockDatabase';

interface AdminPageProps {
  user: User | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [club, setClub] = useState<ClubType>(ClubType.DTC);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Redirect if not admin
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
           <h2 className="text-2xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
           <p className="text-gray-600 mb-4">Bạn không có quyền quản trị viên.</p>
           <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded">
             Về trang chủ
           </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!title || !date || !time) return alert('Vui lòng điền đầy đủ thông tin bắt buộc');

    const newPost: EventPost = {
      id: Date.now().toString(),
      title,
      club,
      description,
      content: description, // Simplification for demo
      imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/800/600`, // Default random image
      date,
      time,
      location: location || 'Trường THPT NL3',
      authorId: user.id,
      likedBy: [],
      sharedBy: [],
      comments: [],
      status: 'OPEN' as const
    };

    db.addPost(newPost);
    alert('Đăng bài thành công!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Đăng Bài Viết / Sự Kiện Mới</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề sự kiện *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="VD: Sinh hoạt CLB Tiếng Anh tháng 5"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Câu lạc bộ</label>
                <select 
                  value={club}
                  onChange={(e) => setClub(e.target.value as ClubType)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.values(ClubType).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="VD: Hội trường A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày diễn ra *</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian *</label>
                <input 
                  type="text" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="VD: 14:00 - 16:00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh (URL)</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://example.com/image.jpg (Để trống sẽ lấy ảnh ngẫu nhiên)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả nội dung</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Chi tiết về hoạt động..."
              ></textarea>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Đăng Bài
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;