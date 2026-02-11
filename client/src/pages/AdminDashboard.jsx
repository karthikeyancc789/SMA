import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
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
        classService.getFacultyClasses()
      ]);
      setStats(statsData);
      setClasses(classesData.classes);
    }catch (error) {
        console.error(error);
        toast.error('Failed to load Dashboard data');
    
    } finally {
      setLoading(false);
    }
  };

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
            Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user.name}!</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/generate-qr')}
        >
          + Generate QR Code
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
          <div className="stat-icon success">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p>{stats?.totalStudents || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">📊</div>
          <div className="stat-content">
            <h3>Total Sessions</h3>
            <p>{stats?.totalSessions || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">✓</div>
          <div className="stat-content">
            <h3>Today Sessions</h3>
            <p>{stats?.todaySessions || 0}</p>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="card">
        <div className="card-header flex-between">
          <h2 className="card-title">Your Classes</h2>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/admin/classes')}
          >
            View All
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              No classes created yet
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/admin/classes')}
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-2">
            {classes.slice(0, 4).map((cls) => (
              <div 
                key={cls._id} 
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/admin/classes/${cls._id}`)}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {cls.className}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                  {cls.subject}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <span>
                    📚 {cls.department} - Year {cls.year}
                  </span>
                  <span>
                    👥 {cls.students?.length || 0} students
                  </span>
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
          onClick={() => navigate('/admin/classes')}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Manage Classes
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Create and manage your classes
          </p>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', textAlign: 'center' }}
          onClick={() => navigate('/admin/generate-qr')}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Generate QR
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Create QR codes for attendance
          </p>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', textAlign: 'center' }}
          onClick={() => navigate('/admin/reports')}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            View Reports
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Check attendance statistics
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;