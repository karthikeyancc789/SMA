import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classService from '../services/classService';
import qrService from '../services/qrService';
import { getCurrentLocation } from '../utils/geoLocation';
import { getTimeRemaining } from '../utils/formatDate';
import toast, { Toaster } from 'react-hot-toast';

const QRGenerate = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    expiryMinutes: 5,
    useCurrentLocation: true,
    latitude: '',
    longitude: '',
    radius: 100
  });
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (qrData) {
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(qrData.qrSession.expiresAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [qrData]);

  const fetchClasses = async () => {
    try {
      const { classes } = await classService.getFacultyClasses();
      setClasses(classes);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load classes');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let location = {};

      if (formData.useCurrentLocation) {
        const currentLoc = await getCurrentLocation();
        location = {
          latitude: currentLoc.latitude,
          longitude: currentLoc.longitude,
          radius: Number(formData.radius)
        };
      } else {
        location = {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          radius: Number(formData.radius)
        };
      }

      const data = await qrService.generateQR(
        formData.classId,
        Number(formData.expiryMinutes),
        location
      );

      setQrData(data);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQR = () => {
    setQrData(null);
    setFormData(prev => ({ ...prev, classId: '' }));
  };

  if (qrData) {
    return (
      <div style={styles.pageContainer}>
        <Toaster position="top-right" />

        <div style={styles.contentWrapper}>
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <h1 style={styles.title}>QR Code Generated</h1>
            <p style={styles.subtitle}>
              {qrData.classInfo.className} - {qrData.classInfo.subject}
            </p>

            <div style={styles.qrImageContainer}>
              <img
                src={qrData.qrSession.qrCodeImage}
                alt="QR Code"
                style={styles.qrImage}
              />
            </div>

            <div style={styles.alertWarning}>
              <strong>⏱️ Expires in: {timeRemaining}</strong>
            </div>

            <div style={styles.sessionInfoBox}>
              <p style={styles.infoText}>
                <strong>Session ID:</strong> {qrData.qrSession._id}
              </p>
              <p style={styles.infoText}>
                <strong>Expires At:</strong> {new Date(qrData.qrSession.expiresAt).toLocaleString()}
              </p>
              <p style={{ ...styles.infoText, marginBottom: 0 }}>
                <strong>Status:</strong> <span style={styles.badgeSuccess}>Active</span>
              </p>
            </div>

            <div style={styles.buttonGroup}>
              <button
                style={styles.primaryButton}
                onClick={handleNewQR}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Generate New QR
              </button>
              <button
                style={styles.outlineButton}
                onClick={() => navigate('/admin/dashboard')}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4f46e5';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#4f46e5';
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Toaster position="top-right" />

      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>Generate QR Code</h1>
          <p style={styles.subtitle}>Create a new attendance session</p>

          <form onSubmit={handleGenerate}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Class</label>
              <select
                name="classId"
                style={styles.formControl}
                value={formData.classId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a class...</option>

                {/* Dynamic mapped options from the database */}
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} - {cls.subject}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>QR Code Expiry (minutes)</label>
              <input
                type="number"
                name="expiryMinutes"
                style={styles.formControl}
                value={formData.expiryMinutes}
                onChange={handleChange}
                min="1"
                max="60"
                required
              />
              <small style={styles.helperText}>
                How long should the QR code remain valid?
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Location Settings</label>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  name="useCurrentLocation"
                  checked={formData.useCurrentLocation}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxLabel}>Use my current location</span>
              </div>

              {!formData.useCurrentLocation && (
                <div style={styles.grid2}>
                  <div style={styles.subFormGroup}>
                    <label style={styles.formLabel}>Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      style={styles.formControl}
                      value={formData.latitude}
                      onChange={handleChange}
                      step="any"
                      required={!formData.useCurrentLocation}
                    />
                  </div>
                  <div style={styles.subFormGroup}>
                    <label style={styles.formLabel}>Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      style={styles.formControl}
                      value={formData.longitude}
                      onChange={handleChange}
                      step="any"
                      required={!formData.useCurrentLocation}
                    />
                  </div>
                </div>
              )}

              <div style={{ ...styles.formGroup, marginTop: '16px' }}>
                <label style={styles.formLabel}>Allowed Radius (meters)</label>
                <input
                  type="number"
                  name="radius"
                  style={styles.formControl}
                  value={formData.radius}
                  onChange={handleChange}
                  min="10"
                  max="1000"
                  required
                />
                <small style={styles.helperText}>
                  Students must be within this distance to mark attendance
                </small>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={{ ...styles.primaryButton, flex: 1 }}
                disabled={loading}
                onMouseEnter={(e) => { if (!loading) e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { if (!loading) e.target.style.transform = 'translateY(0)'; }}
              >
                {loading ? 'Generating...' : '📱 Generate QR Code'}
              </button>
              <button
                type="button"
                style={styles.outlineButton}
                onClick={() => navigate('/admin/dashboard')}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4f46e5';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#4f46e5';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '600px',
    marginTop: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '24px',
  },
  subFormGroup: {
    marginBottom: '0',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  formControl: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    color: '#111827',
    background: '#fff',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  helperText: {
    display: 'block',
    color: '#6b7280',
    fontSize: '13px',
    marginTop: '6px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#4f46e5',
  },
  checkboxLabel: {
    fontSize: '15px',
    color: '#374151',
    cursor: 'pointer',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '32px',
  },
  primaryButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
  outlineButton: {
    background: 'white',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  qrImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
    padding: '24px',
    background: '#f9fafb',
    borderRadius: '16px',
    border: '2px dashed #e5e7eb',
  },
  qrImage: {
    maxWidth: '250px',
    width: '100%',
    height: 'auto',
  },
  alertWarning: {
    background: '#fffbeb',
    color: '#b45309',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid #fde68a',
    marginBottom: '24px',
    fontSize: '15px',
  },
  sessionInfoBox: {
    textAlign: 'left',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '32px',
  },
  infoText: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '12px',
  },
  badgeSuccess: {
    background: '#dcfce7',
    color: '#166534',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
};

export default QRGenerate;