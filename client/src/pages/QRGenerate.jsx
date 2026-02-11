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
    }catch (error) {
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

      const data = await qrService.QRGenerate(
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
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <Toaster position="top-right" />
        
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card text-center">
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              QR Code Generated
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {qrData.classInfo.className} - {qrData.classInfo.subject}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <img 
                src={qrData.qrSession.qrCodeImage} 
                alt="QR Code" 
                style={{ maxWidth: '300px', width: '100%' }}
              />
            </div>

            <div className="alert alert-warning mb-3">
              <strong>⏱️ Expires in: {timeRemaining}</strong>
            </div>

            <div style={{ 
              textAlign: 'left', 
              padding: '16px', 
              background: '#f9fafb', 
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Session ID:</strong> {qrData.qrSession._id}
              </p>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Expires At:</strong> {new Date(qrData.qrSession.expiresAt).toLocaleString()}
              </p>
              <p style={{ fontSize: '14px' }}>
                <strong>Status:</strong> <span className="badge badge-success">Active</span>
              </p>
            </div>

            <div className="flex gap-2" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={handleNewQR}
              >
                Generate New QR
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/admin/dashboard')}
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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Toaster position="top-right" />
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Generate QR Code for Attendance
          </h1>

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Select Class</label>
              <select
                name="classId"
                className="form-control"
                value={formData.classId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} - {cls.subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">QR Code Expiry (minutes)</label>
              <input
                type="number"
                name="expiryMinutes"
                className="form-control"
                value={formData.expiryMinutes}
                onChange={handleChange}
                min="1"
                max="60"
                required
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                How long should the QR code remain valid?
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Location Settings</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  name="useCurrentLocation"
                  checked={formData.useCurrentLocation}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                <span>Use my current location</span>
              </div>

              {!formData.useCurrentLocation && (
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      className="form-control"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="any"
                      required={!formData.useCurrentLocation}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      className="form-control"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="any"
                      required={!formData.useCurrentLocation}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Allowed Radius (meters)</label>
                <input
                  type="number"
                  name="radius"
                  className="form-control"
                  value={formData.radius}
                  onChange={handleChange}
                  min="10"
                  max="1000"
                  required
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Students must be within this distance to mark attendance
                </small>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Generating...' : '📱 Generate QR Code'}
              </button>
              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/admin/dashboard')}
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

export default QRGenerate;