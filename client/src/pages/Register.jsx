import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);  // ← Using useContext
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
    role: 'student',
    rollNumber: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Optional: Scroll to top on mount just like Login
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <div style={styles.topBar}>
        <div style={styles.logoGroup}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>Smart Attendance</span>
        </div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.inactiveLink}>Login</Link>
          <Link to="/register" style={styles.activeLink}>Register</Link>
        </div>
      </div>

      {/* Main Content & Form */}
      <div style={styles.content}>
        <div style={styles.formCard}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create an Account</h1>
            <p style={styles.subtitle}>Sign up to get started</p>
          </div>

          {/* Styled Error Message */}
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                style={styles.input}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                {formData.role === 'admin' ? 'Teacher No' : 'Register No'}
              </label>
              <input
                type="text"
                name="rollNumber"
                style={styles.input}
                placeholder={formData.role === 'admin' ? 'Enter teacher number' : 'Enter register number'}
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Department</label>
              <select
                name="department"
                style={styles.input}
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Humanities">Humanities</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {formData.role === 'admin' ? 'Teaching Experience (in yrs)' : 'Year (1-4)'}
              </label>
              <input
                type="number"
                name="year"
                style={styles.input}
                placeholder={formData.role === 'admin' ? 'Enter teaching experience' : 'Enter year (1-4)'}
                min="1"
                max={formData.role === 'admin' ? '50' : '4'}
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                style={styles.input}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reused styles from Login.jsx with a new `errorMessage` style
const styles = {
  container: { minHeight: '100vh', width: '100%', backgroundColor: '#f5f7fa', display: 'flex', flexDirection: 'column' },
  topBar: { backgroundColor: 'white', padding: '16px 40px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', position: 'relative' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'auto' },
  logoIcon: { fontSize: '24px' },
  logoText: { fontSize: '22px', fontWeight: 'bold', color: '#4f46e5', whiteSpace: 'nowrap' },
  navLinks: { display: 'flex', gap: '40px', position: 'absolute', left: '75%', transform: 'translateX(-50%)' },
  activeLink: { color: '#4f46e5', textDecoration: 'none', fontSize: '15px', fontWeight: '700', borderBottom: '2px solid #4f46e5', paddingBottom: '4px' },
  inactiveLink: { color: '#6b7280', textDecoration: 'none', fontSize: '15px', fontWeight: '600' },
  content: { flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' },
  formCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '48px 40px', 
    width: '100%', 
    maxWidth: '650px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
    margin: 'auto' 
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: '15px', color: '#6b7280' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500', border: '1px solid #f87171' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '2px solid #e5e7eb', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', color: '#1f2937', fontSize: '15px' },
  button: { width: '100%', backgroundColor: '#4f46e5', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '16px' },
  footer: { textAlign: 'center', marginTop: '24px' },
  footerText: { fontSize: '14px', color: '#6b7280' },
  link: { color: '#4f46e5', textDecoration: 'none', fontWeight: '700' }
};

export default Register;