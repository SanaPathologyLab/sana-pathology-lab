const svgString = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
  <defs>
    <linearGradient id="gradRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#ff2a2a;stop-opacity:1" />
      <stop offset="45%"  style="stop-color:#d91e6e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7b15d9;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#00d9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0044b3;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="gradGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   style="stop-color:#ffffff;stop-opacity:0.22" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0"   />
    </radialGradient>
  </defs>
  <path d="M50,10 C75,10 90,30 90,50 C90,75 70,90 50,90 C50,90 80,80 80,50 C80,25 50,20 50,20 Z" fill="url(#gradRight)"/>
  <path d="M50,90 C25,90 10,70 10,50 C10,25 30,10 50,10 C50,10 20,20 20,50 C20,75 50,80 50,80 Z" fill="url(#gradLeft)"/>
  <circle cx="50" cy="50" r="42" fill="url(#gradGlow)"/>
  <g transform="translate(30, 30) scale(0.4)" fill="#002f70">
    <path d="M48.2,35.6l-3.3-3.3L37.1,40c-0.2,0.2-0.5,0.4-0.8,0.5c0,0-2.8,0.7-3.9-0.4L25,32.8c-1.1-1.1-0.4-3.9-0.4-3.9 c0.1-0.3,0.3-0.6,0.5-0.8l7.8-7.8l-3.3-3.3c-1.1-1.1-2.8-1.1-3.9,0L9.4,33.3c-1.1,1.1-1.1,2.8,0,3.9l3.3,3.3l-2.4,2.4 C7.9,45.3,6.5,49,6.5,52.4c0,3.4,1.4,7.1,3.8,9.5l1.6,1.6c0.5,0.5,1.2,0.8,1.9,0.8h30.6c0.7,0,1.4-0.3,1.9-0.8l5.2-5.2 C52.5,57.3,52.5,55.7,51.5,54.6z M27.8,30l6.2,6.2l-6,6l-6.2-6.2L27.8,30z M44.6,60H13.8c-0.4,0-0.7-0.1-1-0.4l-1.6-1.6 c-2.1-2.1-3.1-4.8-3.1-7.5c0-2.8,1.1-5.5,3.1-7.5l0.8-0.8l11.4,11.4c1.1,1.1,2.8,1.1,3.9,0l6.2-6.2c0.5-0.5,0.8-1.2,0.8-1.9 c0-0.7-0.3-1.4-0.8-1.9L22,12.2l5.8-5.8c0.4-0.4,1-0.4,1.4,0l3.3,3.3l15.7-15.7c0.4-0.4,1-0.4,1.4,0l6.6,6.6c0.4,0.4,0.4,1,0,1.4 L40.5,17.7l3.3,3.3c0.4,0.4,0.4,1,0,1.4l-1.1,1.1c5.9-0.8,12,0.7,16.7,4.3l3.6-3.6c0.5-0.5,1.4-0.5,1.9,0l3.6,3.6 c0.5,0.5,0.5,1.4,0,1.9l-3.6,3.6c-4.4,4.4-11,5.3-16.1,2.7l-4.5,4.5l1.8,1.8C45.6,58.7,45.6,59.5,44.6,60z" />
    <path d="M78.6,80H21.4C19,80,17,82,17,84.4v7.2C17,94,19,96,21.4,96h57.2C81,96,83,94,83,91.6v-7.2C83,82,81,80,78.6,80z" />
    <path d="M57.6,76H42.4c-2.4,0-4.4-2-4.4-4.4V56c0-2.4,2-4.4,4.4-4.4h15.2c2.4,0,4.4,2,4.4,4.4v15.6C62,74,60,76,57.6,76z" />
  </g>
