import { EventPost, User, AppStats, Comment, Notification, ClubType, RegistrationInfo, ActivityLog, UserRole } from '../types';
import { INITIAL_POSTS, INITIAL_STATS } from '../data';

const KEYS = {
  POSTS: 'nl3_posts',
  STATS: 'nl3_stats',
  USER: 'nl3_current_user',
  ALL_USERS: 'nl3_all_users',
  NOTIFICATIONS: 'nl3_notifications',
  LOGS: 'nl3_activity_logs'
};

export const db = {
  // --- CORE ---
  logActivity: (action: string, user: string, type: 'INFO' | 'WARNING' | 'SUCCESS' = 'INFO') => {
    const logs = db.getLogs();
    const newLog: ActivityLog = {
      id: Date.now().toString() + Math.random(),
      action,
      user,
      timestamp: Date.now(),
      type
    };
    // Keep last 50 logs
    const updatedLogs = [newLog, ...logs].slice(0, 50);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(updatedLogs));
  },

  getLogs: (): ActivityLog[] => {
    const stored = localStorage.getItem(KEYS.LOGS);
    return stored ? JSON.parse(stored) : [];
  },

  getPosts: (): EventPost[] => {
    const stored = localStorage.getItem(KEYS.POSTS);
    if (!stored) {
      localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const posts = JSON.parse(stored);
    return posts.map((p: any) => ({
      ...p,
      registeredUserIds: p.registeredUserIds || [],
      registrations: p.registrations || [],
      likedBy: p.likedBy || (p.likes ? Array(p.likes).fill('unknown') : []), // Backward compatibility
      sharedBy: p.sharedBy || []
    }));
  },

  getAllUsers: (): User[] => {
    const allUsersStr = localStorage.getItem(KEYS.ALL_USERS);
    return allUsersStr ? JSON.parse(allUsersStr) : [];
  },

  deleteUser: (userId: string) => {
    let users = db.getAllUsers();
    const userToDelete = users.find(u => u.id === userId);
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    
    // Also remove from stats
    const stats = db.getStats();
    stats.members = Math.max(0, stats.members - 1);
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));

    if(userToDelete) {
      db.logActivity(`Đã xóa thành viên: ${userToDelete.username}`, 'Admin', 'WARNING');
    }
  },

  updateUserRole: (userId: string, newRole: UserRole) => {
    let users = db.getAllUsers();
    let updatedUser: User | null = null;

    users = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, role: newRole };
        return updatedUser;
      }
      return u;
    });

    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));

    // Update current session user if it's the same person
    const currentUser = db.getUser();
    if (currentUser && currentUser.id === userId) {
      db.saveUser({ ...currentUser, role: newRole });
    }

    if (updatedUser) {
      db.logActivity(`Phân quyền: ${updatedUser.username} -> ${newRole}`, 'Admin', 'WARNING');
    }
    return updatedUser;
  },

  // Update generic user info (Name, Avatar)
  updateUserInfo: (userId: string, data: Partial<User>) => {
    let users = db.getAllUsers();
    let updatedUser: User | null = null;

    users = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...data };
        return updatedUser;
      }
      return u;
    });

    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));

    // Update current session user
    const currentUser = db.getUser();
    if (currentUser && currentUser.id === userId) {
      db.saveUser(updatedUser);
    }
    
    if (updatedUser) {
      db.logActivity(`Cập nhật thông tin cá nhân: ${updatedUser.username}`, updatedUser.username, 'INFO');
    }
    return updatedUser;
  },

  addPost: (post: EventPost) => {
    // Generate simulated folder path based on date and club
    const year = post.date.split('-')[0];
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const folderPath = `data/events/${year}/${post.club.replace(/\s+/g, '_')}/${slug}`;

    const newPost = { ...post, folderPath, likedBy: [], sharedBy: [] };

    const posts = db.getPosts();
    const newPosts = [newPost, ...posts];
    localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
    
    const stats = db.getStats();
    stats.eventsCount += 1;
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));

    db.logActivity(`Đăng sự kiện mới: ${post.title} (Lưu tại: ${folderPath})`, 'Admin', 'SUCCESS');

    // Notifications
    const allUsers = db.getAllUsers();
    const followers = allUsers.filter(u => u.followedClubs && u.followedClubs.includes(post.club));
    const notifications = db.getAllNotifications();
    
    followers.forEach(user => {
      if (user.id !== post.authorId) {
        notifications.push({
          id: Date.now().toString() + Math.random().toString(),
          userId: user.id,
          message: `${post.club} vừa đăng sự kiện mới: "${post.title}"`,
          type: 'EVENT',
          isRead: false,
          timestamp: Date.now(),
          link: `/#event-${post.id}`
        });
      }
    });
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  updatePost: (updatedPost: EventPost) => {
    const posts = db.getPosts();
    const newPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
    db.logActivity(`Cập nhật sự kiện: ${updatedPost.title}`, 'Admin', 'INFO');
  },

  toggleEventStatus: (postId: string, newStatus: 'OPEN' | 'CLOSED' | 'ENDED') => {
    const posts = db.getPosts();
    let postTitle = '';
    const newPosts = posts.map(p => {
      if (p.id === postId) {
        postTitle = p.title;
        return { ...p, status: newStatus };
      }
      return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
    db.logActivity(`Đổi trạng thái sự kiện: ${postTitle} -> ${newStatus}`, 'Admin', 'INFO');
  },

  deletePost: (id: string) => {
    let posts = db.getPosts();
    const post = posts.find(p => p.id === id);
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    
    const stats = db.getStats();
    stats.eventsCount = Math.max(0, stats.eventsCount - 1);
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));

    if(post) {
      db.logActivity(`Đã xóa sự kiện: ${post.title}`, 'Admin', 'WARNING');
    }
  },

  getStats: (): AppStats => {
    const stored = localStorage.getItem(KEYS.STATS);
    if (!stored) {
      localStorage.setItem(KEYS.STATS, JSON.stringify(INITIAL_STATS));
      return INITIAL_STATS;
    }
    return JSON.parse(stored);
  },

  incrementVisitor: () => {
    const stats = db.getStats();
    stats.visitors += 1;
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    return stats;
  },

  addComment: (postId: string, comment: Comment) => {
    const posts = db.getPosts();
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, comment] };
      }
      return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));
  },

  toggleLike: (postId: string, userId: string) => {
    const posts = db.getPosts();
    let action = 'liked';
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        if (likedBy.includes(userId)) {
          action = 'unliked';
          return { ...p, likedBy: likedBy.filter(id => id !== userId) };
        } else {
          return { ...p, likedBy: [...likedBy, userId] };
        }
      }
      return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));
    // Optional: Log like activity only on like, not unlike to avoid spam
    // if (action === 'liked') db.logActivity(`${userId} đã thích sự kiện`, userId, 'INFO');
  },

  shareEvent: (postId: string, userId: string) => {
    const posts = db.getPosts();
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
         const sharedBy = p.sharedBy || [];
         if (!sharedBy.includes(userId)) {
             return { ...p, sharedBy: [...sharedBy, userId] };
         }
      }
      return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));
    db.logActivity(`Người dùng ${userId} đã chia sẻ sự kiện`, userId, 'SUCCESS');
  },

  registerForEvent: (postId: string, info: RegistrationInfo) => {
    const posts = db.getPosts();
    let postTitle = '';
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        postTitle = p.title;
        const registrations = p.registrations || [];
        const registeredIds = p.registeredUserIds || [];
        
        if (registeredIds.includes(info.userId)) {
          return p;
        }

        // Initialize status as PENDING
        const newRegistration = { ...info, status: 'PENDING' as const };

        return { 
          ...p, 
          registeredUserIds: [...registeredIds, info.userId],
          registrations: [...registrations, newRegistration]
        };
      }
      return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));
    db.logActivity(`Thành viên ${info.fullName} gửi yêu cầu đăng ký ${postTitle}`, info.fullName, 'INFO');
  },

  updateRegistrationStatus: (postId: string, userId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const posts = db.getPosts();
    let post = null;
    let userName = '';
    
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        post = p;
        const updatedRegistrations = (p.registrations || []).map(r => {
            if (r.userId === userId) {
                userName = r.fullName;
                // Only award points if changing to APPROVED for the first time
                if (newStatus === 'APPROVED' && r.status !== 'APPROVED') {
                     // Logic to award points handled below outside map to access allUsers
                }
                return { ...r, status: newStatus };
            }
            return r;
        });
        return { ...p, registrations: updatedRegistrations };
      }
      return p;
    });

    localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));

    // Handle points awarding if Approved
    if (newStatus === 'APPROVED' && post) {
        let allUsers = db.getAllUsers();
        let updatedUser = null;
        allUsers = allUsers.map(u => {
            if (u.id === userId) {
                const pointsAwarded = 20;
                updatedUser = { ...u, points: (u.points || 0) + pointsAwarded };
                return updatedUser;
            }
            return u;
        });
        localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
        
        // Update current session if applicable (will require refresh in UI)
        const currentUser = db.getUser();
        if (currentUser && currentUser.id === userId) {
            db.saveUser(updatedUser);
        }

        db.logActivity(`Đã duyệt đăng ký cho ${userName} (+20 điểm)`, 'Admin', 'SUCCESS');
        
        // Notify user with enhanced details
        const notifications = db.getAllNotifications();
        const p = post as EventPost;
        notifications.push({
            id: Date.now().toString(),
            userId: userId,
            message: `🎉 Chúc mừng! Đăng ký tham gia "${p.title}" đã được DUYỆT.\n⏰ ${p.time} | 📍 ${p.location}`,
            type: 'SYSTEM',
            isRead: false,
            timestamp: Date.now(),
            link: `/#event-${p.id}` // Link to specific event
        });
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    } else if (newStatus === 'REJECTED' && post) {
        db.logActivity(`Đã từ chối đăng ký của ${userName}`, 'Admin', 'WARNING');
        // Notify user
        const notifications = db.getAllNotifications();
        const p = post as EventPost;
        notifications.push({
            id: Date.now().toString(),
            userId: userId,
            message: `Rất tiếc, đăng ký tham gia sự kiện "${p.title}" của bạn đã bị từ chối.`,
            type: 'SYSTEM',
            isRead: false,
            timestamp: Date.now(),
            link: `/#event-${p.id}`
        });
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  },

  cancelRegistration: (postId: string, userId: string) => {
    const posts = db.getPosts();
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const registrations = p.registrations || [];
        const registeredIds = p.registeredUserIds || [];
        
        return { 
          ...p, 
          registeredUserIds: registeredIds.filter(id => id !== userId),
          registrations: registrations.filter(r => r.userId !== userId)
        };
      }
      return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));
  },

  getUserEvents: (userId: string): EventPost[] => {
    const posts = db.getPosts();
    return posts.filter(p => p.registeredUserIds && p.registeredUserIds.includes(userId));
  },

  saveUser: (user: User | null) => {
    if (user) {
      if (!user.followedClubs) user.followedClubs = [];
      localStorage.setItem(KEYS.USER, JSON.stringify(user));

      const allUsers = db.getAllUsers();
      const existingIndex = allUsers.findIndex(u => u.id === user.id);
      
      if (existingIndex >= 0) {
        allUsers[existingIndex] = user;
      } else {
        allUsers.push(user);
        // Only log new signups if not in list
        db.logActivity(`Thành viên mới gia nhập: ${user.username}`, user.username, 'SUCCESS');
      }
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  getAllNotifications: (): Notification[] => {
    const stored = localStorage.getItem(KEYS.NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  },

  getUserNotifications: (userId: string): Notification[] => {
    const all = db.getAllNotifications();
    return all.filter(n => n.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  },

  markNotificationAsRead: (notificationId: string) => {
    const all = db.getAllNotifications();
    const updated = all.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  toggleFollowClub: (userId: string, club: ClubType) => {
    const user = db.getUser();
    if (!user || user.id !== userId) return null;

    let followed = user.followedClubs || [];
    if (followed.includes(club)) {
      followed = followed.filter(c => c !== club);
    } else {
      followed.push(club);
    }

    const updatedUser = { ...user, followedClubs: followed };
    db.saveUser(updatedUser);
    return updatedUser;
  }
};