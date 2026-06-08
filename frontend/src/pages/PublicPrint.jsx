import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Logo from '../components/Logo';

const API = '/api';

const PublicPrint = () => {
  const { reportNumber } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    labName: 'Sana Pathology Lab',
    labAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal-244303 (U.P)',
    labPhone: '6396786939',
    labPhone2: '6397240575',
    reportFooter: 'This Report is not Valid for medico legal Purpose.',
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/public/report-lookup?reportNumber=${encodeURIComponent(reportNumber)}`).then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Report not found');
        return data[0]; // array returned from lookup
      }),
      fetch(`${API}/settings`).then(r => r.json()).catch(() => ({})), // Public settings fetch might fail if protected, but we have defaults
    ]).then(([reportData, settingsData]) => {
      setReport(reportData);
      if (settingsData && !settingsData.error && Object.keys(settingsData).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    }).catch(err => {
      console.error(err);
      setError(err.message || 'Failed to load report.');
    });
  }, [reportNumber]);

  // Auto-trigger print dialog when report is fully loaded
  useEffect(() => {
    if (report) {
      // Small delay to ensure rendering is complete before print dialog opens
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [report]);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">!</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report Unavailable</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="bg-[#00488d] text-white px-6 py-2 rounded-lg font-bold">Go to Home</button>
      </div>
    </div>
  );

  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-10 h-10 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 font-semibold">Loading Report...</p>
    </div>
  );

  const patient = report.patient || {};
  const doctor = report.doctor || { name: 'Self' };
  const results = report.results || [];

  const groupedTests = {};
  results.forEach(r => {
    const testName = r.test?.testName || 'Test Results';
    if (!groupedTests[testName]) {
      groupedTests[testName] = { rows: [], summary: r.test?.summary || '' };
    }
    groupedTests[testName].rows.push(r);
  });
  const testNames = Object.keys(groupedTests);

  const qrValue = `${window.location.origin}/public-print/${report.reportNumber}`;

  const handleWhatsApp = () => {
    const publicUrl = `${window.location.origin}/public-print/${report.reportNumber}`;
    const msg = encodeURIComponent(
      `*${settings.labName}*\n\nHello ${patient.fullName},\nYour test report is ready!\n\n*Report No:* ${report.reportNumber}\n*Date:* ${new Date(report.reportDate).toLocaleDateString('en-IN')}\n\n*Click the link below to instantly view and download your PDF report:*\n${publicUrl}\n\n📞 ${settings.labPhone}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // ── High Quality HTML Letterhead Header (Screen & PDF share only) ──
  const LetterheadHeader = () => (
    <div className="relative w-full print:hidden">
      <svg className="absolute top-0 right-0 w-[240px] h-[90px] z-0 opacity-80" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path d="M40,0 C100,50 150,80 200,100 L200,0 Z" fill="#e03a3c" opacity="0.7"/>
        <path d="M90,0 C140,40 170,70 200,80 L200,0 Z" fill="#7a28cb" opacity="0.6"/>
        <path d="M140,0 C170,20 185,40 200,60 L200,0 Z" fill="#00488d" opacity="0.5"/>
      </svg>
      <div className="flex items-end px-3 pt-5 pb-0.5 relative z-10 w-full">
        <div className="flex flex-col items-center w-[120px] shrink-0 mr-4 relative top-[5px]">
          <Logo className="w-[100px] h-[100px] object-contain" />
          <div className="text-[10px] font-bold text-black tracking-[0.05em] mt-1 whitespace-nowrap" style={{ fontFamily: 'Arial, sans-serif' }}>
            SANA PATHOLOGY LAB
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className="w-full text-[#1a2f4c] uppercase font-black mb-2 tracking-tight whitespace-nowrap -ml-10" style={{ fontFamily: 'Arial Black, Impact, sans-serif', fontSize: '44px', lineHeight: '0.8', transform: 'scaleY(1.05)', transformOrigin: 'bottom' }}>
            {settings.labName || 'SANA PATHOLOGY LAB'}
          </div>
          <div className="flex items-end justify-between w-full pb-1">
            <div className="flex flex-col items-center shrink-0" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="text-[19px] font-bold leading-none text-black whitespace-nowrap">Mohd. Altamash</div>
              <div className="text-[12px] font-bold leading-tight text-black mt-1 font-sans">D.M.L.T.</div>
              <div className="text-[12px] font-bold leading-tight text-black font-sans">Technician</div>
            </div>
            <div className="flex flex-col items-center flex-1 px-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="text-[18px] font-bold leading-none text-black tracking-wide whitespace-nowrap">Fully Computerized Lab</div>
              <div className="bg-[#1e2a8a] text-white text-[12px] font-bold px-3 py-[2px] rounded-[3px] mt-1.5 shadow-sm font-sans tracking-wide whitespace-nowrap">
                Emergency 24 Hours Service
              </div>
            </div>
            <div className="flex flex-col items-start shrink-0 text-black mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="text-[14px] font-bold leading-[1.2] tracking-wide whitespace-nowrap">M.:6396786939</div>
              <div className="text-[14px] font-bold leading-[1.2] tracking-wide whitespace-nowrap">M.:6397240575</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 border-b-[3px] border-black"></div>
      <div className="mt-[2px] border-b-[1px] border-black mb-3"></div>
    </div>
  );

  // ── High Quality HTML Letterhead Footer (Screen & PDF share only) ──
  const LetterheadFooter = () => (
    <footer className="mt-auto w-full">
      <div className="flex justify-between items-end px-12 mb-3">
        <div></div>
        <div className="text-right">
          <div className="italic font-bold text-[14px] mb-1 mr-6 text-black">Thanks for Reference</div>
          <div className="flex items-center justify-end gap-2 text-[13px] font-bold italic text-black">
            <span>Checked by</span>
            <div className="flex flex-col items-center ml-2">
              <img src={`${import.meta.env.BASE_URL}Signature.png`} alt="Signature" className="h-[40px] w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="w-[120px] border-b border-black mt-1"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="print:hidden w-full">
        <div className="border-t-[1.5px] border-b-[1.5px] border-[#d82c2a]">
          <div className="text-center text-[#d82c2a] font-bold text-[15px] py-1.5 font-sans tracking-wide">
            Add.: Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal-244303 (U.P)
          </div>
        </div>
        <div className="text-center text-black font-bold text-[13px] pt-1.5 pb-5 font-sans">
          This Report is not Valid for medico legal Purpose.
        </div>
      </div>
    </footer>
  );

  const PatientHeader = ({ pageNum, totalPages }) => (
    <div className="mb-4 mt-1 print:mt-0 relative z-10 flex gap-2">
      <div className="border border-black p-2 text-[13px] font-bold uppercase text-black flex-1">
        <div className="flex justify-between mb-1.5">
          <div>PATIENT'S NAME:- <span className="font-black text-[14px]">{patient.fullName}</span></div>
          <div>AGE/SEX:- {patient.age} {patient.ageType || 'Yrs'}/{patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'O'}</div>
        </div>
        <div className="flex justify-between mb-1.5">
          <div>REFER BY DOCTOR:- DR. {doctor.name}</div>
          <div>DATE:- {new Date(report.reportDate).toLocaleDateString('en-GB')}</div>
        </div>
        <div className="flex justify-between">
          <div>TYPE OF SAMPLE:- {report.results?.[0]?.test?.sampleType || 'BLOOD'}</div>
          <div>REPORT NO:- {report.reportNumber} &nbsp; | &nbsp; PAGE {pageNum < 10 ? '0'+pageNum : pageNum} OF {totalPages < 10 ? '0'+totalPages : totalPages}</div>
        </div>
      </div>
      <div className="border border-black p-1 shrink-0 bg-white flex items-center justify-center">
        <QRCodeSVG value={qrValue} size={64} level="M" />
      </div>
    </div>
  );

  const TestTable = ({ testName, rows, summary = '' }) => {
    const overallIdx = rows.findIndex(r => r.groupName === `__OVERALL__${testName}`);
    const overallResult = overallIdx !== -1 ? rows[overallIdx] : null;
    const filteredRows = overallResult ? rows.filter((_, i) => i !== overallIdx) : rows;
    return (
    <div className="relative z-10">
      {(() => {
        const firstParam = filteredRows[0]?.test?.parameters?.find(p => p.parameterName === filteredRows[0]?.parameterName);
        const isTiterTest = firstParam?.isQualitative && firstParam?.titerValues;
        const titerList = isTiterTest ? firstParam.titerValues.split(',') : [];
        return (
          <div className="border border-black rounded-full px-4 py-1 mb-2 flex text-[13px] font-bold text-black items-center">
            <div className={isTiterTest ? 'w-[25%]' : 'w-[45%]'}>Investigations</div>
            {isTiterTest && titerList.map((t, i) => (
              <div key={i} className="flex-1 text-center text-[11px]">{t.trim()}</div>
            ))}
            {isTiterTest ? (
              <>
                <div className="w-[10%] text-center text-[10px]">Unit</div>
                <div className="w-[10%] text-center text-[10px]">Range</div>
              </>
            ) : (
              <>
                <div className="w-[15%] text-center">Results</div>
                <div className="w-[10%] text-center">Flag</div>
                <div className="w-[15%] text-center">Units</div>
                <div className="w-[15%] text-center">Normal values</div>
              </>
            )}
          </div>
        );
      })()}
      <div className="px-2">
        <div className="font-black text-[15px] underline uppercase tracking-wider text-black mb-2">
          {testName}
        </div>
        <table className="w-full text-[13.5px] text-black">
          <tbody>
            {filteredRows.map((res, idx, arr) => {
              const prevGroup = idx > 0 ? arr[idx - 1].groupName : null;
              const showGroup = res.groupName && res.groupName !== prevGroup;
              const isHigh = res.flag === 'HIGH';
              const isLow = res.flag === 'LOW';
              const isAbnormal = isHigh || isLow;
              const paramDef = res.test?.parameters?.find(p => p.parameterName === res.parameterName);
              const isQual = paramDef?.isQualitative;
              const titerVals = paramDef?.titerValues;
              const titerResults = titerVals && res.resultValue
                ? res.resultValue.split('||').map(entry => {
                    const parts = entry.split('|');
                    return { titer: parts[0], value: parts[1] || '' };
                  })
                : [];
              return (
                <React.Fragment key={res.id || idx}>
                  {showGroup && (
                    <tr>
                      <td colSpan={titerResults.length > 0 ? (3 + titerResults.length) : 5} className="pt-2 pb-1.5 font-bold underline uppercase text-[14px] text-black">
                        {res.groupName}
                      </td>
                    </tr>
                  )}
                  {titerResults.length > 0 ? (
                    <tr>
                      <td className="py-1 font-semibold uppercase w-[25%] align-top">{res.parameterName}</td>
                      {titerResults.map((tr, ti) => (
                        <td key={ti} className="py-1 text-center font-bold text-[13px] align-top">
                          <span className={`${tr.value === '+' ? 'text-green-700' : tr.value === '-' ? 'text-red-600' : 'text-gray-300'}`}>{tr.value || '—'}</span>
                        </td>
                      ))}
                      <td className="py-1 text-center font-semibold text-gray-500 w-[10%] align-top text-[12px]">{res.unit || ''}</td>
                      <td className="py-1 text-center font-semibold whitespace-pre-wrap text-gray-500 w-[10%] align-top text-[12px]">{res.referenceRange || ''}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td className={`py-1 font-semibold uppercase ${isQual ? 'w-[70%]' : 'w-[45%]'} align-top`}>{res.parameterName}</td>
                      <td className={`py-1 text-center align-top ${isQual ? 'w-[30%]' : 'w-[15%]'}`}>
                        <span className={`${isQual ? 'font-black text-[15px] ' + (res.resultValue === '+' ? 'text-green-700' : res.resultValue === '-' ? 'text-red-600' : '') : isAbnormal ? 'font-black border-b-[1.5px] border-black pb-0.5' : 'font-bold'}`}>
                          {res.resultValue === '+' ? 'POSITIVE' : res.resultValue === '-' ? 'NEGATIVE' : res.resultValue}
                        </span>
                      </td>
                      {!isQual && (
                        <>
                          <td className="py-1 text-center font-bold text-[13px] w-[10%] align-top">{isHigh ? 'High' : isLow ? 'Low' : ''}</td>
                          <td className="py-1 text-center font-semibold w-[15%] align-top">{res.unit}</td>
                          <td className="py-1 text-center font-semibold whitespace-pre-wrap w-[15%] align-top text-[12px] leading-tight">{res.referenceRange}</td>
                        </>
                      )}
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {overallResult && (
          <div className="mt-3 flex items-center justify-between text-[14px] font-bold uppercase text-black border-t border-black pt-2">
            <span>Result:</span>
            <span>{overallResult.resultValue}</span>
          </div>
        )}
        {summary && (
          <div className="mt-4 p-3 border border-gray-300 rounded bg-gray-50 text-[12px] text-black leading-relaxed whitespace-pre-wrap">
            <span className="font-bold underline mr-1">Note:</span>
            {summary}
          </div>
        )}
      </div>
    </div>
  );
  };

  const totalPages = testNames.length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; background: #e8edf4; }
        .report-wrapper { background: #e8edf4; min-height: 100vh; padding: 80px 16px 40px; }
        .report-page { background-color: white; width: 210mm; height: 297mm; margin: 0 auto 24px; box-shadow: 0 4px 32px rgba(0,0,0,0.18); padding: 0mm 14mm 0mm; position: relative; display: flex; flex-direction: column; font-family: Arial, sans-serif; box-sizing: border-box; overflow: hidden; }
        @media print {
          @page { margin: 0; size: A4 portrait; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: white !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .report-wrapper { background: white !important; padding: 0 !important; }
          .report-page { box-shadow: none !important; margin: 0 !important; width: 210mm !important; height: 297mm !important; padding-top: 48mm !important; padding-bottom: 25mm !important; padding-left: 14mm !important; padding-right: 14mm !important; break-after: page; page-break-after: always; }
          .report-page:last-of-type { break-after: avoid !important; page-break-after: avoid !important; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          thead { display: table-header-group; }
          .print\\:hidden { display: none !important; }
        }
      `}} />

      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center gap-3 flex-wrap justify-center">
        <button onClick={() => navigate('/')} className="px-4 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors mr-auto">
          ← Home
        </button>
        <div className="text-sm font-bold text-[#00488d] text-center hidden md:block">{report.reportNumber} — {patient.fullName}</div>
        <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold shadow-sm transition-colors ml-auto">
          WhatsApp
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-[#00488d] hover:bg-blue-800 text-white rounded text-sm font-bold shadow-sm transition-colors">
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="report-wrapper">
        {testNames.map((testName, pageIndex) => {
          const { rows, summary } = groupedTests[testName];
          return (
            <div key={testName} className="report-page">
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 print:hidden">
                <Logo className="w-[350px] h-[350px] grayscale" />
                <div className="text-[52px] font-black tracking-widest mt-4 text-black">SANA PATHOLOGY LAB</div>
              </div>
              <LetterheadHeader />
              <div className="flex-grow flex flex-col relative z-10 px-2">
                <PatientHeader pageNum={pageIndex + 1} totalPages={totalPages} />
                <div className="flex-grow mt-2">
                  <TestTable testName={testName} rows={rows} summary={summary} />
                  {pageIndex === testNames.length - 1 && (
                    <div className="mt-12 mb-6 flex flex-col items-center justify-center w-full">
                      <div className="flex items-center w-3/4 mx-auto">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <div className="mx-4 text-[12px] font-bold tracking-[0.2em] text-[#1a2f4c] uppercase font-sans">End of Report</div>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-2 tracking-widest uppercase font-semibold">***</div>
                    </div>
                  )}
                </div>
              </div>
              <LetterheadFooter />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PublicPrint;
