import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', rollNumber: '', department: '', year: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Reset scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      if (result.success) {
        toast.success('Registration successful!');
        setTimeout(() => {
          navigate(result.data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }, 1000);
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      {/* Top Navigation Bar */}
      <div style={styles.topBar}>
        <div style={styles.logoGroup}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>Smart Attendance</span>
        </div>
        
        {/* Navigation links positioned between top-middle and top-right */}
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.inactiveLink}>Login</Link>
          <Link to="/register" style={styles.activeLink}>Register</Link>
        </div>
      </div>

      <div style={styles.content}>
        {/* Wider form card with removed interior logo branding */}
        <div style={styles.formCard}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Join the Smart Attendance system today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                type="text" name="name" style={styles.input} 
                placeholder="John Doe" value={formData.name} 
                onChange={handleChange} required 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" name="email" style={styles.input} 
                placeholder="john@example.com" value={formData.email} 
                onChange={handleChange} required 
              />
            </div>

            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select name="role" style={styles.input} value={formData.role} onChange={handleChange} required>
                  <option value="student">Student</option>
                  <option value="admin">Admin/Faculty</option>
                </select>
              </div>

              {/* Dynamic ID field: Role changes the Label and Placeholder */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {formData.role === 'student' ? 'Roll Number' : 'Admin/Faculty Number'}
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  style={styles.input}
                  placeholder={formData.role === 'student' ? 'CS2021001' : 'EMP1001'}
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input type="text" name="department" style={styles.input} placeholder="CS" value={formData.department} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Year</label>
                <input type="number" name="year" style={styles.input} min="1" max="5" value={formData.year} onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" name="password" style={styles.input} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input type="password" name="confirmPassword" style={styles.input} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', width: '100%', backgroundColor: '#f5f7fa', display: 'flex', flexDirection: 'column' },
  topBar: { 
    backgroundColor: 'white', 
    padding: '16px 40px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
    display: 'flex', 
    alignItems: 'center',
    position: 'relative',
    zIndex: 100
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'auto' },
  logoIcon: { fontSize: '24px' },
  logoText: { fontSize: '22px', fontWeight: 'bold', color: '#4f46e5', whiteSpace: 'nowrap' },
  
  // Positioned navigation
  navLinks: { 
    display: 'flex', 
    gap: '40px', 
    position: 'absolute', 
    left: '75%', 
    transform: 'translateX(-50%)' 
  },
  
  // Clean link styles without rectangular boxes
  activeLink: { 
    color: '#4f46e5', 
    textDecoration: 'none', 
    fontSize: '15px', 
    fontWeight: '700',
    borderBottom: '2px solid #4f46e5',
    paddingBottom: '4px'
  },
  inactiveLink: { 
    color: '#6b7280', 
    textDecoration: 'none', 
    fontSize: '15px', 
    fontWeight: '600'
  },
  
  content: { flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' },
  formCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '48px 40px', 
    width: '100%', 
    maxWidth: '550px', // Increased width
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
    margin: 'auto' 
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: '15px', color: '#6b7280' },
  formGroup: { marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '2px solid #e5e7eb', boxSizing: 'border-box', outline: 'none' },
  button: { width: '100%', backgroundColor: '#4f46e5', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  footer: { textAlign: 'center', marginTop: '20px' },
  footerText: { fontSize: '14px', color: '#6b7280' },
  link: { color: '#4f46e5', textDecoration: 'none', fontWeight: '700' }
};

export default Register;