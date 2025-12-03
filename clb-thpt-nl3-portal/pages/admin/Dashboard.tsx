import React, { useEffect, useState } from 'react';
import { db } from '../../services/mockDatabase';
import { AppStats, ActivityLog, ClubType } from '../../types';
import { Users, Calendar, Eye, Activity, TrendingUp, PieChart, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AppStats>(db.getStats());
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [clubDistribution, setClubDistribution] = useState<{name: string, count: number, percent: number}[]>([]);

  useEffect(() => {
    const loadData = () => {
        setStats(db.getStats());
        setLogs(db.getLogs());

        // Calculate Club Distribution
        const posts = db.getPosts();
        const totalPosts = posts.length;
        if (totalPosts > 0) {
            const counts: Record<string, number> = {};
            // Initialize counts
            Object.values(ClubType).forEach(c => counts[c] = 0);
            
            posts.forEach(p => {
                counts[p.club] = (counts[p.club] || 0) + 1;
            });

            const dist = Object.keys(counts).map(key => ({
                name: key,
                count: counts[key],
                percent: Math.round((counts[key] / totalPosts) * 100)
            })).sort((a, b) => b.count - a.count);
            
            setClubDistribution(dist);
        }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Tổng Quan Hệ Thống</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Hệ thống hoạt động bình thường
                </span>
            </div>
        </div>
        <Link 
            to="/admin/create-event"
            className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2 transform active:scale-95"
        >
            <PlusCircle className="w-5 h-5" />
            Đăng Sự Kiện Mới
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Tổng Lượt Truy Cập</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.visitors.toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Eye className="w-6 h-6" />
             </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
             <TrendingUp className="w-3 h-3 mr-1" /> +12% so với tháng trước
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Thành Viên</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.members}</h3>
             </div>
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-6 h-6" />
             </div>
          </div>
           <div className="mt-4 flex items-center text-xs text-purple-600 font-medium">
             Đang hoạt động tích cực
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Sự Kiện</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.eventsCount}</h3>
             </div>
             <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Calendar className="w-6 h-6" />
             </div>
          </div>
           <div className="mt-4 flex items-center text-xs text-gray-500">
             <Link to="/admin/events" className="hover:text-blue-600 hover:underline">Quản lý sự kiện &rarr;</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Hoạt Động</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{logs.length}</h3>
             </div>
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Activity className="w-6 h-6" />
             </div>
          </div>
           <div className="mt-4 flex items-center text-xs text-gray-500">
             Log hệ thống
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" /> Phân Bố Sự Kiện Theo CLB
                    </h3>
                </div>
                
                <div className="space-y-4">
                    {clubDistribution.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{item.name}</span>
                                <span className="text-gray-500 font-mono">{item.count} bài ({item.percent}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                                        index === 0 ? 'bg-blue-500' :
                                        index === 1 ? 'bg-indigo-500' :
                                        index === 2 ? 'bg-purple-500' :
                                        index === 3 ? 'bg-pink-500' : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${item.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {clubDistribution.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">Chưa có dữ liệu thống kê.</p>
                    )}
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Nhật Ký Hoạt Động</h3>
                </div>
                <div className="max-h-64 overflow-y-auto p-0">
                    {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Chưa có hoạt động nào được ghi nhận.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                            <tr>
                            <th className="px-6 py-3">Hành động</th>
                            <th className="px-6 py-3">Người thực hiện</th>
                            <th className="px-6 py-3">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-3">
                                    <span className={`inline-flex items-center gap-2 ${
                                        log.type === 'SUCCESS' ? 'text-green-600' : 
                                        log.type === 'WARNING' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                        {log.type === 'SUCCESS' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                                        {log.type === 'WARNING' && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                                        {log.type === 'INFO' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-3 font-medium text-gray-700">{log.user}</td>
                                <td className="px-6 py-3 text-gray-400 text-xs">
                                {new Date(log.timestamp).toLocaleString('vi-VN')}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        {/* Quick Tips Panel */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-6 flex flex-col justify-between h-fit">
           <div>
              <h3 className="font-bold text-lg mb-2">Lời Khuyên Quản Trị</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                 Để tăng tương tác, hãy thường xuyên cập nhật sự kiện mới vào đầu tuần. Đừng quên kiểm tra và phản hồi các bình luận của thành viên.
              </p>
              <div className="space-y-2">
                 <div className="bg-white/10 p-3 rounded-lg text-xs">
                    💡 <strong>Mẹo:</strong> Sử dụng hình ảnh chất lượng cao để thu hút người xem hơn.
                 </div>
                 <div className="bg-white/10 p-3 rounded-lg text-xs">
                    🔥 <strong>Hot:</strong> CLB Tiếng Anh đang có lượng đăng ký tăng đột biến.
                 </div>
              </div>
           </div>
           <Link to="/admin/events" className="mt-6 w-full py-2 bg-white text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-50 transition text-center flex items-center justify-center gap-1">
              Quản lý sự kiện <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;