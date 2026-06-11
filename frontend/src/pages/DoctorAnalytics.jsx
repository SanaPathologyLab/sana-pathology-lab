import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import Loader from '../components/Loader';
import Layout from '../components/Layout';

const DoctorAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchAnalytics();
  }, [month, year]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/doctors/analytics/referrals?month=${month}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      // Sort by totalSamples descending
      data.sort((a, b) => b.totalSamples - a.totalSamples);
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (analytics.length === 0) return;

    const excelData = [];
    let sNo = 1;

    analytics.forEach((doc) => {
      if (!doc.reports || doc.reports.length === 0) {
        excelData.push({
          'S.No.': sNo++,
          'Doctor ID': doc.doctorId,
          'Doctor Name': `Dr. ${doc.name}`,
          'Clinic/Hospital': doc.clinicName,
          'Patient Name': '-',
          'Tests': '-',
          'Report Date': '-',
          'Total Amount (₹)': 0,
          'Discount (₹)': 0,
          'Discount (%)': 0,
          'Discount By': '-',
          'Net Amount (₹)': 0,
          'Commission Rate (%)': doc.commissionRate || 0,
          'Gross Commission (₹)': 0,
          'Discount Borne by Doctor (₹)': 0,
          'Net Commission (₹)': 0
        });
        return;
      }

      doc.reports.forEach((report) => {
        const totalAmt     = report.totalAmount   || 0;
        const discountAmt  = report.discountAmount || 0;
        const netAmt       = report.reportAmount   || 0;    // finalAmount after discount
        const discountBy   = report.discountBy     || '-';
        const commRate     = doc.commissionRate    || 0;
        const discountPct  = totalAmt > 0 ? ((discountAmt / totalAmt) * 100).toFixed(2) : 0;

        // Gross commission is on the original total (before discount)
        const grossComm    = (totalAmt * commRate) / 100;

        // If discount was given by doctor, their commission is reduced by the discount amount
        const drBorneDisc  = discountBy === 'DOCTOR' ? discountAmt : 0;
        const netComm      = Math.max(0, grossComm - drBorneDisc);

        excelData.push({
          'S.No.': sNo++,
          'Doctor ID': doc.doctorId,
          'Doctor Name': `Dr. ${doc.name}`,
          'Clinic/Hospital': doc.clinicName,
          'Patient Name': report.patientName,
          'Tests': report.tests,
          'Report Date': report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-IN') : '-',
          'Total Amount (₹)': totalAmt,
          'Discount (₹)': discountAmt,
          'Discount (%)': parseFloat(discountPct),
          'Discount By': discountBy === 'DOCTOR' ? 'Referral Doctor' : discountBy === 'LAB' ? 'Laboratory' : '-',
          'Net Amount (₹)': netAmt,
          'Commission Rate (%)': commRate,
          'Gross Commission (₹)': parseFloat(grossComm.toFixed(2)),
          'Discount Borne by Doctor (₹)': drBorneDisc,
          'Net Commission (₹)': parseFloat(netComm.toFixed(2))
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-width columns
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 14)
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctor Analytics');

    const monthName = months.find(m => m.value === month)?.label;
    const filename = `Doctor_Referrals_${monthName}_${year}.xlsx`;

    // If running inside React Native WebView, send base64 data to native bridge
    if (window.ReactNativeWebView) {
      const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'DOWNLOAD_EXCEL',
        base64,
        filename
      }));
    } else {
      // Normal browser behavior
      XLSX.writeFile(workbook, filename);
    }
  };

  return (
    <Layout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Referrals Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track monthly samples and export to Excel</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <select 
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span className="text-gray-300">|</span>
            <select 
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={exportToExcel}
            disabled={analytics.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Doctor Info</th>
                <th className="px-6 py-4 font-bold text-center">Total Samples</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col justify-center items-center gap-3">
                      <Loader size="sm" />
                      Loading analytics data...
                    </div>
                  </td>
                </tr>
              ) : analytics.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    No doctor referrals found for this month.
                  </td>
                </tr>
              ) : (
                analytics.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">Dr. {doc.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{doc.clinicName} • {doc.doctorId}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-sm min-w-[3rem]">
                        {doc.totalSamples}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {doc.totalSamples > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-gray-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Layout>
  );
};

export default DoctorAnalytics;
