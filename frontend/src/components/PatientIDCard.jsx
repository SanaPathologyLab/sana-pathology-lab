import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

const PatientIDCard = ({ patient, settings }) => {
  const cardRef = useRef(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = `ID_Card_${patient.patientId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download ID card', err);
    }
  };

  if (!patient) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden Card for High-Res Capture if needed, but we'll capture the visible one */}
      <div 
        ref={cardRef} 
        className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative flex flex-col font-sans"
        style={{ width: '340px', height: '214px' }} // Approx CR80 ID Card dimensions
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00488d] to-blue-600 px-4 py-3 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wide">{settings?.labName || 'Sana Pathology Lab'}</h3>
            <p className="text-blue-100 text-[10px] font-medium leading-tight max-w-[200px] truncate">{settings?.labAddress || 'Patient Identity Card'}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex px-4 py-3 gap-3 bg-gradient-to-br from-white to-gray-50">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-lg font-black text-gray-900 leading-tight mb-0.5 truncate">{patient.fullName}</h2>
            <p className="text-xs font-bold text-gray-500 mb-2">{patient.patientId}</p>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-auto">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Age/Sex</p>
                <p className="text-[11px] font-semibold text-gray-800">{patient.age} {patient.ageType?.charAt(0) || 'Y'} / {patient.gender?.charAt(0) || 'U'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</p>
                <p className="text-[11px] font-semibold text-red-600">{patient.bloodGroup || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Mobile</p>
                <p className="text-[11px] font-semibold text-gray-800">{patient.mobileNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
              {/* QR Code encodes the patient ID for easy scanning */}
              <QRCodeSVG value={patient.patientId} size={70} level="M" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#00488d] py-1.5 px-4 text-center border-t border-blue-800">
          <p className="text-white text-[9px] font-medium opacity-90">Valid at all affiliated centers</p>
        </div>
      </div>

      <button 
        onClick={downloadCard}
        className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors"
      >
        <Download className="w-4 h-4" /> Download ID Card
      </button>
    </div>
  );
};

export default PatientIDCard;
