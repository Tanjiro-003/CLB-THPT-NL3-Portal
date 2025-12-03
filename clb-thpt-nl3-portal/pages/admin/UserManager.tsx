import React, { useEffect, useState } from 'react';
import { db } from '../../services/mockDatabase';
import { User, UserRole } from '../../types';
import { Trash2, Search, Shield, User as UserIcon, AlertCircle } from 'lucide-react';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(db.getUser());

  useEffect(() => {
    setUsers(db.getAllUsers());
  }, []);

  const handleDelete = (id: string, username: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${username}? Hành động này sẽ xóa toàn bộ dữ liệu của họ.`)) {
      db.deleteUser(id);
      setUsers(db.getAllUsers());
    }
  };

  const handleRoleChange = (userId: string, currentRole: UserRole) => {
    const newRole = currentRole === UserRole.ADMIN ? UserRole.STUDENT : UserRole.ADMIN;
    
    // Prevent self-demotion
    if (userId === currentUser?.id) {
        alert("Bạn không thể tự thay đổi quyền của chính mình.");
        return;
    }

    if (window.confirm(`Xác nhận thay đổi quyền của người dùng này thành ${newRole}?`)) {
        db.updateUserRole(userId, newRole);
        setUsers(db.getAllUsers());
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản Lý Thành Viên & Phân Quyền</h2>
           <p className="text-gray-500 text-sm">Quản lý danh sách, xóa thành viên và cấp quyền quản trị</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
           <input 
              type="text" 
              placeholder="Tìm kiếm thành viên..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Thành viên</th>
                <th className="px-6 py-3">Phân Quyền (Vai trò)</th>
                <th className="px-6 py-3">Điểm tích lũy</th>
                <th className="px-6 py-3">CLB theo dõi</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="p-1 text-gray-500" />}
                         </div>
                         <div>
                            <div className="font-bold text-gray-800">{user.fullName}</div>
                            <div className="text-xs text-gray-400">@{user.username}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <select 
                            value={user.role}
                            onChange={() => handleRoleChange(user.id, user.role)}
                            disabled={user.id === currentUser?.id}
                            className={`px-3 py-1.5 rounded text-xs font-bold border outline-none cursor-pointer transition
                                ${user.role === UserRole.ADMIN 
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                          >
                             <option value={UserRole.STUDENT}>Học Sinh</option>
                             <option value={UserRole.ADMIN}>Quản Trị Viên</option>
                          </select>
                          {user.role === UserRole.ADMIN && <Shield className="w-3 h-3 text-purple-600" />}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-mono text-blue-600 font-bold">{user.points}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-wrap gap-1">
                          {user.followedClubs && user.followedClubs.length > 0 ? (
                              user.followedClubs.map((club, idx) => (
                                  <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                      {club}
                                  </span>
                              ))
                          ) : (
                              <span className="text-gray-400 text-xs">-</span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {user.id !== currentUser?.id ? (
                           <button 
                             onClick={() => handleDelete(user.id, user.username)}
                             className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                             title="Xóa thành viên"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                       ) : (
                           <span className="text-xs text-gray-400 italic">Hiện tại</span>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy thành viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
         <div>
            <h4 className="font-bold text-blue-800 text-sm">Lưu ý về phân quyền</h4>
            <p className="text-sm text-blue-700 mt-1">
               - <strong>Học Sinh:</strong> Chỉ có thể xem, đăng ký sự kiện và bình luận.<br/>
               - <strong>Quản Trị Viên:</strong> Có toàn quyền truy cập trang quản trị, đăng bài, sửa xóa bài, và quản lý thành viên.
            </p>
         </div>
      </div>
    </div>
  );
};

export default UserManager;