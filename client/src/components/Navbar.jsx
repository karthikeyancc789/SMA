import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useContext(AuthContext);  // ✅ Fixed
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div className="container" style={styles.navContainer}>
        <Link to="/" style={styles.brand}>
          📚 Smart Attendance
        </Link>

        {user && (
          <div style={styles.navLinks}>
            <Link
              to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
              style={styles.navLink}
            >
              Dashboard
            </Link>

            {isAdmin && (
              <>
                <Link to="/admin/classes" style={styles.navLink}>
                  Classes
                </Link>
                <Link to="/admin/generate-qr" style={styles.navLink}>
                  Generate QR
                </Link>
                <Link to="/admin/reports" style={styles.navLink}>
                  Reports
                </Link>
              </>
            )}

            {isStudent && (
              <>
                <Link to="/student/scan" style={styles.navLink}>
                  Scan QR
                </Link>
                <Link to="/student/attendance" style={styles.navLink}>
                  My Attendance
                </Link>
              </>
            )}

            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>{user.role}</span>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn}
              onMouseEnter={(e) => {
                e.target.style.background = '#aabfc5ff';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#aabfc5ff';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4f46e5',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  navLink: {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.3s'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: '16px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  userRole: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'capitalize'
  },
  logoutBtn: {
    background: 'white',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginLeft: '16px'
  }
};

export default Navbar;