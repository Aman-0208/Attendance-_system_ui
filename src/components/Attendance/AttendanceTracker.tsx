import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Camera } from 'lucide-react';
import { mockUsers, mockAttendance } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord } from '../../types';
import CameraAttendance from './CameraAttendance';

const AttendanceTracker: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [showCamera, setShowCamera] = useState(false);

  const students = mockUsers.filter(u => u.role === 'student');
  const todayAttendance = attendance.filter(a => a.date === selectedDate);

  const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const existingRecord = todayAttendance.find(a => a.userId === studentId);
    
    if (existingRecord) {
      // Update existing record
      setAttendance(prev => prev.map(record => 
        record.id === existingRecord.id 
          ? { ...record, status, timestamp: new Date().toISOString() }
          : record
      ));
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: studentId,
        date: selectedDate,
        status,
        markedBy: user?.id || '1',
        timestamp: new Date().toISOString()
      };
      setAttendance(prev => [...prev, newRecord]);
    }
  };

  const handleCameraAttendance = (detectedStudents: string[]) => {
    detectedStudents.forEach(studentId => {
      markAttendance(studentId, 'present');
    });
    setShowCamera(false);
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = todayAttendance.find(a => a.userId === studentId);
    return record?.status;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: string) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'present':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'absent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'late':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Tracker</h1>
            <p className="text-gray-600">
              {isStudent ? 'View your attendance status' : 'Mark and manage student attendance'}
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowCamera(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Camera Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Selection and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Select Date</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{presentCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{absentCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Late</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {isStudent ? 'Your Attendance Status' : 'Student Attendance'} - {new Date(selectedDate).toLocaleDateString()}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Marked
                </th>
                {!isStudent && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isStudent ? students.filter(s => s.id === user?.id) : students).map((student) => {
                const status = getAttendanceStatus(student.id);
                const record = todayAttendance.find(a => a.userId === student.id);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className={getStatusBadge(status)}>
                          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not Marked'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    {!isStudent && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => markAttendance(student.id, 'present')}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              status === 'present' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'late')}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              status === 'late' 
                                ? 'bg-yellow-600 text-white' 
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'absent')}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              status === 'absent' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(isStudent ? students.filter(s => s.id === user?.id) : students).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {isStudent ? 'No attendance records found.' : 'No students found in the system.'}
            </p>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraAttendance
          onClose={() => setShowCamera(false)}
          onAttendanceMarked={handleCameraAttendance}
          students={students}
        />
      )}
    </div>
  );
};

export default AttendanceTracker;