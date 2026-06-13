import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Logo from '../components/Logo';
import Loader from '../components/Loader';

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
    groupedTests[testName].rows.push(r);
  });
  const testNames = Object.keys(groupedTests);

  const qrValue = `${window.location.origin}${import.meta.env.BASE_URL}#/public-print/${report.reportNumber}`;

  const handleWhatsApp = () => {
    const publicUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/public-print/${report.reportNumber}`;
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
          <Logo className="w-[82px] h-[82px] object-contain" />
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
      {(() => {
        const firstParam = filteredRows[0]?.test?.parameters?.find(p => p.parameterName === filteredRows[0]?.parameterName);
        const isTiterTest = firstParam?.isQualitative && firstParam?.titerValues;
        const titerList = isTiterTest ? firstParam.titerValues.split(',') : [];
        return (
          <div className="border border-black rounded-full px-4 py-1 mb-2 flex text-[13px] font-bold text-black items-center">
            <div className={isTiterTest ? 'w-[25%]' : 'w-[35%]'}>Investigations</div>
            {isTiterTest && titerList.map((t, i) => (
              <div key={i} className="flex-1 text-center text-[11px]">{t.trim()}</div>
            ))}
            {isTiterTest ? (
              <>
                <div className="w-[10%] text-center text-[10px]">Unit</div>
                <div className="w-[20%] text-center text-[10px]">Range</div>
              </>
            ) : (
              <>
                <div className="w-[15%] text-center">Results</div>
                <div className="w-[10%] text-center">Flag</div>
                <div className="w-[15%] text-center">Units</div>
                <div className="w-[25%] text-center">Normal values</div>
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
                      <td className="py-1 font-semibold uppercase w-[25%] align-top">{res.parameterName}</td>
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
                          <span className={`${tr.value === '+' ? 'text-green-700' : tr.value === '-' ? 'text-red-600' : 'text-gray-300'}`}>{tr.value || '—'}</span>
                        </td>
                      ))}
                      <td className="py-1 text-center font-semibold text-gray-500 w-[10%] align-top text-[12px]">{res.unit || ''}</td>
                      <td className="py-1 text-center font-semibold whitespace-nowrap text-gray-500 w-[20%] align-top text-[12px]">{res.referenceRange || ''}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td className={`py-1 font-semibold uppercase ${isQual ? 'w-[35%]' : 'w-[35%]'} align-top`}>{res.parameterName}</td>
                      <td colSpan={isQual ? 4 : 1} className={`py-1 ${isQual ? 'text-left pl-4' : 'text-center'} align-top ${isQual ? 'w-[65%]' : 'w-[15%]'}`}>
                        <span className={`${isQual ? 'font-black text-[15px]' + (res.resultValue?.startsWith('POSITIVE') ? ' text-green-700' : res.resultValue?.startsWith('NEGATIVE') ? ' text-red-600' : '') : isAbnormal ? 'font-black border-b-[1.5px] border-black pb-0.5' : 'font-bold'}`}>
                          {res.resultValue === '+' ? 'POSITIVE' : res.resultValue === '-' ? 'NEGATIVE' : res.resultValue}
                        </span>
                      </td>
                      {!isQual && (
                        <>
                          <td className="py-1 text-center font-bold text-[13px] w-[10%] align-top">{isHigh ? 'High' : isLow ? 'Low' : ''}</td>
                          <td className="py-1 text-center font-semibold w-[15%] align-top">{res.unit}</td>
                          <td className="py-1 text-center font-semibold w-[25%] align-top text-[12px] leading-tight break-words">{res.referenceRange}</td>
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

  // --- Linear Parameter-Level Pagination ---
  const PAGE_CAPACITY = 13;
  const COST = { testHeader:2.0, groupHeader:1.2, paramRow:1.0, qualOffset:0.5, summary:2.0, endOfReport:2.0 };

  const flatItems = [];
  testNames.forEach(testName => {
    const { rows, summary } = groupedTests[testName];
    rows.forEach((row, idx) => flatItems.push({ type:'row', testName, summary, row, isLastRow: idx === rows.length-1, groupName: row.groupName||null }));
  });
  flatItems.push({ type:'end' });

  const pages = [];
  let curPage = { segments:[] }, pageUsed=0, curSeg=null, prevGroup=null, prevTest=null;
  const flushSeg  = () => { if (curSeg) { curPage.segments.push(curSeg); curSeg=null; } };
  const flushPage = () => { flushSeg(); pages.push(curPage); curPage={ segments:[] }; pageUsed=0; prevGroup=null; };

  flatItems.forEach(item => {
    if (item.type==='end') { if (pageUsed+COST.endOfReport>PAGE_CAPACITY) flushPage(); flushSeg(); pages.push(curPage); return; }
    const { testName, row, summary, isLastRow, groupName } = item;
    const isNewTest=testName!==prevTest, isNewGroup=groupName&&groupName!==prevGroup;
    const paramDef=row.test?.parameters?.find(p=>p.parameterName===row.parameterName);
    let cost=COST.paramRow+(paramDef?.isQualitative?COST.qualOffset:0)+(isNewGroup?COST.groupHeader:0)+(isNewTest?COST.testHeader:0)+(isLastRow&&summary?COST.summary:0);
    if (pageUsed+cost>PAGE_CAPACITY&&pageUsed>0) { flushPage(); cost=COST.testHeader+COST.paramRow+(paramDef?.isQualitative?COST.qualOffset:0)+(isLastRow&&summary?COST.summary:0); }
    if (isNewTest||!curSeg||curSeg.testName!==testName) { flushSeg(); curSeg={testName,summary,rows:[]}; prevGroup=null; }
    curSeg.rows.push(row); pageUsed+=cost; prevTest=testName; prevGroup=groupName;
  });

  const totalPages = pages.length;

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
        {pages.map((pageData, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1;
          return (
            <div key={`page-${pageIndex}`} className="report-page">
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 print:hidden">
                <Logo className="w-[300px] h-[300px] grayscale" />
                <div className="text-[52px] font-black tracking-widest mt-4 text-black">SANA PATHOLOGY LAB</div>
              </div>
              <LetterheadHeader />
              <div className="flex-grow flex flex-col relative z-10 px-2 pb-[230px]">
                <PatientHeader pageNum={pageIndex + 1} totalPages={totalPages} />
                <div className="flex-grow mt-2">
                  {pageData.segments.map((seg, idx) => {
                    const isLastSegForTest = !pages.slice(pageIndex+1).some(p => p.segments?.some(s => s.testName===seg.testName));
                    return (
                      <div key={seg.testName+idx} className={idx > 0 ? 'mt-4' : ''}>
                        <TestTable testName={seg.testName} rows={seg.rows} summary={isLastSegForTest ? seg.summary : ''} />
                      </div>
                    );
                  })}
                  {isLastPage && (
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
