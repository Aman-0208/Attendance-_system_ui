export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'student' | 'teacher';
  name: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}