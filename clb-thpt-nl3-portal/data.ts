import { ClubType, EventPost, UserRole, User } from './types';

export const INITIAL_STATS = {
  visitors: 12543,
  members: 1000,
  eventsCount: 40,
  awards: 8
};

export const MOCK_USER: User = {
  id: 'u1',
  username: 'student1',
  role: UserRole.STUDENT,
  fullName: 'Nguyễn Văn A',
  points: 150,
  avatar: 'https://picsum.photos/id/64/100/100',
  followedClubs: [ClubType.DTC, ClubType.ENGLISH]
};

export const MOCK_ADMIN: User = {
  id: 'a1',
  username: 'admin',
  role: UserRole.ADMIN,
  fullName: 'Quản Trị Viên',
  points: 9999,
  avatar: 'https://picsum.photos/id/2/100/100',
  followedClubs: []
};

// Helper to simulate folder path
const getPath = (club: string, date: string, title: string) => {
  const year = date.split('-')[0];
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `data/events/${year}/${club.replace(/\s+/g, '_')}/${slug}`;
};

export const INITIAL_POSTS: EventPost[] = [
  {
    id: '1',
    title: 'Sinh hoạt định kỳ tháng 4',
    club: ClubType.DTC,
    description: 'Sự kiện do câu lạc bộ DTC tổ chức với nhiều hoạt động thú vị về AI và công nghệ mới.',
    content: 'Chi tiết về buổi sinh hoạt...',
    imageUrl: 'https://picsum.photos/id/1/800/600',
    date: '2025-04-02',
    time: '15:00',
    duration: '2 tiếng',
    location: 'Sân trường NL3',
    authorId: 'a1',
    likedBy: ['u2', 'u3', 'u4', 'u5'], // Mock likes
    sharedBy: ['u2'],
    comments: [],
    status: 'CLOSED',
    registrationDeadline: '2025-04-01',
    registeredUserIds: [],
    folderPath: getPath('CLB_DTC', '2025-04-02', 'Sinh hoạt định kỳ tháng 4')
  },
  {
    id: '2',
    title: 'EVENT: Ra mắt câu lạc bộ Tiếng Anh',
    club: ClubType.ENGLISH,
    description: 'Sự kiện do câu lạc bộ NEC với hàng loạt hoạt động thú vị được tổ chức...',
    content: 'Chi tiết ra mắt...',
    imageUrl: 'https://picsum.photos/id/20/800/600',
    date: '2023-03-02',
    time: '18:00',
    duration: '3 tiếng',
    location: 'Hội trường A',
    authorId: 'a1',
    likedBy: ['u1', 'u6', 'u7'],
    sharedBy: ['u1'],
    comments: [],
    status: 'ENDED',
    registrationDeadline: '2023-03-01',
    registeredUserIds: [],
    folderPath: getPath('CLB_Tieng_Anh', '2023-03-02', 'Ra mắt câu lạc bộ Tiếng Anh')
  },
  {
    id: '3',
    title: 'Học câu lạc bộ NEC',
    club: ClubType.ENGLISH,
    description: 'Buổi học kỹ năng giao tiếp và debate bằng tiếng Anh.',
    content: 'Nội dung buổi học...',
    imageUrl: 'https://picsum.photos/id/48/800/600',
    date: '2025-04-02',
    time: '14:00',
    duration: '4 tiếng',
    location: 'Văn phòng Đoàn',
    authorId: 'a1',
    likedBy: [],
    sharedBy: [],
    comments: [],
    status: 'OPEN',
    registrationDeadline: '2025-04-01',
    registeredUserIds: [],
    folderPath: getPath('CLB_Tieng_Anh', '2025-04-02', 'Học câu lạc bộ NEC')
  },
  {
    id: '4',
    title: 'Chuyên đề: Văn học hiện đại',
    club: ClubType.LITERATURE,
    description: 'Thảo luận về các tác phẩm văn học hiện đại Việt Nam.',
    content: 'Chi tiết...',
    imageUrl: 'https://picsum.photos/id/60/800/600',
    date: '2025-04-05',
    time: '08:00',
    duration: '3 tiếng',
    location: 'Thư viện',
    authorId: 'a1',
    likedBy: ['u10'],
    sharedBy: [],
    comments: [],
    status: 'OPEN',
    registrationDeadline: '2025-04-04',
    registeredUserIds: [],
    folderPath: getPath('CLB_Van_Hoc', '2025-04-05', 'Chuyên đề Văn học hiện đại')
  }
];