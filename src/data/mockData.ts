import { User, AttendanceRecord } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    name: 'John Smith',
    createdAt: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    username: 'student1',
    password: 'student123',
    role: 'student',
    name: 'Alice Johnson',
    createdAt: '2025-01-03T00:00:00Z'
  },
  {
    id: '4',
    username: 'student2',
    password: 'student123',
    role: 'student',
    name: 'Bob Wilson',
    createdAt: '2025-01-03T00:00:00Z'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    userId: '3',
    date: '2025-01-15',
    status: 'present',
    markedBy: '2',
    timestamp: '2025-01-15T09:00:00Z'
  },
  {
    id: '2',
    userId: '4',
    date: '2025-01-15',
    status: 'late',
    markedBy: '2',
    timestamp: '2025-01-15T09:15:00Z'
  }
];