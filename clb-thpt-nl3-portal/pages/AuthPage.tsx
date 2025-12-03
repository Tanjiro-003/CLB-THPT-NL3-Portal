import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ADMIN, MOCK_USER } from '../data';
import { db } from '../services/mockDatabase';
import { User, UserRole } from '../types';

interface AuthPageProps {
  setUser: (u: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation Logic
    let loggedInUser: User;
    
    // 1. Check if user already exists in our "Database"
    const allUsers = db.getAllUsers();
    const existingUser = allUsers.find(u => u.username === username);

    if (existingUser && isLogin) {
        // Using existing user data (preserves Role changes made in Admin Dashboard)
        loggedInUser = existingUser;
    } else {
        // Fallback / Registration logic
        if (username === 'admin') {
          loggedInUser = MOCK_ADMIN;
        } else {
          // Generate a simple pseudo-unique ID based on username for demo purposes
          const pseudoId = `user_${username.toLowerCase().replace(/\s/g, '')}`;
          
          loggedInUser = { 
            ...MOCK_USER, 
            id: pseudoId,
            username: username || 'student',
            fullName: username 
          };
        }
    }

    // Save to local state and db
    db.saveUser(loggedInUser);
    setUser(loggedInUser);
    
    // Redirect based on role
    if (loggedInUser.role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
    } else {
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
         
         <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? 'Đăng Nhập' : 'Đăng Ký Thành Viên'}</h1>
           <p className="text-gray-500 text-sm">Chào mừng đến với CLB THPT NL3</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Nhập 'admin' để thử quyền quản trị"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02] shadow-md">
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký Ngay'}
            </button>
         </form>

         <div className="mt-6 text-center">
           <p className="text-sm text-gray-600">
             {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
             <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-blue-600 font-bold hover:underline"
             >
               {isLogin ? "Đăng ký" : "Đăng nhập"}
             </button>
           </p>
         </div>
       </div>
    </div>
  );
};

export default AuthPage;