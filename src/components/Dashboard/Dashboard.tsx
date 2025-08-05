import React from 'react';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers, mockAttendance } from '../../data/mockData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const totalStudents = mockUsers.filter(u => u.role === 'student').length;
  const totalTeachers = mockUsers.filter(u => u.role === 'teacher').length;
  const todayAttendance = mockAttendance.filter(a => a.date === '2025-01-15').length;
  const presentToday = mockAttendance.filter(a => a.date === '2025-01-15' && a.status === 'present').length;

  const stats = [
    {
      name: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    {
      name: 'Total Teachers',
      value: totalTeachers,
      icon: Users,
      color: 'bg-green-500',
      change: 'No change'
    },
    {
      name: 'Today\'s Attendance',
      value: `${presentToday}/${todayAttendance}`,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '75% present'
    },
    {
      name: 'On Time',
      value: presentToday,
      icon: Clock,
      color: 'bg-purple-500',
      change: 'Good performance'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Alice Johnson marked present', time: '9:00 AM', type: 'attendance' },
    { id: 2, action: 'Bob Wilson marked late', time: '9:15 AM', type: 'attendance' },
    { id: 3, action: 'New student account created', time: '8:30 AM', type: 'user' },
    { id: 4, action: 'Teacher John Smith logged in', time: '8:00 AM', type: 'login' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'attendance' ? 'bg-green-500' :
                    activity.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {user?.role === 'admin' && (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">Create New User</div>
                    <div className="text-sm text-gray-500">Add student or teacher account</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">Generate Report</div>
                    <div className="text-sm text-gray-500">Create attendance summary</div>
                  </button>
                </>
              )}
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Mark Attendance</div>
                <div className="text-sm text-gray-500">Record student attendance</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">View Reports</div>
                <div className="text-sm text-gray-500">Check attendance history</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;