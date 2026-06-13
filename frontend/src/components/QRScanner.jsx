import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    // We add a short timeout to ensure the DOM element 'reader' is mounted before initializing
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'reader',
          { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner.clear();
            onScan(decodedText);
          },
          (err) => {
            // Ignore ongoing read errors as they just mean "no QR code detected yet"
          }
        );

        // Cleanup on unmount
        return () => {
          scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
      } catch (err) {
        setError("Failed to initialize camera. Please make sure you have granted camera permissions.");
        console.error(err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#00488d]" />
            <h3 className="font-bold text-[#00488d]">Scan Patient ID Card</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="text-red-500 text-sm font-bold text-center py-8">{error}</div>
          ) : (
            <>
              <p className="text-xs text-gray-500 text-center mb-4">Point your camera at the QR code on the patient's ID card.</p>
              <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-dashed border-[#00488d]/30"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
