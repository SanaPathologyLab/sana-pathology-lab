import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import Logo from '../components/Logo';
import Loader from '../components/Loader';

const API = '/api';

const PrintReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    labName: 'Sana Pathology Lab',
    labAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal-244303 (U.P)',
    labPhone: '6396786939',
    labPhone2: '6397240575',
    reportFooter: 'This Report is not Valid for medico legal Purpose.',
  });

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${user.accessToken}` };
    Promise.all([
      fetch(`${API}/reports/${id}`, { headers }).then(r => r.json()),
      fetch(`${API}/settings`, { headers }).then(r => r.json()),
    ]).then(([reportData, settingsData]) => {
      setReport(reportData);
      if (settingsData && !settingsData.error) setSettings(prev => ({ ...prev, ...settingsData }));
    }).catch(console.error);
  }, [id, user]);

  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Loader size="lg" />
      <p className="text-gray-600 font-semibold mt-4">Loading Report...</p>
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
    
    if (r.groupName === '__SUMMARY__') {
      groupedTests[testName].summary = r.resultValue;
    } else {
      groupedTests[testName].rows.push(r);
    }
  });
  const testNames = Object.keys(groupedTests);

  const qrValue = `${window.location.origin}${import.meta.env.BASE_URL}#/public-print/${report.reportNumber}`;

  const handleWhatsApp = async () => {
    try {
      setIsGenerating(true);
      
      // Temporarily hide UI elements and remove body background for clean capture
      const noPrintElements = document.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.style.display = 'none');
      const originalBodyBg = document.body.style.background;
      document.body.style.background = 'white';
      
      // Switch to simplified PDF capture mode
      const wrapper = document.getElementById('report-content');
      if (wrapper) wrapper.classList.add('is-capturing');
      document.querySelectorAll('.report-page').forEach(p => p.classList.add('is-capturing'));
      
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin:       0,
        filename:     `${report.reportNumber}_${patient.fullName}.pdf`,
        image:        { type: 'png', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 1400 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css'] }
      };

      const pdfBlob = await html2pdf().set(opt).from(wrapper).output('blob');
      
      // Restore UI
      if (wrapper) wrapper.classList.remove('is-capturing');
      document.querySelectorAll('.report-page').forEach(p => p.classList.remove('is-capturing'));
      noPrintElements.forEach(el => el.style.display = '');
      document.body.style.background = originalBodyBg;
      
      const fileName = `${report.reportNumber}_${patient.fullName}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const msgText = `*${settings.labName}*\n\nHello ${patient.fullName},\nYour test report is ready!\n\n*Report No:* ${report.reportNumber}\n*Date:* ${new Date(report.reportDate).toLocaleDateString('en-IN')}\n\n📞 ${settings.labPhone}`;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Test Report',
          text: msgText
        });
      } else {
        // Desktop Flow: Download and redirect
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        try {
          await navigator.clipboard.writeText(msgText);
          alert("✅ PDF Downloaded!\n\nWe have copied the message to your clipboard.\n\nWhatsApp Web will now open. Please paste the message and attach the downloaded PDF file into the chat.");
        } catch (e) {
          alert("✅ PDF Downloaded!\n\nWhatsApp Web will now open. Please attach the downloaded PDF file to the patient's chat.");
        }
        
        const encodedMsg = encodeURIComponent(msgText);
        window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate high-quality PDF for WhatsApp sharing.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTelegram = () => {
    const reportUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/public-print/${report.reportNumber}`;
    const msgText = `*${settings.labName}*\n\nHello ${patient.fullName},\nYour test report is ready!\n\n*Report No:* ${report.reportNumber}\n*Date:* ${new Date(report.reportDate).toLocaleDateString('en-IN')}\n\nView and download your report here:`;
    
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(reportUrl)}&text=${encodeURIComponent(msgText)}`;
    window.open(telegramUrl, '_blank');
  };

  // ── High Quality HTML Letterhead Header (Screen & PDF share only) ──
  const LetterheadHeader = () => (
    <div className="relative w-full print:hidden letterhead-header" style={{ background: '#fff' }}>
      {/* Decorative swoosh - CSS only for html2canvas compatibility */}
      <div className="absolute top-0 right-0 w-[240px] h-[90px] z-0" style={{
        background: 'linear-gradient(135deg, transparent 40%, rgba(224,58,60,0.2) 60%, rgba(122,40,203,0.15) 80%, rgba(0,72,141,0.1) 100%)',
        borderBottomLeftRadius: '80px'
      }}></div>

      <div className="flex items-end px-3 pt-5 pb-0.5 relative z-10 w-full">
        {/* Logo and Lab Name Sub-Label */}
        <div className="flex flex-col items-center w-[120px] shrink-0 mr-4">
          <Logo className="w-[82px] h-[82px] object-contain" />
          <div className="text-[10px] font-bold text-black tracking-[0.05em] mt-1 whitespace-nowrap" style={{ fontFamily: 'Arial, sans-serif' }}>
            SANA PATHOLOGY LAB
          </div>
        </div>

        {/* Lab Info Container */}
        <div className="flex-grow flex flex-col justify-end">
          {/* Main Lab Title */}
          <div className="w-full text-[#1a2f4c] uppercase font-black mb-2 tracking-tight whitespace-nowrap" style={{ fontFamily: 'Arial Black, Impact, sans-serif', fontSize: '42px', lineHeight: '1.05' }}>
            {settings.labName || 'SANA PATHOLOGY LAB'}
          </div>

          {/* Three-column Sub-info Row */}
          <div className="flex items-end justify-between w-full pb-1">
            {/* Left Col: Technician Info */}
            <div className="flex flex-col items-center shrink-0" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="text-[18px] font-bold leading-none text-black whitespace-nowrap">Mohd. Altamash</div>
              <div className="text-[11px] font-bold leading-tight text-black mt-1 font-sans">D.M.L.T.</div>
              <div className="text-[11px] font-bold leading-tight text-black font-sans">Technician</div>
            </div>

            {/* Middle Col: Service Info */}
            <div className="flex flex-col items-center flex-1 px-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="text-[17px] font-bold leading-none text-black tracking-wide whitespace-nowrap">Fully Computerized Lab</div>
              <div className="bg-[#1e2a8a] text-white text-[11px] font-bold px-3 py-[3px] rounded-[3px] mt-1.5 shadow-sm font-sans tracking-wide whitespace-nowrap">
                Emergency 24 Hours Service
              </div>
            </div>

            {/* Right Col: Phone Numbers */}
            <div className="flex flex-col items-end shrink-0 text-black mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="text-[13px] font-bold leading-[1.3] tracking-wide whitespace-nowrap">M.:6396786939</div>
              <div className="text-[13px] font-bold leading-[1.3] tracking-wide whitespace-nowrap">M.:6397240575</div>
            </div>
          </div>
        </div>
      </div>

      {/* Double Border Line */}
      <div style={{ marginTop: '8px', borderBottom: '3px solid #000' }}></div>
      <div style={{ marginTop: '2px', borderBottom: '1px solid #000', marginBottom: '10px' }}></div>
    </div>
  );

  // ── High Quality HTML Letterhead Footer (Screen & PDF share only) ──
  const LetterheadFooter = () => (
    <footer className="absolute bottom-[30mm] left-0 w-full px-[14mm] bg-white z-20">
      {/* Signature Area (Visible on print and screen) */}
      <div className="flex justify-between items-end px-12 mb-1">
        <div></div>
        <div className="text-right">
          <div className="italic font-bold text-[14px] mb-0.5 mr-6 text-black">Thanks for Reference</div>
          <div className="flex items-center justify-end gap-2 text-[13px] font-bold italic text-black">
            <span>Checked by</span>
            {/* Signature Image */}
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

  // ── Patient Info & QR (Visible everywhere) ──
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

  // ── Test Results Table (Visible everywhere) ──
  const TestTable = ({ testName, rows, showHeader = true, summary = '' }) => {
    const isMantoux = testName.toUpperCase().includes('MANTOUX') || (rows[0] && rows[0].test?.testCode === 'MANTOUX-01');
    const isMalaria = testName.toUpperCase().includes('MALARIA MICRO') || (rows[0] && rows[0].test?.testCode === 'MP-MICRO');

    if (isMantoux) {
      const doseRow = rows.find(r => r.parameterName.includes('Dose')) || rows[0];
      const indurationRow = rows.find(r => r.parameterName.includes('Induration')) || rows[1];
      const resultRow = rows.find(r => r.parameterName.includes('Result')) || rows[2];

      return (
        <div className="relative z-10 w-full" style={{ fontFamily: 'Georgia, serif', color: '#000' }}>
          <div className="text-center mb-4 mt-2">
            <h3 className="text-[17px] font-black underline uppercase tracking-wide">{testName}</h3>
            <p className="text-[13px] font-bold mt-1 text-gray-800">(Interdermal Skin Test)</p>
          </div>

          {/* Top Data Table */}
          <div className="border border-black mb-4">
            <table className="w-full border-collapse text-[13.5px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-1/2 p-2.5 font-bold border-r border-black">Tuberculin Dose</td>
                  <td className="w-1/2 p-2.5 font-bold">{doseRow?.resultValue || '0.1 mL of TU PPD'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-1/2 p-2.5 font-bold border-r border-black">Induration (mm)</td>
                  <td className="w-1/2 p-2.5 font-bold">{indurationRow?.resultValue || '—'}</td>
                </tr>
                <tr>
                  <td className="w-1/2 p-2.5 font-bold border-r border-black">Result after 48 hours</td>
                  <td className="w-1/2 p-2.5 font-black text-[15px]">{resultRow?.resultValue || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Interpretation Section */}
          <div className="mb-4 text-[13.5px] leading-relaxed text-black">
            <p className="font-bold mb-1">Interpretation:</p>
            <p className="text-justify text-gray-900">
              Induration measuring 10 mm more is considered positive which shows hypersensitivity to <span className="italic underline">tuberculoprotein</span>. It indicates past or present infection with <span className="italic underline">Mycobacterium</span> tuberculosis.
            </p>
          </div>

          {/* Induration Size Reference Table */}
          <div className="border border-black text-[11px] mb-2">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold">
                  <th className="p-2 border-r border-black w-1/3">Induration Size</th>
                  <th className="p-2 w-2/3">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="p-2 border-r border-black font-semibold">&lt; 5 mm</td>
                  <td className="p-2">A negative result, indicating no exposure to TB</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-semibold">5–9 mm</td>
                  <td className="p-2">Usually considered positive for people who are immunocompromised or have other risk factors for TB</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-semibold">10–14 mm</td>
                  <td className="p-2">Usually considered positive for people with medical risk factors for TB, recent immigrants from areas with high TB prevalence, or close contacts with people with TB</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-semibold">&gt; 15 mm</td>
                  <td className="p-2">Usually considered positive for people with no known risk factors for TB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (isMalaria) {
      const resultValue = rows[0]?.resultValue || 'NOT-SEEN';
      return (
        <div className="relative z-10 w-full mb-6" style={{ fontFamily: 'Georgia, serif', color: '#000' }}>
          <h3 className="text-[17px] font-black underline uppercase text-center mb-8">IMMUNOLOGY & SEROLOGY TEST</h3>
          
          <div className="grid grid-cols-2 mb-8 items-center">
            <div className="flex flex-col items-start">
              <div className="font-bold text-[15px] uppercase tracking-wide">MALARIA PARASITE IDENTIFICATION</div>
              <div className="text-[12px] font-bold mt-0.5 w-full text-center" style={{ maxWidth: '280px' }}>(MICROSCOPY)</div>
            </div>
            <div className="font-black text-[16px] uppercase tracking-wide pl-8">{resultValue}</div>
          </div>

          <div className="mt-6 text-[13px] leading-relaxed">
            <p className="font-bold mb-2">NOTE:</p>
            <div className="space-y-1">
              <p className="flex items-start"><span className="mr-2">➤</span> A Single negative smear does not rule out malaria</p>
              <p className="flex items-start"><span className="mr-2">➤</span> Test conducted on whole blood.</p>
            </div>
          </div>
        </div>
      );
    }

    const overallIdx = rows.findIndex(r => r.groupName === `__OVERALL__${testName}`);
    const overallResult = overallIdx !== -1 ? rows[overallIdx] : null;
    const filteredRows = overallResult ? rows.filter((_, i) => i !== overallIdx) : rows;

    return (
    <div className="relative z-10">
      <div className="px-2">
        {showHeader && rows.length > 0 && (() => {
          const firstParam = filteredRows[0]?.test?.parameters?.find(p => p.parameterName === filteredRows[0]?.parameterName);
          const isTiterTest = firstParam?.isQualitative && firstParam?.titerValues;
          const titerList = isTiterTest ? firstParam.titerValues.split(',') : [];

          return (
            <div className="border border-black rounded-3xl px-2 py-1.5 mb-2 flex items-center text-[13px] font-bold text-black box-border">
              <div className={(isTiterTest ? "w-[25%]" : "w-[45%]") + " pl-2"}>Investigations</div>
              {isTiterTest ? (
                <>
                  {titerList.map(t => (
                    <div key={t} className="flex-1 text-center text-[11px]">{t.trim()}</div>
                  ))}
                  <div className="w-[10%] text-center text-[10px]">Unit</div>
                  <div className="w-[20%] text-center text-[10px] pr-2">Range</div>
                </>
              ) : (
                <>
                  <div className="w-[12%] text-center">Results</div>
                  <div className="w-[8%] text-center">Flag</div>
                  <div className="w-[12%] text-center">Units</div>
                  <div className="w-[23%] text-center pr-2">Normal values</div>
                </>
              )}
            </div>
          );
        })()}
        {rows.length > 0 ? (
          <>
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
              // Check if parameter is qualitative with titer values
              const paramDef = res.test?.parameters?.find(p => p.parameterName === res.parameterName);
              const isQual = paramDef?.isQualitative;
              const titerVals = paramDef?.titerValues;
              // Parse titer results from resultValue (stored as "1/20|+||1/40|+||...")
              const titerResults = titerVals && res.resultValue
                ? res.resultValue.split('||').map(entry => {
                    const parts = entry.split('|');
                    return { titer: parts[0], value: parts[1] || '' };
                  })
                : [];
              const isImmunology = false; // Disable special immunology layout to keep columns aligned
              const colCount = titerResults.length > 0 ? (3 + titerResults.length) : 5;
              return (
                <React.Fragment key={res.id || idx}>
                  {showGroup && !isImmunology && (
                    <tr>
                      <td colSpan={colCount} className="pt-2 pb-1.5 font-bold underline uppercase text-[14px] text-black">
                        {res.groupName}
                      </td>
                    </tr>
                  )}
                  {isImmunology ? (
                    <>
                      {showGroup && (
                        <tr>
                          <td colSpan={colCount} className="pt-3 pb-1 font-black text-[15px] underline uppercase tracking-wider text-black" style={{ fontFamily: 'Georgia, serif' }}>
                            {res.groupName}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={colCount} className="py-1">
                          <div className="flex items-center" style={{ fontFamily: 'Georgia, serif' }}>
                            <span className="font-semibold uppercase text-[13.5px]">{res.parameterName}</span>
                            <div className="flex-1 mx-3" style={{ borderBottom: '1px dotted #999', height: '1px' }}></div>
                            <span className="font-black text-[15px]">{res.resultValue}</span>
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : titerResults.length > 0 ? (
                    <tr>
                      <td className="py-1 pl-2 font-semibold uppercase w-[25%] align-top">
                        {res.parameterName}
                      </td>
                      {titerVals ? titerVals.split(',').map((titer, ti) => {
                        const tr = titerResults.find(r => r.titer.trim() === titer.trim());
                        const val = tr ? tr.value : '--';
                        return (
                          <td key={ti} className="py-1 text-center font-bold text-[13px] align-top">
                            <span className={`${val === '+' ? 'text-green-700' : val === '-' ? 'text-red-600' : 'text-gray-300'}`}>{val || '—'}</span>
                          </td>
                        );
                      }) : titerResults.map((tr, ti) => (
                        <td key={ti} className="py-1 text-center font-bold text-[13px] align-top">
                          <span className={`${tr.value === '+' ? 'text-green-700' : tr.value === '-' ? 'text-red-600' : 'text-gray-300'}`}>
                            {tr.value || '—'}
                          </span>
                        </td>
                      ))}
                      <td className="py-1 text-center font-semibold text-gray-500 w-[10%] align-top text-[12px]">
                        {res.unit || ''}
                      </td>
                      <td className="py-1 text-center pr-2 font-semibold whitespace-nowrap text-gray-500 w-[20%] align-top text-[12px] leading-tight">
                        {res.referenceRange || ''}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className={`py-1 pl-2 font-semibold uppercase ${res.groupName ? '' : ''} ${isQual ? 'w-[45%]' : 'w-[45%]'} align-top`}>
                        {res.parameterName}
                      </td>
                      <td colSpan={isQual ? 4 : 1} className={`py-1 ${isQual ? 'text-left pl-4' : 'text-center'} align-top ${isQual ? 'w-[55%]' : 'w-[12%]'} whitespace-nowrap`}>
                        <span className={`${isQual ? 'font-black text-[15px]' + (res.resultValue?.startsWith('POSITIVE') ? ' text-green-700' : res.resultValue?.startsWith('NEGATIVE') ? ' text-red-600' : '') : isAbnormal ? 'font-black border-b-[1.5px] border-black pb-0.5' : 'font-bold'}`}>
                          {res.resultValue === '+' ? 'POSITIVE' : res.resultValue === '-' ? 'NEGATIVE' : res.resultValue}
                        </span>
                      </td>
                      {!isQual && (
                        <>
                          <td className="py-1 text-center font-bold text-[13px] w-[8%] align-top">
                            {isHigh ? 'High' : isLow ? 'Low' : ''}
                          </td>
                          <td className="py-1 text-center font-semibold w-[12%] align-top">{res.unit}</td>
                          <td className="py-1 text-center pr-2 font-semibold w-[23%] align-top text-[12px] leading-tight break-words">
                            {res.referenceRange}
                          </td>
                        </>
                      )}
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </>
        ) : (
          <div className="font-black text-[15px] underline uppercase tracking-wider text-black mt-2">
            {testName} (Note)
          </div>
        )}

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

  // --- Linear Parameter-Level Pagination ---
  const PAGE_CAPACITY = 22;
  const COST = {
    testHeader: 2.0,
    groupHeader: 1.2,
    paramRow: 0.8,
    qualOffset: 0.5,
    summary: 2.0,
    endOfReport: 2.0,
  };

  const flatTests = [];
  testNames.forEach(testName => {
    const { rows, summary } = groupedTests[testName];
    let totalCost = 0;
    let tempPrevGroup = null;
    let summaryCost = 0;
    if (summary) {
      summaryCost = 1.0 + (summary.split('\n').length * 0.5) + Math.ceil(summary.length / 80) * 0.4;
    }
    rows.forEach((row, idx) => {
      const isNewGroup = row.groupName && row.groupName !== tempPrevGroup;
      const paramDef = row.test?.parameters?.find(p => p.parameterName === row.parameterName);
      let cost = COST.paramRow + (paramDef?.isQualitative ? COST.qualOffset : 0) + (isNewGroup ? COST.groupHeader : 0) + (idx === 0 ? COST.testHeader : 0);
      if (row.parameterName && row.parameterName.length > 26) cost += 0.8;
      totalCost += cost;
      tempPrevGroup = row.groupName;
    });
    flatTests.push({ testName, rows, summary, totalCost, summaryCost });
  });

  const pages = [];
  let curPage = { segments: [] };
  let pageUsed = 0;
  let curSeg = null;
  let prevGroup = null;

  const flushSeg = () => { if (curSeg) { curPage.segments.push(curSeg); curSeg = null; } };
  const flushPage = () => { flushSeg(); pages.push(curPage); curPage = { segments: [] }; pageUsed = 0; prevGroup = null; };

  flatTests.forEach(test => {
    const { testName, rows, summary, totalCost, summaryCost } = test;
    const fullTestCost = totalCost + summaryCost;
    
    // Shift whole test (rows + summary) to new page if it fits on a single page but not the current one
    if (fullTestCost > 0 && fullTestCost <= PAGE_CAPACITY && pageUsed + fullTestCost > PAGE_CAPACITY && pageUsed > 0) {
      flushPage();
    }
    
    rows.forEach((row, idx) => {
      const isNewGroup = row.groupName && row.groupName !== prevGroup;
      const paramDef = row.test?.parameters?.find(p => p.parameterName === row.parameterName);
      let cost = COST.paramRow + (paramDef?.isQualitative ? COST.qualOffset : 0) + (isNewGroup ? COST.groupHeader : 0);
      
      if (!curSeg) cost += COST.testHeader;
      if (row.parameterName && row.parameterName.length > 26) cost += 0.8;

      if (pageUsed + cost > PAGE_CAPACITY && pageUsed > 0) {
        flushPage();
        cost = COST.testHeader + COST.paramRow + (paramDef?.isQualitative ? COST.qualOffset : 0);
        if (row.parameterName && row.parameterName.length > 26) cost += 0.8;
      }

      if (!curSeg) { curSeg = { testName, summary: null, rows: [] }; prevGroup = null; }
      curSeg.rows.push(row);
      pageUsed += cost;
      prevGroup = row.groupName;
    });

    if (summary) {
      if (pageUsed + summaryCost > PAGE_CAPACITY && pageUsed > 0) {
        flushPage();
      }
      
      if (!curSeg) {
        curSeg = { testName, summary, rows: [] };
      } else {
        curSeg.summary = summary;
      }
      pageUsed += summaryCost;
    }

    flushSeg();
  });

  if (pageUsed + COST.endOfReport > PAGE_CAPACITY) flushPage();
  pages.push(curPage);

  const totalPages = pages.length;


  const handlePrint = () => {
    if (window.ReactNativeWebView) {
      // Send the current HTML to the native app to be printed by expo-print
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <base href="${window.location.origin}">
            ${document.head.innerHTML}
          </head>
          <body>
            ${document.body.innerHTML}
          </body>
        </html>
      `;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PRINT_HTML',
        html: htmlContent
      }));
    } else {
      window.print();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; background: #e8edf4; }

        .report-wrapper {
          background: #e8edf4;
          min-height: 100vh;
          padding: 80px 16px 40px;
        }

        .report-page {
          background-color: white;
          width: 210mm;
          height: 297mm; /* Strict A4 Height */
          margin: 0 auto 24px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.18);
          
          /* Using crisp HTML letterhead, so minimal padding is needed */
          padding: 0mm 14mm 0mm;
          
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
          overflow: hidden; /* Prevent breaking the A4 boundary */
        }

        /* Capture styles for html2pdf */
        .report-wrapper.is-capturing {
          padding: 0 !important;
          background: white !important;
        }

        .report-page.is-capturing {
          margin: 0 !important;
          box-shadow: none !important;
          width: 210mm !important;
          height: 297mm !important; /* Strict A4 */
          page-break-after: always !important;
          break-after: page !important;
        }

        /* ── PRINT STYLES ──────────────────────────────────────── */
        @media print {
          @page { margin: 0; size: A4 portrait; }

          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: white !important; margin: 0 !important; }

          .no-print { display: none !important; }

          .report-wrapper {
            background: white !important;
            padding: 0 !important;
          }

          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important; /* Strict A4 */
            
            /* Apply spacing ONLY when printing to account for physical pre-printed letterhead margins */
            padding-top: 48mm !important; 
            padding-bottom: 25mm !important;
            padding-left: 14mm !important;
            padding-right: 14mm !important;

            break-after: page;
            page-break-after: always;
          }

          .report-page:last-of-type {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          /* PDF capture mode */

          tr { break-inside: avoid; page-break-inside: avoid; }
          thead { display: table-header-group; }
          
          /* Hide HTML letterhead on print (so it doesn't double-print on physical letterhead) */
          .print\\:hidden { display: none !important; }
        }
      `}} />

      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <div className="text-sm font-bold text-[#00488d]">{report.reportNumber} — {patient.fullName}</div>
        <div className="flex-1"></div>
        <span className="text-xs text-gray-400 font-semibold">{totalPages} page{totalPages > 1 ? 's' : ''}</span>
        <button onClick={handleWhatsApp}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold shadow-sm transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {isGenerating ? 'Generating PDF...' : 'WhatsApp Share'}
        </button>
        <button onClick={handleTelegram}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-bold shadow-sm transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.31-.35-.11l-6.4 4.024-2.76-.86c-.6-.185-.612-.6.125-.89l10.736-4.136c.498-.184.937.114.808.887z"/>
          </svg>
          Telegram
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 bg-[#00488d] hover:bg-blue-800 text-white rounded text-sm font-bold shadow-sm transition-colors">
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="report-wrapper" id="report-content">
        {pages.map((pageData, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1;
          return (
            <div key={`page-${pageIndex}`} className="report-page">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 print:hidden">
                <Logo className="w-[300px] h-[300px] grayscale" />
                <div className="text-[52px] font-black tracking-widest mt-4 text-black">SANA PATHOLOGY LAB</div>
              </div>
              <LetterheadHeader />
              <div className="flex-grow flex flex-col relative z-10 px-2 pb-[170px]">
                <PatientHeader pageNum={pageIndex + 1} totalPages={totalPages} />
                <div className="flex-grow mt-2">
                  {pageData.segments.map((seg, idx) => {
                    const isLastSegForTest = !pages.slice(pageIndex + 1).some(p => p.segments?.some(s => s.testName === seg.testName));
                    const isTiterSeg = (s) => s?.rows?.[0]?.test?.parameters?.some(p => p.isQualitative && p.titerValues);
                    const prevSeg = idx > 0 ? pageData.segments[idx - 1] : null;
                    const showHeader = idx === 0 || isTiterSeg(seg) !== isTiterSeg(prevSeg);
                    return (
                      <div key={seg.testName + idx} className={idx > 0 ? 'mt-4' : ''}>
                        <TestTable testName={seg.testName} rows={seg.rows} showHeader={showHeader} summary={isLastSegForTest ? seg.summary : ''} />
                      </div>
                    );
                  })}
                  {isLastPage && (
                    <div className="mt-8 mb-4 flex flex-col items-center justify-center w-full">
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

export default PrintReport;
