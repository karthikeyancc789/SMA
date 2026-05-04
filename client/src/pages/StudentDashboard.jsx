import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

const StudentDashboard = () => {
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
        classService.getStudentClasses()
      ]);
      setStats(statsData);
      setClasses(classesData.classes);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const pieData = stats ? [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' }
  ] : [];

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
          <h1 style={styles.mainTitle}>Student Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user.name}! 👋</p>
        </div>
        <button
          style={styles.scanButton}
          onClick={() => navigate('/student/scan')}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span style={styles.scanIcon}>📱</span>
          Scan QR Code
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardPrimary }}>
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

        <div style={{ ...styles.statCard, ...styles.statCardSuccess }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#f0fdf4' }}>
              <span style={{ fontSize: '28px' }}>✓</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Present</p>
            <h3 style={styles.statValue}>{stats?.present || 0}</h3>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardDanger }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#fef2f2' }}>
              <span style={{ fontSize: '28px' }}>✗</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Absent</p>
            <h3 style={styles.statValue}>{stats?.absent || 0}</h3>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardWarning }}>
          <div style={styles.statIconWrapper}>
            <div style={{ ...styles.statIcon, background: '#fffbeb' }}>
              <span style={{ fontSize: '28px' }}>📊</span>
            </div>
          </div>
          <div>
            <p style={styles.statLabel}>Attendance Rate</p>
            <h3 style={styles.statValue}>{stats?.percentage || 0}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        {/* Attendance Overview */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Attendance Overview</h2>
          {stats && stats.totalClasses > 0 ? (
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
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
              <div style={styles.legendContainer}>
                {pieData.map((entry, index) => (
                  <div key={index} style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: entry.color }}></div>
                    <span style={styles.legendText}>{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📊</span>
              <p style={styles.emptyText}>No attendance data yet</p>
              <p style={styles.emptySubtext}>Start marking attendance to see your statistics</p>
            </div>
          )}
        </div>

        {/* Today's Activity */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Today's Activity</h2>
          <div style={styles.todayActivityContainer}>
            <div style={styles.activityCircle}>
              <div style={styles.activityNumber}>{stats?.todayClasses || 0}</div>
            </div>
            <p style={styles.activityLabel}>Classes Attended Today</p>
            <button
              style={styles.viewDetailsButton}
              onClick={() => navigate('/student/attendance')}
            >
              View Full History →
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Classes */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Enrolled Classes</h2>
          <button
            style={styles.outlineButton}
            onClick={() => navigate('/student/attendance')}
          >
            View All Attendance
          </button>
        </div>

        {classes.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📚</span>
            <p style={styles.emptyText}>No enrolled classes</p>
            <p style={styles.emptySubtext}>Contact your administrator to enroll in classes</p>
          </div>
        ) : (
          <div style={styles.classesGrid}>
            {classes.map((cls) => (
              <div key={cls._id} style={styles.classCard}>
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
                    <span style={styles.metaText}>{cls.department}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaIcon}>👨‍🏫</span>
                    <span style={styles.metaText}>{cls.faculty?.name || 'TBA'}</span>
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
          onClick={() => navigate('/student/scan')}
        >
          <div style={styles.actionIcon}>📱</div>
          <h3 style={styles.actionTitle}>Scan QR Code</h3>
          <p style={styles.actionDescription}>Mark your attendance quickly</p>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/student/attendance')}
        >
          <div style={styles.actionIcon}>📊</div>
          <h3 style={styles.actionTitle}>My Attendance</h3>
          <p style={styles.actionDescription}>View your attendance history</p>
        </div>

        <div
          style={styles.actionCard}
        >
          <div style={styles.actionIcon}>👤</div>
          <h3 style={styles.actionTitle}>Profile</h3>
          <p style={styles.actionDescription}>Manage your account settings</p>
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
    minHeight: '100vh',
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
  scanButton: {
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
  scanIcon: {
    fontSize: '20px',
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  chartContainer: {
    textAlign: 'center',
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  legendText: {
    fontSize: '14px',
    color: '#6b7280',
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
  todayActivityContainer: {
    textAlign: 'center',
    padding: '20px',
  },
  activityCircle: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
  },
  activityNumber: {
    fontSize: '56px',
    fontWeight: '700',
    color: 'white',
  },
  activityLabel: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '16px',
  },
  viewDetailsButton: {
    background: 'transparent',
    color: '#4f46e5',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
    marginTop: '30px',
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

// Add hover effects with inline event handlers
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

export default StudentDashboard;