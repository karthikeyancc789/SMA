import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, classesData] = await Promise.all([
        attendanceService.getAttendanceStats(),
        classService.getStudentClasses()
      ]);
      setStats(statsData);
      setClasses(classesData.classes);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    }finally {
      setLoading(false);
    }
  };

  const pieData = stats ? [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Toaster position="top-right" />
      
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Student Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user.name}!</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/student/scan')}
        >
          📱 Scan QR Code
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-icon primary">📚</div>
          <div className="stat-content">
            <h3>Total Classes</h3>
            <p>{stats?.totalClasses || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">✓</div>
          <div className="stat-content">
            <h3>Present</h3>
            <p>{stats?.present || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">✗</div>
          <div className="stat-content">
            <h3>Absent</h3>
            <p>{stats?.absent || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">📊</div>
          <div className="stat-content">
            <h3>Attendance</h3>
            <p>{stats?.percentage || 0}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        {/* Attendance Chart */}
        <div className="card">
          <h2 className="card-title mb-3">Attendance Overview</h2>
          {stats && stats.totalClasses > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center" style={{ padding: '40px' }}>
              <p style={{ color: '#6b7280' }}>No attendance data yet</p>
            </div>
          )}
        </div>

        {/* Today's Classes */}
        <div className="card">
          <h2 className="card-title mb-3">Today's Activity</h2>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {stats?.todayClasses || 0}
            </div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Classes Attended Today
            </p>
          </div>
        </div>
      </div>

      {/* Enrolled Classes */}
      <div className="card">
        <div className="card-header flex-between">
          <h2 className="card-title">Enrolled Classes</h2>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/student/attendance')}
          >
            View All Attendance
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <p style={{ color: '#6b7280' }}>
              You are not enrolled in any classes yet
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {classes.map((cls) => (
              <div key={cls._id} className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {cls.className}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                  {cls.subject}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <span>📚 {cls.department}</span>
                  <span>👨‍🏫 {cls.faculty?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-3 mt-4">
        <div 
          className="card" 
          style={{ cursor: 'pointer', textAlign: 'center' }}
          onClick={() => navigate('/student/scan')}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Scan QR Code
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Mark your attendance
          </p>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', textAlign: 'center' }}
          onClick={() => navigate('/student/attendance')}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            My Attendance
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            View attendance history
          </p>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Profile
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            View your profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;