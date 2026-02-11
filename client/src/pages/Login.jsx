import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
          if (result.data.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 1000);
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (err) {
      // Use the 'err' variable to satisfy ESLint and help with debugging
      console.error('Login submission error:', err); 
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Smart Attendance</h1>
          <p style={styles.subtitle}>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              style={styles.input}
              placeholder="student@example.com"
              value={formData.email}
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              ...styles.button, 
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Register here
            </Link>
          </p>
        </div>

        <div style={styles.demoCredentials}>
          <p style={styles.demoTitle}>Demo Credentials:</p>
          <div style={styles.demoBox}>
            <strong>Admin:</strong> admin@test.com / password123
          </div>
          <div style={styles.demoBox}>
            <strong>Student:</strong> student@test.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw', // Force full width to prevent the "left-side squash"
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'fixed', // Ensures it covers any background void
    top: 0,
    left: 0,
    overflowY: 'auto',
    padding: '20px'
  },
  formCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    margin: 'auto' // Secondary centering
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    boxSizing: 'border-box' // Essential to keep padding inside the width
  },
  button: {
    width: '100%',
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600'
  },
  demoCredentials: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  demoTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px'
  },
  demoBox: {
    fontSize: '12px',
    color: '#374151',
    padding: '4px 0'
  }
};

export default Login;