export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export enum ClubType {
  DTC = 'CLB Chuyển đổi số',
  ENGLISH = 'CLB Tiếng Anh',
  BOOKS = 'CLB Sách',
  SCIENCE = 'CLB KHTN',
  LITERATURE = 'CLB Văn học'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  points: number;
  avatar?: string;
  followedClubs?: ClubType[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'EVENT' | 'SYSTEM';
  isRead: boolean;
  timestamp: number;
  link?: string;
}

export interface RegistrationInfo {
  userId: string;
  fullName: string;
  grade: string;
  className: string;
  email: string;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EventPost {
  id: string;
  title: string;
  club: ClubType;
  description: string;
  content: string;
  imageUrl: string;
  date: string;
  time: string;
  duration?: string;
  location: string;
  authorId: string;
  
  // Interaction Tracking
  likedBy: string[]; // List of User IDs who liked
  sharedBy: string[]; // List of User IDs who shared
  comments: Comment[];
  
  status: 'OPEN' | 'CLOSED' | 'ENDED';
  registrationDeadline?: string;
  registeredUserIds?: string[];
  registrations?: RegistrationInfo[];
  
  // File System Simulation
  folderPath?: string; // e.g., "events/2025/clb-dtc/event-name"
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: number;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}

export interface AppStats {
  visitors: number;
  members: number;
  eventsCount: number;
  awards: number;
}