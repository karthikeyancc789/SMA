import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import qrService from '../services/qrService';
import attendanceService from '../services/attendanceService';
import { getCurrentLocation } from '../utils/geoLocation';
import toast, { Toaster } from 'react-hot-toast';

const ScanQR = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScan = async (sessionToken) => {
    setScanning(false);
    setValidating(true);

    try {
      // Validate QR code
      const _qrValidation = await qrService.validateQR(sessionToken);

      // Get current location
      const location = await getCurrentLocation();

      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        ipAddress: 'client-side' // Would be set by backend
      };

      // Mark attendance
      const _result = await attendanceService.markAttendance(
        sessionToken,
        location,
        deviceInfo
      );

      setSuccess(true);
      toast.success('Attendance marked successfully!');

      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(errorMsg);
      setScanning(true);
    } finally {
      setValidating(false);
    }
  };

  const handleError = (error) => {
    toast.error(error);
  };

  return (
    <div style={styles.pageContainer}>
      <Toaster position="top-right" />

      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>Scan QR Code</h1>
          <p style={styles.subtitle}>
            Scan the QR code displayed by your instructor
          </p>

          {validating && (
            <div style={styles.stateContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.stateText}>
                Validating and marking attendance...
              </p>
            </div>
          )}

          {success && (
            <div style={styles.stateContainer}>
              <div style={styles.successIcon}>✅</div>
              <h2 style={styles.successTitle}>Success!</h2>
              <p style={styles.stateText}>
                Your attendance has been marked
              </p>
            </div>
          )}

          {scanning && !validating && !success && (
            <>
              <div style={styles.scannerWrapper}>
                <QRScanner onScan={handleScan} onError={handleError} />
              </div>

              <div style={styles.alertBox}>
                <strong style={styles.alertTitle}>📱 Instructions:</strong>
                <ul style={styles.alertList}>
                  <li>Allow camera access when prompted</li>
                  <li>Point your camera at the QR code</li>
                  <li>Keep steady until it's scanned</li>
                  <li>Make sure you're within the allowed location</li>
                </ul>
              </div>
            </>
          )}

          <div style={styles.buttonContainer}>
            <button
              style={styles.outlineButton}
              onClick={() => navigate('/student/dashboard')}
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
  stateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  stateText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '16px',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  scannerWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    marginBottom: '24px',
  },
  alertBox: {
    background: '#eff6ff',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '24px',
    border: '1px solid #bfdbfe',
  },
  alertTitle: {
    color: '#1e40af',
    fontSize: '16px',
    display: 'block',
    marginBottom: '12px',
  },
  alertList: {
    margin: 0,
    paddingLeft: '24px',
    color: '#1e3a8a',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: '32px',
  },
  outlineButton: {
    background: 'white',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default ScanQR;