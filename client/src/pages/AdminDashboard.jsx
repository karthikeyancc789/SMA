import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
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
    } catch (error) {
      console.error(error);
      toast.error('Failed to load Dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user.name}! 👋</p>
        </div>
        <button
          style={styles.primaryButton}
          onClick={() => navigate('/admin/generate-qr')}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span style={styles.btnIcon}>➕</span>
          Generate QR Code
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#eff6ff' }}>
              <span style={{ fontSize: '28px' }}>📚</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Total Classes</p>
            <h3 style={styles.statValue}>{stats?.totalClasses || 0}</h3>
          </div>
        </div>

        <div style={{ ...styles.statCard }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#f0fdf4' }}>
              <span style={{ fontSize: '28px' }}>👥</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Total Students</p>
            <h3 style={styles.statValue}>{stats?.totalStudents || 0}</h3>
          </div>
        </div>

        <div style={{ ...styles.statCard }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#fffbeb' }}>
              <span style={{ fontSize: '28px' }}>📊</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Total Sessions</p>
            <h3 style={styles.statValue}>{stats?.totalSessions || 0}</h3>
          </div>
        </div>

        <div style={{ ...styles.statCard }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#fef2f2' }}>
              <span style={{ fontSize: '28px' }}>✓</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Today Sessions</p>
            <h3 style={styles.statValue}>{stats?.todaySessions || 0}</h3>
          </div>
        </div>
      </div>

      {/* Classes List Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Your Classes</h2>
          <button
            style={styles.outlineButton}
            onClick={() => navigate('/admin/classes')}
            onMouseEnter={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#4f46e5';
            }}
          >
            View All
          </button>
        </div>

        {classes.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📚</span>
            <p style={styles.emptyText}>No classes created yet</p>
            <p style={styles.emptySubtext}>Create a class to start tracking attendance</p>
            <button
              style={{ ...styles.primaryButton, marginTop: '20px', display: 'inline-flex' }}
              onClick={() => navigate('/admin/classes')}
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div style={styles.classesGrid}>
            {classes.slice(0, 4).map((cls) => (
              <div
                key={cls._id}
                style={styles.classCard}
                onClick={() => navigate(`/admin/classes/${cls._id}`)}
              >
                <div style={styles.classHeader}>
                  <div style={styles.classIconCircle}>📘</div>
                  <div style={styles.classInfo}>
                    <h3 style={styles.className}>{cls.className}</h3>
                    <p style={styles.classSubject}>{cls.subject}</p>
                  </div>
                </div>
                <div style={styles.classMeta}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaIcon}>🏛️</span>
                    <span style={styles.metaText}>{cls.department} - Year {cls.year}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaIcon}>👥</span>
                    <span style={styles.metaText}>{cls.students?.length || 0} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActionsGrid}>
        <div
          style={styles.actionCard}
          onClick={() => navigate('/admin/classes')}
        >
          <div style={styles.actionIcon}>📚</div>
          <h3 style={styles.actionTitle}>Manage Classes</h3>
          <p style={styles.actionDescription}>Create and manage your classes</p>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/admin/generate-qr')}
        >
          <div style={styles.actionIcon}>📱</div>
          <h3 style={styles.actionTitle}>Generate QR</h3>
          <p style={styles.actionDescription}>Create QR codes for attendance</p>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/admin/reports')}
        >
          <div style={styles.actionIcon}>📊</div>
          <h3 style={styles.actionTitle}>View Reports</h3>
          <p style={styles.actionDescription}>Check attendance statistics</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#f9fafb',
    padding: '40px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f9fafb',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    color: '#6b7280',
    fontSize: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
  },
  primaryButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
  btnIcon: {
    fontSize: '18px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  statIconWrapper: {
    flexShrink: 0,
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  outlineButton: {
    background: 'white',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  classCard: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  classHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  classIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  classSubject: {
    fontSize: '14px',
    color: '#6b7280',
  },
  classMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metaIcon: {
    fontSize: '16px',
  },
  metaText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '2px solid transparent',
  },
  actionIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  actionDescription: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

// Mirroring the hover tricks from the Student Dashboard snippet
styles.actionCard[':hover'] = {
  transform: 'translateY(-4px)',
  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  borderColor: '#4f46e5',
};

styles.classCard[':hover'] = {
  background: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

styles.statCard[':hover'] = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
};

export default AdminDashboard;