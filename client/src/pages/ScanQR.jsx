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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Toaster position="top-right" />
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
            Scan QR Code
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px', textAlign: 'center' }}>
            Scan the QR code displayed by your instructor
          </p>

          {validating && (
            <div className="text-center" style={{ padding: '40px' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>
                Validating and marking attendance...
              </p>
            </div>
          )}

          {success && (
            <div className="text-center" style={{ padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Success!
              </h2>
              <p style={{ color: '#6b7280' }}>
                Your attendance has been marked
              </p>
            </div>
          )}

          {scanning && !validating && !success && (
            <>
              <QRScanner onScan={handleScan} onError={handleError} />
              
              <div className="alert alert-info mt-3">
                <strong>📱 Instructions:</strong>
                <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
                  <li>Allow camera access when prompted</li>
                  <li>Point your camera at the QR code</li>
                  <li>Keep steady until it's scanned</li>
                  <li>Make sure you're within the allowed location</li>
                </ul>
              </div>
            </>
          )}

          <div className="text-center mt-3">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;