import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ClubType, EventPost } from '../../types';
import { db } from '../../services/mockDatabase';
import { Save, X, Image as ImageIcon, RefreshCw, Eye, FolderOpen, FileJson } from 'lucide-react';
import EventCard from '../../components/EventCard';

interface CreateEventProps {
  user: User | null;
}

const CreateEvent: React.FC<CreateEventProps> = ({ user }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [club, setClub] = useState<ClubType>(ClubType.DTC);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'ENDED'>('OPEN');
  
  // Simulated Folder Path
  const [folderPath, setFolderPath] = useState('');

  useEffect(() => {
    // Auto-update simulated folder path
    const year = date ? date.split('-')[0] : new Date().getFullYear();
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'new-event';
    const clubSlug = club.replace(/\s+/g, '_');
    setFolderPath(`data/events/${year}/${clubSlug}/${slug}`);
  }, [title, club, date]);

  const generateRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setImageUrl(`https://picsum.photos/id/${randomId}/800/600`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; 
    if (!title || !date || !time) return alert('Vui lòng điền đầy đủ thông tin bắt buộc');

    const newPost: EventPost = {
      id: Date.now().toString(),
      title,
      club,
      description,
      content: content || description || 'Chưa có nội dung chi tiết',
      imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/800/600`,
      date,
      time,
      duration: duration || undefined,
      registrationDeadline: registrationDeadline || undefined,
      location: location || 'Trường THPT NL3',
      authorId: user.id,
      likedBy: [],
      sharedBy: [],
      comments: [],
      status: status,
      folderPath: folderPath
    };

    db.addPost(newPost);
    alert(`Đăng bài thành công!\nDữ liệu đã được lưu tại: ${folderPath}`);
    navigate('/admin/events');
  };

  // Construct a preview object
  const previewPost: EventPost = {
    id: 'preview',
    title: title || 'Tiêu đề sự kiện (Xem trước)',
    club: club,
    description: description || 'Mô tả ngắn về sự kiện sẽ hiển thị ở đây...',
    content: content || 'Nội dung chi tiết của sự kiện...',
    imageUrl: imageUrl || 'https://via.placeholder.com/800x600?text=Preview+Image',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '00:00',
    duration: duration,
    registrationDeadline: registrationDeadline,
    location: location || 'Địa điểm tổ chức',
    authorId: user?.id || 'admin',
    likedBy: [],
    sharedBy: [],
    comments: [],
    status: status,
    registrations: [],
    registeredUserIds: []
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-10">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Tạo Sự Kiện Mới</h2>
                <p className="text-sm text-gray-500">Điền thông tin để đăng tải sự kiện lên cổng thông tin</p>
            </div>
            <button 
                onClick={() => navigate('/admin/events')}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                title="Đóng"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* Folder Path Simulation Display */}
                <div className="bg-gray-800 text-gray-300 font-mono text-xs p-3 rounded-lg mb-6 flex items-center gap-2 overflow-x-auto">
                   <FolderOpen className="w-4 h-4 text-yellow-400 shrink-0" />
                   <span>/root/</span>
                   <span className="text-white">{folderPath}</span>
                   <span className="text-yellow-400">/info.json</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Section */}
                    <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tiêu đề sự kiện <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none text-lg font-medium"
                        placeholder="VD: Hội thảo Hướng nghiệp 2025"
                        required
                    />
                    </div>

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Câu lạc bộ tổ chức</label>
                        <select 
                        value={club}
                        onChange={(e) => setClub(e.target.value as ClubType)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                        {Object.values(ClubType).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Địa điểm</label>
                        <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: Sân trường, Hội trường A"
                        />
                    </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Ngày diễn ra <span className="text-red-500">*</span></label>
                        <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Khung giờ <span className="text-red-500">*</span></label>
                        <input 
                        type="text" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: 14:00 - 17:00"
                        required
                        />
                    </div>
                    </div>

                    {/* Extra Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Thời lượng (dự kiến)</label>
                        <input 
                        type="text" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: 2 tiếng"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Hạn chót đăng ký</label>
                        <input 
                        type="date" 
                        value={registrationDeadline}
                        onChange={(e) => setRegistrationDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    </div>
                    
                    {/* Status Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Trạng thái ban đầu</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${status === 'OPEN' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="status" value="OPEN" checked={status === 'OPEN'} onChange={() => setStatus('OPEN')} className="hidden" />
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Đang Mở (Open)
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${status === 'CLOSED' ? 'bg-gray-100 border-gray-500 text-gray-700 font-bold' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="status" value="CLOSED" checked={status === 'CLOSED'} onChange={() => setStatus('CLOSED')} className="hidden" />
                                <span className="w-2 h-2 rounded-full bg-gray-500"></span> Đóng (Closed)
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${status === 'ENDED' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="status" value="ENDED" checked={status === 'ENDED'} onChange={() => setStatus('ENDED')} className="hidden" />
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Kết Thúc (Ended)
                            </label>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex justify-between">
                        <span>Ảnh bìa (URL)</span>
                        <button 
                            type="button" 
                            onClick={generateRandomImage}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Chọn ngẫu nhiên
                        </button>
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mô tả ngắn</label>
                    <textarea 
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        placeholder="Tóm tắt ngắn gọn về sự kiện..."
                    ></textarea>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nội dung chi tiết</label>
                    <textarea 
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        placeholder="Nhập toàn bộ thông tin chi tiết, lịch trình, khách mời..."
                    ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 flex gap-4 border-t border-gray-100">
                    <button 
                        type="submit" 
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5"
                    >
                        <Save className="w-5 h-5" /> LƯU SỰ KIỆN VÀO HỆ THỐNG
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin/events')}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy Bỏ
                    </button>
                    </div>
                </form>
            </div>

            {/* Live Preview Section */}
            <div className="lg:col-span-1 sticky top-6">
                <div className="flex items-center gap-2 mb-3 text-gray-500 uppercase text-xs font-bold tracking-wider">
                    <Eye className="w-4 h-4" /> Xem trước (Live Preview)
                </div>
                <div className="pointer-events-none opacity-90 scale-95 origin-top">
                    <EventCard 
                        post={previewPost} 
                        currentUser={user} 
                        onRefresh={() => {}} 
                    />
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
                    <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                       <FileJson className="w-4 h-4" /> Cấu trúc dữ liệu
                    </h4>
                    <p className="text-xs text-blue-700">
                        Sự kiện sẽ được lưu dưới dạng file JSON tại thư mục tương ứng.
                        Thông tin like, share và comment sẽ được cập nhật trực tiếp vào file này.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CreateEvent;