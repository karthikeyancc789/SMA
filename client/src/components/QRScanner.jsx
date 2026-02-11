import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setIsScanning(false);       // ✅ external event → OK
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        if (!error.includes('NotFoundException')) {
          onError?.(error);         // ✅ use onError prop
        }
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan, onError]);

  return (
    <div style={styles.container}>
      <div id="qr-reader" ref={scannerRef} style={styles.scanner}></div>

      {isScanning && (
        <p style={styles.hint}>
          📱 Point your camera at the QR code
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  scanner: {
    width: '100%',
    maxWidth: '500px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  hint: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center'
  }
};

export default QRScanner;