</svg>`;

export const generatePrintHTML = (report, settings, includeLetterhead = false) => {
  const lab = settings || {};
  const patient = report.patient || {};
  const results = report.results || [];
  const doctor = report.doctor || { name: 'Self Referral' };

  const groupedTests = {};
  results.forEach(r => {
    const testName = r.test?.testName || 'Test Results';
    if (!groupedTests[testName]) {
      groupedTests[testName] = { rows: [], summary: r.test?.summary || '' };
    }
    groupedTests[testName].rows.push(r);
  });
  const testNames = Object.keys(groupedTests);

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const qrValue = `https://sanapathologylab.github.io/sana-pathology-lab/#/public-print/${report.reportNumber}`;


  // --- Linear Parameter-Level Pagination ---
  // Cost units per row-type (empirically tuned for A4 with letterhead header)
  const PAGE_CAPACITY = 22;
  const COST = {
    testHeader: 2.0,   // test title + column header row
    groupHeader: 1.2,  // sub-group label row
    paramRow: 0.8,     // normal parameter row
    qualOffset: 0.5,   // extra space a qualitative result takes
    summary: 2.0,      // note/summary block at end of test
    endOfReport: 2.0,  // "End of Report" footer marker
  };

  const flatTests = [];
  testNames.forEach(testName => {
    const { rows, summary } = groupedTests[testName];
    let totalCost = 0;
    let tempPrevGroup = null;
    rows.forEach((row, idx) => {
      const isNewGroup = row.groupName && row.groupName !== tempPrevGroup;
      const paramDef = row.test?.parameters?.find(p => p.parameterName === row.parameterName);
      let cost = COST.paramRow + (paramDef?.isQualitative ? COST.qualOffset : 0) + (isNewGroup ? COST.groupHeader : 0) + (idx === 0 ? COST.testHeader : 0) + (idx === rows.length - 1 && summary ? COST.summary : 0);
      if (row.parameterName && row.parameterName.length > 26) cost += 0.8;
      totalCost += cost;
      tempPrevGroup = row.groupName;
    });
    flatTests.push({ testName, rows, summary, totalCost });
  });

  const pages = [];
  let currentPage = { segments: [] };
  let pageUsed = 0;
  let currentSegment = null;
  let prevGroupName = null;

  const finaliseSegment = () => {
    if (currentSegment) {
      currentPage.segments.push(currentSegment);
      currentSegment = null;
    }
  };

  const newPage = () => {
    finaliseSegment();
    pages.push(currentPage);
    currentPage = { segments: [] };
    pageUsed = 0;
    prevGroupName = null;
  };

  flatTests.forEach(test => {
    const { testName, rows, summary, totalCost } = test;

    if (totalCost <= PAGE_CAPACITY && pageUsed + totalCost > PAGE_CAPACITY && pageUsed > 0) {
      newPage();
    }

    rows.forEach((row, idx) => {
      const isNewGroup = row.groupName && row.groupName !== prevGroupName;
      const paramDef = row.test?.parameters?.find(p => p.parameterName === row.parameterName);
      let cost = COST.paramRow + (paramDef?.isQualitative ? COST.qualOffset : 0) + (isNewGroup ? COST.groupHeader : 0);

      if (!currentSegment) cost += COST.testHeader;
      if (idx === rows.length - 1 && summary) cost += COST.summary;
      if (row.parameterName && row.parameterName.length > 26) cost += 0.8;

      if (pageUsed + cost > PAGE_CAPACITY && pageUsed > 0) {
        newPage();
        cost = COST.testHeader + COST.paramRow + (paramDef?.isQualitative ? COST.qualOffset : 0) + (idx === rows.length - 1 && summary ? COST.summary : 0);
        if (row.parameterName && row.parameterName.length > 26) cost += 0.8;
      }

      if (!currentSegment) {
        currentSegment = {
          testName,
          summary,
          rows: [],
          isFirstOnPage: currentPage.segments.length === 0,
        };
        prevGroupName = null;
      }

      currentSegment.rows.push(row);
      pageUsed += cost;
      prevGroupName = row.groupName;
    });
    finaliseSegment();
  });

  if (pageUsed + COST.endOfReport > PAGE_CAPACITY) newPage();
  pages.push(currentPage);

  const totalPages = pages.length;

  const renderLogo = () => svgString;

  const renderPatientHeader = (pageNum) => `
    <div style="margin-bottom: 15px; margin-top: 5px; position: relative; z-index: 10; display: flex; gap: 8px;">
      <div style="border: 1px solid #000; padding: 8px; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #000; flex: 1; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <div>PATIENT'S NAME:- <span style="font-weight: 900; font-size: 14px;">${patient.fullName || patient.name || ''}</span></div>
          <div>AGE/SEX:- ${patient.age || '--'} ${patient.ageType || 'Years'}/${patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'O'}</div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <div>REFER BY DOCTOR:- DR. ${doctor.name ? doctor.name.toUpperCase() : 'SELF'}</div>
          <div>DATE:- ${formatDate(report.reportDate || report.createdAt)}</div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div>TYPE OF SAMPLE:- ${results[0]?.test?.sampleType?.toUpperCase() || 'BLOOD'}</div>
          <div>REPORT NO:- ${report.reportNumber} &nbsp; | &nbsp; PAGE ${String(pageNum).padStart(2, '0')} OF ${String(totalPages).padStart(2, '0')}</div>
        </div>
      </div>
      <div style="border: 1px solid #000; padding: 4px; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrValue)}" style="width: 66px; height: 66px; display: block;" alt="QR" />
      </div>
    </div>
  `;

  const renderTestTable = (testName, rows, showHeader, summary) => {
    const isMantoux = testName.toUpperCase().includes('MANTOUX') || (rows[0] && rows[0].test?.testCode === 'MANTOUX-01');
    const isMalaria = testName.toUpperCase().includes('MALARIA MICRO') || (rows[0] && rows[0].test?.testCode === 'MP-MICRO');

    if (isMantoux) {
      const doseRow = rows.find(r => r.parameterName.includes('Dose')) || rows[0];
      const indurationRow = rows.find(r => r.parameterName.includes('Induration')) || rows[1];
      const resultRow = rows.find(r => r.parameterName.includes('Result')) || rows[2];

      return `
        <div style="font-family: Georgia, serif; color: #000; margin-bottom: 15px; width: 100%;">
          <div style="text-align: center; margin-bottom: 16px; margin-top: 8px;">
            <h3 style="font-size: 17px; font-weight: 900; text-decoration: underline; text-transform: uppercase; margin: 0; letter-spacing: 0.05em;">${testName}</h3>
            <p style="font-size: 13px; font-weight: bold; margin: 4px 0 0 0; color: #374151;">(Interdermal Skin Test)</p>
          </div>
          <div style="border: 1px solid #000; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <tbody>
                <tr style="border-b: 1px solid #000;">
                  <td style="width: 50%; padding: 10px; font-weight: bold; border-right: 1px solid #000;">Tuberculin Dose</td>
                  <td style="width: 50%; padding: 10px; font-weight: bold;">${doseRow?.resultValue || '0.1 mL of TU PPD'}</td>
                </tr>
                <tr style="border-b: 1px solid #000;">
                  <td style="width: 50%; padding: 10px; font-weight: bold; border-right: 1px solid #000;">Induration (mm)</td>
                  <td style="width: 50%; padding: 10px; font-weight: bold;">${indurationRow?.resultValue || '—'}</td>
                </tr>
                <tr>
                  <td style="width: 50%; padding: 10px; font-weight: bold; border-right: 1px solid #000;">Result after 48 hours</td>
                  <td style="width: 50%; padding: 10px; font-weight: 900; font-size: 15px;">${resultRow?.resultValue || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="margin-bottom: 16px; font-size: 13.5px; line-height: 1.5; text-align: justify;">
            <p style="font-weight: bold; margin: 0 0 4px 0;">Interpretation:</p>
            <p style="margin: 0; color: #111827;">
              Induration measuring 10 mm more is considered positive which shows hypersensitivity to <span style="font-style: italic; text-decoration: underline;">tuberculoprotein</span>. It indicates past or present infection with <span style="font-style: italic; text-decoration: underline;">Mycobacterium</span> tuberculosis.
            </p>
          </div>
          <div style="border: 1px solid #000; font-size: 11px; margin-bottom: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 1px solid #000; font-weight: bold;">
                  <th style="padding: 8px; border-right: 1px solid #000; width: 33%;">Induration Size</th>
                  <th style="padding: 8px; width: 67%;">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding: 8px; border-right: 1px solid #000; font-weight: 600;">&lt; 5 mm</td>
                  <td style="padding: 8px;">A negative result, indicating no exposure to TB</td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding: 8px; border-right: 1px solid #000; font-weight: 600;">5–9 mm</td>
                  <td style="padding: 8px;">Usually considered positive for people who are immunocompromised or have other risk factors for TB</td>
                </tr>
                <tr style="border-bottom: 1px solid #000;">
                  <td style="padding: 8px; border-right: 1px solid #000; font-weight: 600;">10–14 mm</td>
                  <td style="padding: 8px;">Usually considered positive for people with medical risk factors for TB, recent immigrants from areas with high TB prevalence, or close contacts with people with TB</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-right: 1px solid #000; font-weight: 600;">&gt; 15 mm</td>
                  <td style="padding: 8px;">Usually considered positive for people with no known risk factors for TB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (isMalaria) {
      const resultValue = rows[0]?.resultValue || 'NOT-SEEN';
      return `
        <div style="font-family: Georgia, serif; color: #000; margin-bottom: 24px; width: 100%;">
          <h3 style="font-size: 17px; font-weight: 900; text-decoration: underline; text-transform: uppercase; text-align: center; margin-bottom: 32px;">IMMUNOLOGY & SEROLOGY TEST</h3>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
              <div style="font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 0.03em;">MALARIA PARASITE IDENTIFICATION</div>
              <div style="font-size: 12px; font-weight: bold; margin-top: 2px; width: 100%; text-align: center; max-width: 280px;">(MICROSCOPY)</div>
            </div>
            <div style="font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; padding-left: 32px;">${resultValue}</div>
          </div>
          <div style="margin-top: 24px; font-size: 13px; line-height: 1.5;">
            <p style="font-weight: bold; margin-bottom: 8px;">NOTE:</p>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div>➤ A Single negative smear does not rule out malaria</div>
              <div>➤ Test conducted on whole blood.</div>
            </div>
          </div>
        </div>
      `;
    }

    const overallIdx = rows.findIndex(r => r.groupName === `__OVERALL__${testName}`);
    const overallResult = overallIdx !== -1 ? rows[overallIdx] : null;
    const filteredRows = overallResult ? rows.filter((_, i) => i !== overallIdx) : rows;

    const firstParam = filteredRows[0]?.test?.parameters?.find(p => p.parameterName === filteredRows[0]?.parameterName);
    const isTiterTest = firstParam?.isQualitative && firstParam?.titerValues;
    const titerList = isTiterTest ? firstParam.titerValues.split(',') : [];

    let tableHeaderHTML = '';
    if (showHeader) {
      tableHeaderHTML = `
        <div style="border: 1px solid #000; border-radius: 20px; padding: 6px 16px; margin-bottom: 8px; display: flex; font-size: 13px; font-weight: bold; color: #000; align-items: center; box-sizing: border-box;">
          <div style="${isTiterTest ? 'width: 25%;' : 'width: 45%;'}">Investigations</div>
          ${isTiterTest ? titerList.map(t => `<div style="flex: 1; text-align: center; font-size: 11px;">${t.trim()}</div>`).join('') : ''}
          ${isTiterTest ? `
            <div style="width: 10%; text-align: center; font-size: 10px;">Unit</div>
            <div style="width: 20%; text-align: center; font-size: 10px;">Range</div>
          ` : `
            <div style="width: 12%; text-align: center;">Results</div>
            <div style="width: 8%; text-align: center;">Flag</div>
            <div style="width: 12%; text-align: center;">Units</div>
            <div style="width: 23%; text-align: center;">Normal values</div>
          `}
        </div>
      `;
    }

    return `
      <div style="position: relative; z-index: 10; margin-bottom: 12px; width: 100%;">
        ${tableHeaderHTML}
        <div style="padding: 0 8px;">
          <div style="font-weight: 900; font-size: 15px; text-decoration: underline; text-transform: uppercase; tracking-wider: 0.05em; color: #000; margin-bottom: 8px;">
            ${testName}
          </div>
          <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13.5px; color: #000;">
            <tbody>
              ${filteredRows.map((res, idx, arr) => {
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

                let groupRow = '';
                if (showGroup) {
                  groupRow = `
                    <tr>
                      <td colspan="${titerResults.length > 0 ? 3 + titerResults.length : 5}" style="padding-top: 10px; padding-bottom: 6px; font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: 14px; color: #000;">
                        ${res.groupName}
                      </td>
                    </tr>
                  `;
                }

                let valueHTML = '';
                if (titerResults.length > 0) {
                  const cellWidth = 45 / (titerList.length || 1);
                  const cells = (titerVals ? titerVals.split(',') : []).map(titer => {
                    const tr = titerResults.find(r => r.titer.trim() === titer.trim());
                    const val = tr ? tr.value : '--';
                    const color = val === '+' ? '#15803d' : val === '-' ? '#dc2626' : '#d1d5db';
                    return `<td style="padding: 5px 0; text-align: center; font-weight: bold; font-size: 13px; color: ${color}; width: ${cellWidth}%;">${val || '—'}</td>`;
                  }).join('');

                  valueHTML = `
                    <tr>
                      <td style="padding: 5px 0; font-weight: 600; text-transform: uppercase; width: 25%; vertical-align: top;">
                        ${res.parameterName}
                      </td>
                      ${cells}
                      <td style="padding: 5px 0; text-align: center; font-weight: 500; color: #000; width: 10%; vertical-align: top; font-size: 12px;">
                        ${res.unit || ''}
                      </td>
                      <td style="padding: 5px 0; text-align: center; font-weight: 500; color: #000; width: 20%; vertical-align: top; font-size: 12px; white-space: nowrap; line-height: 1.2;">
                        ${res.referenceRange || ''}
                      </td>
                    </tr>
                  `;
                } else {
                  const displayValue = res.resultValue === '+' ? 'POSITIVE' : res.resultValue === '-' ? 'NEGATIVE' : res.resultValue;
                  const isQualValColor = isQual && (displayValue?.startsWith('POSITIVE') ? 'color: #15803d;' : displayValue?.startsWith('NEGATIVE') ? 'color: #dc2626;' : '');

                  valueHTML = `
                    <tr>
                      <td style="padding: 5px 0; font-weight: 600; text-transform: uppercase; width: 45%; vertical-align: top;">
                        ${res.parameterName}
                      </td>
                      <td colspan="${isQual ? 4 : 1}" style="padding: 5px 0; ${isQual ? 'text-align: left; padding-left: 16px;' : 'text-align: center;'} vertical-align: top; width: ${isQual ? '55%' : '12%'};">
                        <span style="${isQual ? 'font-weight: 900; font-size: 15px;' + isQualValColor : isAbnormal ? 'font-weight: 900; border-bottom: 1.5px solid #000; padding-bottom: 2px;' : 'font-weight: bold;'}">
                          ${displayValue || ''}
                        </span>
                      </td>
                      ${!isQual ? `
                        <td style="padding: 5px 0; text-align: center; font-weight: 500; font-size: 13.5px; width: 8%; vertical-align: top; color: #000;">
                          ${isHigh ? 'High' : isLow ? 'Low' : ''}
                        </td>
                        <td style="padding: 5px 0; text-align: center; font-weight: 500; width: 12%; vertical-align: top; color: #000;">${res.unit || ''}</td>
                        <td style="padding: 5px 0; text-align: center; font-weight: 500; width: 23%; vertical-align: top; font-size: 12px; line-height: 1.2; word-break: break-all; color: #000;">
                          ${res.referenceRange || ''}
                        </td>
                      ` : ''}
                    </tr>
                  `;
                }

                return groupRow + valueHTML;
              }).join('')}
            </tbody>
          </table>
          ${overallResult ? `
            <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #000; border-top: 1px solid #000; padding-top: 8px;">
              <span>Result:</span>
              <span>${overallResult.resultValue || ''}</span>
            </div>
          ` : ''}
          ${summary ? `
            <div style="margin-top: 16px; padding: 12px; border: 1px solid #d1d5db; border-radius: 4px; background: #f9fafb; font-size: 12px; color: #000; line-height: 1.4; white-space: pre-wrap;">
              <span style="font-weight: bold; text-decoration: underline; margin-right: 4px;">Note:</span>
              ${summary}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const pagesHTML = pages.map((pageData, pageIndex) => {
    const isLastPage = pageIndex === pages.length - 1;
    return `
      <div class="report-page">
        <!-- Watermark (Screen & PDF share only) -->
        <div class="watermark-container">
          <div style="display: flex; flex-direction: column; items-center: true; justify-content: center; width: 300px; height: 300px;">
            ${svgString}
          </div>
          <div style="font-size: 52px; font-weight: 900; letter-spacing: 0.15em; margin-top: 16px; color: #000;">SANA PATHOLOGY LAB</div>
        </div>

        ${includeLetterhead ? `
          <!-- Header Swoosh Decorator -->
          <svg class="diagonal-swoosh" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path d="M40,0 C100,50 150,80 200,100 L200,0 Z" fill="#e03a3c" opacity="0.7"/>
            <path d="M90,0 C140,40 170,70 200,80 L200,0 Z" fill="#7a28cb" opacity="0.6"/>
            <path d="M140,0 C170,20 185,40 200,60 L200,0 Z" fill="#00488d" opacity="0.5"/>
          </svg>

          <!-- Dynamic HTML Letterhead Header -->
          <div style="position: relative; z-index: 10; display: flex; align-items: flex-end; padding: 20px 12px 2px 12px; width: 100%; box-sizing: border-box;">
            <div style="display: flex; flex-direction: column; align-items: center; width: 100px; flex-shrink: 0; margin-right: 16px; position: relative; top: 5px;">
              <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                ${renderLogo()}
              </div>
              <div style="font-size: 10px; font-weight: bold; color: #000; letter-spacing: 0.05em; margin-top: 4px; font-family: Arial, sans-serif; white-space: nowrap;">
                SANA PATHOLOGY LAB
              </div>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
              <div style="width: 100%; color: #1a2f4c; text-transform: uppercase; font-family: 'Arial Black', Impact, sans-serif; font-size: 42px; font-weight: 900; line-height: 0.85; letter-spacing: -0.02em; white-space: nowrap; margin-left: -20px; transform: scaleY(1.05); transform-origin: bottom;">
                ${lab.labName || 'SANA PATHOLOGY LAB'}
              </div>
              <div style="display: flex; align-items: flex-end; justify-content: space-between; width: 100%; padding-bottom: 4px;">
                <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0; font-family: 'Times New Roman', Times, serif;">
                  <div style="font-size: 19px; font-weight: bold; line-height: 1.0; color: #000; white-space: nowrap;">Mohd. Altamash</div>
                  <div style="font-size: 12px; font-weight: bold; line-height: 1.2; color: #000; margin-top: 4px; font-family: Arial, sans-serif;">D.M.L.T.</div>
                  <div style="font-size: 12px; font-weight: bold; line-height: 1.2; color: #000; font-family: Arial, sans-serif;">Technician</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1; padding: 0 8px; font-family: 'Times New Roman', Times, serif;">
                  <div style="font-size: 18px; font-weight: bold; line-height: 1.0; color: #000; letter-spacing: 0.02em; white-space: nowrap;">Fully Computerized Lab</div>
                  <div style="background: #1e2a8a; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 12px; border-radius: 3px; display: inline-block; margin-top: 6px; font-family: Arial, sans-serif; letter-spacing: 0.03em; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                    Emergency 24 Hours Service
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0; color: #000; margin-bottom: 4px; font-family: Arial, sans-serif;">
                  <div style="font-size: 13px; font-weight: bold; line-height: 1.3; white-space: nowrap;">M.:6396786939</div>
                  <div style="font-size: 13px; font-weight: bold; line-height: 1.3; white-space: nowrap;">M.:6397240575</div>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 8px; border-bottom: 3px solid #000; width: 100%;"></div>
          <div style="margin-top: 2px; border-bottom: 1px solid #000; margin-bottom: 10px; width: 100%;"></div>
        ` : ''}

        <!-- Report Main Area -->
        <div style="flex-grow: 1; display: flex; flex-direction: column; position: relative; z-index: 10; padding: 0 8px; padding-bottom: 45mm; box-sizing: border-box;">
          ${renderPatientHeader(pageIndex + 1)}
          
          <div style="flex-grow: 1; margin-top: 8px;">
            ${pageData.segments.map((seg, idx) => {
              // Determine if this is the absolute last set of rows for this test across all pages
              // by checking if any later page has a segment for the same testName
              const isLastSegmentForTest = !pages.slice(pageIndex + 1).some(
                p => p.segments && p.segments.some(s => s.testName === seg.testName)
              );
              const showSummary = isLastSegmentForTest ? seg.summary : '';
              const isTiterSeg = (s) => s?.rows?.[0]?.test?.parameters?.some(p => p.isQualitative && p.titerValues);
              const prevSeg = idx > 0 ? pageData.segments[idx - 1] : null;
              const showHeader = idx === 0 || isTiterSeg(seg) !== isTiterSeg(prevSeg);
              return `
                <div style="margin-top: ${idx > 0 ? '16px' : '0'};">
                  ${renderTestTable(seg.testName, seg.rows, showHeader, showSummary)}
                </div>
              `;
            }).join('')}

            <!-- End of Report - Only on last page -->
            ${isLastPage ? `
              <div style="margin-top: 32px; margin-bottom: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                <div style="display: flex; align-items: center; width: 75%; margin: 0 auto;">
                  <div style="flex: 1; border-top: 1px solid #d1d5db;"></div>
                  <div style="margin: 0 16px; font-size: 12px; font-weight: bold; letter-spacing: 0.2em; color: #1a2f4c; text-transform: uppercase; font-family: sans-serif;">End of Report</div>
                  <div style="flex: 1; border-top: 1px solid #d1d5db;"></div>
                </div>
                <div style="font-size: 10px; color: #9ca3af; margin-top: 8px; letter-spacing: 0.3em; font-weight: 600;">***</div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Dynamic HTML Letterhead Footer -->
        <footer style="position: absolute; bottom: 30mm; left: 0; width: 100%; padding-left: 14mm; padding-right: 14mm; box-sizing: border-box; display: flex; flex-direction: column; z-index: 20;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 48px; margin-bottom: 12px; width: 100%; box-sizing: border-box;">
            <div></div>
            <div style="text-align: right;">
              <div style="font-style: italic; font-weight: bold; font-size: 14px; margin-bottom: 4px; margin-right: 24px; color: #000;">Thanks for Reference</div>
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; font-size: 13px; font-weight: bold; font-style: italic; color: #000;">
                <span>Checked by</span>
                <div style="display: flex; flex-direction: column; align-items: center; margin-left: 8px;">
                  <img src="https://sanapathologylab.github.io/sana-pathology-lab/Signature.png" style="height: 40px; width: auto; object-fit: contain;" alt="Signature" onerror="this.style.display='none';" />
                  <div style="width: 120px; border-bottom: 1px solid #000; margin-top: 4px;"></div>
                </div>
              </div>
            </div>
          </div>
          ${includeLetterhead ? `
            <div style="border-top: 1.5px solid #d82c2a; border-bottom: 1.5px solid #d82c2a; width: 100%;">
              <div style="text-align: center; color: #d82c2a; font-weight: bold; font-size: 14px; padding: 6px 0; font-family: sans-serif; letter-spacing: 0.05em;">
                Add. : Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal–244303 (U.P)
              </div>
            </div>
            <div style="text-align: center; color: #000; font-weight: bold; font-size: 12px; padding-top: 6px; padding-bottom: 15px; font-family: sans-serif;">
              This Report is not Valid for medico legal Purpose.
            </div>
          ` : ''}
        </footer>
      </div>
    `;
  }).join('');


  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Report - ${report.reportNumber}</title>
      <meta name="viewport" content="width=794, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          background: #e8edf4; 
          font-family: Arial, sans-serif;
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }

        .report-wrapper {
          background: #e8edf4;
          min-height: 100vh;
          padding: 20px 16px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .report-page {
          background-color: white;
          width: 210mm;
          height: 297mm; /* Strict A4 Height */
          margin: 0 auto 24px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.15);
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden; /* Prevent breaking the A4 boundary */
          padding-left: 14mm;
          padding-right: 14mm;
          padding-top: ${includeLetterhead ? '0mm' : '48mm'};
          padding-bottom: ${includeLetterhead ? '0mm' : '25mm'};
        }

        /* Diagonal Swoosh Decorator */
        .diagonal-swoosh {
          position: absolute;
          top: 0;
          right: 0;
          width: 240px;
          height: 90px;
          z-index: 0;
          opacity: 0.8;
        }

        /* Watermark Background (Screen/PDF share only) */
        .watermark-container {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0.03;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        @media print {
          @page { 
            margin: 0; 
            size: A4 portrait; 
          }

          body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }

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

          .watermark-container {
            display: none !important;
          }

          tr { 
            break-inside: avoid; 
            page-break-inside: avoid; 
          }
          
          thead { 
            display: table-header-group; 
          }
        }
      </style>
    </head>
    <body>
      <div class="report-wrapper">
        ${pagesHTML}
      </div>
    </body>
    </html>
  `;
};
