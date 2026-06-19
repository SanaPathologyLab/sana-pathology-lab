const PDFDocument = require('pdfkit');

/**
 * Generates a styled laboratory report PDF using pdfkit.
 * Returns a Promise that resolves to a Buffer.
 */
const generateReportPDF = (report) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const patient = report.patient || {};
      const doctor = report.doctor || { name: 'Self' };
      const results = report.results || [];

      // Group results by test name
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

      // ─── Header ───
      doc.fillColor('#063b30').fontSize(24).font('Helvetica-Bold').text('SANA PATHOLOGY LAB', 40, 45);
      doc.fontSize(10).fillColor('#666666').font('Helvetica').text('Fully Computerized Lab | Emergency 24 Hours Service', 40, 75);
      doc.fontSize(10).fillColor('#333333').font('Helvetica-Bold').text('Phone: 6396786939, 6397240575', 380, 50, { align: 'right', width: 175 });
      doc.fontSize(9).fillColor('#666666').font('Helvetica').text('Datawali Road, Sambhal, U.P.', 380, 65, { align: 'right', width: 175 });

      // Separator Line
      doc.moveTo(40, 95).lineTo(555, 95).strokeColor('#063b30').lineWidth(2).stroke();
      doc.moveTo(40, 99).lineTo(555, 99).strokeColor('#BA7517').lineWidth(1).stroke();

      // ─── Patient Meta Information ───
      doc.rect(40, 110, 515, 75).fillColor('#f8fafc').fillAndStroke('#e2e8f0', '#cbd5e1');
      doc.fillColor('#333333');
      
      // Patient Info columns
      doc.fontSize(9).font('Helvetica-Bold').text('PATIENT NAME:', 55, 122);
      doc.font('Helvetica').text(patient.fullName || 'N/A', 150, 122);

      doc.font('Helvetica-Bold').text('AGE / GENDER:', 55, 137);
      doc.font('Helvetica').text(`${patient.age || 'N/A'} ${patient.ageType || 'Years'} / ${patient.gender || 'N/A'}`, 150, 137);

      doc.font('Helvetica-Bold').text('REFERRING DR:', 55, 152);
      doc.font('Helvetica').text(doctor.name ? `Dr. ${doctor.name}` : 'Self Referral', 150, 152);

      // Right Column Info
      doc.font('Helvetica-Bold').text('REPORT NO:', 350, 122);
      doc.font('Helvetica-Bold').fillColor('#063b30').text(report.reportNumber || 'N/A', 440, 122);
      
      doc.fillColor('#333333');
      doc.font('Helvetica-Bold').text('REPORT DATE:', 350, 137);
      const repDate = report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
      doc.font('Helvetica').text(repDate, 440, 137);

      doc.font('Helvetica-Bold').text('SAMPLE TYPE:', 350, 152);
      const sampleType = results[0]?.test?.sampleType || 'Blood';
      doc.font('Helvetica').text(sampleType, 440, 152);

      // ─── Test Results ───
      let currentY = 205;

      Object.entries(groupedTests).forEach(([testName, data]) => {
        // Check page overflow
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        // Test Header Block
        doc.rect(40, currentY, 515, 20).fillColor('#085041');
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(testName.toUpperCase(), 50, currentY + 5);
        currentY += 25;

        // Table Header
        doc.fillColor('#475569').fontSize(8.5).font('Helvetica-Bold');
        doc.text('Investigation', 50, currentY);
        doc.text('Observed Value', 240, currentY, { width: 80, align: 'right' });
        doc.text('Indicator', 340, currentY, { width: 50, align: 'center' });
        doc.text('Unit', 400, currentY);
        doc.text('Reference Interval', 450, currentY);

        currentY += 15;
        doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        currentY += 8;

        // Rows
        data.rows.forEach(r => {
          if (currentY > 740) {
            doc.addPage();
            currentY = 50;
          }

          const isAbnormal = r.flag === 'HIGH' || r.flag === 'LOW';
          doc.fillColor(isAbnormal ? '#dc2626' : '#1e293b');
          doc.fontSize(9).font(isAbnormal ? 'Helvetica-Bold' : 'Helvetica');
          
          doc.text(r.parameterName || '-', 50, currentY, { width: 180 });
          doc.text(r.resultValue || '-', 240, currentY, { width: 80, align: 'right' });
          
          // Indicator badge representation
          if (r.flag) {
            doc.text(r.flag, 340, currentY, { width: 50, align: 'center' });
          } else {
            doc.text('NORMAL', 340, currentY, { width: 50, align: 'center' });
          }

          doc.text(r.unit || '-', 400, currentY, { width: 45 });
          doc.text(r.referenceRange || '-', 450, currentY, { width: 100 });

          currentY += 18;
        });

        // Test Summary/Note if present
        if (data.summary) {
          if (currentY > 720) {
            doc.addPage();
            currentY = 50;
          }
          currentY += 5;
          doc.rect(45, currentY, 505, 35).fillColor('#f8fafc').fillAndStroke('#e2e8f0', '#e2e8f0');
          doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('Note:', 55, currentY + 5);
          doc.font('Helvetica').text(data.summary, 90, currentY + 5, { width: 450 });
          currentY += 45;
        } else {
          currentY += 10;
        }
      });

      // End of Report Marker
      if (currentY > 730) {
        doc.addPage();
        currentY = 50;
      }
      doc.moveTo(150, currentY + 15).lineTo(445, currentY + 15).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('*** END OF REPORT ***', 245, currentY + 10);
      currentY += 40;

      // ─── Footer Signatures ───
      // Add signatures at the bottom of the page (if space permits, otherwise next page)
      if (currentY > 730) {
        doc.addPage();
        currentY = 50;
      }
      
      const footerY = 740; // Pin to bottom of A4 page
      doc.moveTo(40, footerY - 55).lineTo(555, footerY - 55).strokeColor('#cbd5e1').lineWidth(0.5).stroke();

      // Signatures
      doc.fillColor('#1e293b').fontSize(9.5).font('Helvetica-Bold').text('Mohd. Altamash', 50, footerY - 45);
      doc.fontSize(8).font('Helvetica').text('D.M.L.T. | Lab Technician', 50, footerY - 32);

      doc.fontSize(9.5).font('Helvetica-Bold').text('Dr. Sana (M.D.)', 400, footerY - 45, { align: 'right', width: 150 });
      doc.fontSize(8).font('Helvetica').text('Chief Pathologist', 400, footerY - 32, { align: 'right', width: 150 });

      // Disclaimer
      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text('This Report is not Valid for medico legal Purpose. Add: Datawali Road, Near Aara Machine, Sambhal, U.P.', 40, footerY - 12, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateReportPDF };
