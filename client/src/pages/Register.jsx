import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    rollNumber: '',
    department: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword: _confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      toast.success('Registration successful!');
      setTimeout(() => {
        if (result.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1000);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Create Account</h1>
          <p style={styles.subtitle}>Register for Smart Attendance</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin/Faculty</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                className="form-control"
                placeholder="CS2021001"
                value={formData.rollNumber}
                onChange={handleChange}
                required={formData.role === 'student'}
              />
            </div>
          )}

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-control"
                placeholder="Computer Science"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                name="year"
                className="form-control"
                placeholder="2"
                min="1"
                max="5"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  formCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280'
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
  }
};

export default Register;