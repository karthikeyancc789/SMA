import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        setTimeout(() => {
          navigate(result.data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }, 1000);
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <div style={styles.topBar}>
        <div style={styles.logoGroup}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>Smart Attendance</span>
        </div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.activeLink}>Login</Link>
          <Link to="/register" style={styles.inactiveLink}>Register</Link>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.formCard}>
          {/* ✅ Yellow highlighted logo removed to avoid overlapping */}
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email" name="email" style={styles.input}
                placeholder="Enter your email" value={formData.email}
                onChange={handleChange} required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password" name="password" style={styles.input}
                placeholder="Enter your password" value={formData.password}
                onChange={handleChange} required
              />
            </div>
            <button 
              type="submit" disabled={loading}
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={styles.footer}>
            <p style={styles.footerText}>Don't have an account? <Link to="/register" style={styles.link}>Create one now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    maxWidth: '650px', // ✅ Width increased for Login page
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
    margin: 'auto' 
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: '15px', color: '#6b7280' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '2px solid #e5e7eb', boxSizing: 'border-box', outline: 'none' },
  button: { width: '100%', backgroundColor: '#4f46e5', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' },
  divider: { textAlign: 'center', margin: '32px 0', borderBottom: '1px solid #f3f4f6', lineHeight: '0.1em' },
  dividerText: { backgroundColor: 'white', padding: '0 16px', color: '#9ca3af', fontSize: '13px' },
  demoCredentials: { padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' },
  demoTitle: { fontSize: '14px', fontWeight: '700', color: '#4f46e5', marginBottom: '12px', textAlign: 'center' },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  demoBox: { textAlign: 'center' },
  demoRole: { fontSize: '11px', fontWeight: '700', color: '#4f46e5' },
  demoEmail: { fontSize: '11px', color: '#374151' },
  footer: { textAlign: 'center', marginTop: '24px' },
  footerText: { fontSize: '14px', color: '#6b7280' },
  link: { color: '#4f46e5', textDecoration: 'none', fontWeight: '700' }
};

export default Login;