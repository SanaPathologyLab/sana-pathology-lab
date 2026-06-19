import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import Loader from '../components/Loader';
import Layout from '../components/Layout';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Printer, Download, TrendingUp, DollarSign, Users, Award } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DoctorAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedChartDoc, setSelectedChartDoc] = useState('ALL');

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
      data.sort((a, b) => b.totalSamples - a.totalSamples);
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculations for Summary Stats
  const totals = analytics.reduce((acc, doc) => {
    let docRev = 0;
    let docComm = 0;

    doc.reports?.forEach(r => {
      const totalAmt = r.totalAmount || 0;
      const discountAmt = r.discountAmount || 0;
      const netAmt = r.reportAmount || 0;
      const discountBy = r.discountBy || '-';
      const commRate = doc.commissionRate || 0;

      const grossComm = (totalAmt * commRate) / 100;
      const drBorneDisc = discountBy === 'DOCTOR' ? discountAmt : 0;
      const netComm = Math.max(0, grossComm - drBorneDisc);

      docRev += netAmt;
      docComm += netComm;
    });

    acc.samples += doc.totalSamples;
    acc.revenue += docRev;
    acc.commission += docComm;
    return acc;
  }, { samples: 0, revenue: 0, commission: 0 });

  const topReferrer = analytics.length > 0 && analytics[0].totalSamples > 0 ? analytics[0] : null;

  // Chart daily trend calculations
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  const getDailyTrendData = () => {
    const dailyCounts = Array(daysInMonth).fill(0);
    
    const targetDocs = selectedChartDoc === 'ALL' 
      ? analytics 
      : analytics.filter(d => d.doctorId === selectedChartDoc);

    targetDocs.forEach(doc => {
      doc.reports?.forEach(r => {
        if (r.reportDate) {
          const day = new Date(r.reportDate).getDate();
          if (day >= 1 && day <= daysInMonth) {
            dailyCounts[day - 1]++;
          }
        }
      });
    });

    return dailyCounts;
  };

  const trendChartData = {
    labels: dailyLabels,
    datasets: [{
      label: 'Daily Referrals Count',
      data: getDailyTrendData(),
      borderColor: '#1D9E75',
      backgroundColor: 'rgba(29, 158, 117, 0.1)',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#1D9E75',
      pointRadius: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  const handlePrint = () => {
    window.print();
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
        const netAmt       = report.reportAmount   || 0;
        const discountBy   = report.discountBy     || '-';
        const commRate     = doc.commissionRate    || 0;
        const discountPct  = totalAmt > 0 ? ((discountAmt / totalAmt) * 100).toFixed(2) : 0;
        const grossComm    = (totalAmt * commRate) / 100;
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
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({ wch: Math.max(key.length, 14) }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctor Analytics');

    const monthName = months.find(m => m.value === month)?.label;
    const filename = `Doctor_Referrals_${monthName}_${year}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  return (
    <Layout>
      <style>{`
        @media print {
          .no-print, header, nav, footer, aside, button, .sidebar, .utility-bar {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="p-6 print-container">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-[#00488d] uppercase tracking-wide">Doctor Referrals Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monthly overview of medical practitioners, sample metrics, and payout commissions.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 no-print">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold">
              <select 
                className="bg-transparent outline-none cursor-pointer text-slate-700"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <span className="text-slate-300">|</span>
              <select 
                className="bg-transparent outline-none cursor-pointer text-slate-700"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#00488d] hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl shadow-sm font-bold text-sm transition-all"
            >
              <Printer className="w-4 h-4" /> Print Summary
            </button>

            <button 
              onClick={exportToExcel}
              disabled={analytics.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl shadow-sm font-bold text-sm transition-all"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100 no-print">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">{totals.samples}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide mt-1">Referred Samples</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">₹{Math.round(totals.revenue).toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide mt-1">Generated Revenue</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-[#F39C12]">₹{Math.round(totals.commission).toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide mt-1">Est. Payout Commission</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-black text-slate-800 truncate">
              {topReferrer ? `Dr. ${topReferrer.name}` : 'N/A'}
            </p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide mt-1.5">Top Referring Doctor</p>
          </div>
        </div>

        {/* Line Charts Block */}
        {analytics.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Daily Referrals Trend ({months.find(m => m.value === month)?.label})
              </h3>
              <select
                value={selectedChartDoc}
                onChange={e => setSelectedChartDoc(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-[#00488d]"
              >
                <option value="ALL">All Doctors Combined</option>
                {analytics.filter(d => d.totalSamples > 0).map(d => (
                  <option key={d.id} value={d.doctorId}>Dr. {d.name}</option>
                ))}
              </select>
            </div>
            <div className="h-60">
              <Line data={trendChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Doctor Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-black">
                <tr>
                  <th className="px-6 py-4">Doctor Info</th>
                  <th className="px-6 py-4 text-center">Total Samples</th>
                  <th className="px-6 py-4 text-right">Gross Revenue (₹)</th>
                  <th className="px-6 py-4 text-right">Commission Rate</th>
                  <th className="px-6 py-4 text-right text-amber-700 font-bold">Payout Commission (₹)</th>
                  <th className="px-6 py-4 text-center no-print">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col justify-center items-center gap-3">
                        <Loader size="sm" />
                        Loading analytics data...
                      </div>
                    </td>
                  </tr>
                ) : analytics.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No doctor referrals found for this period.
                    </td>
                  </tr>
                ) : (
                  analytics.map((doc) => {
                    // Calculate totals per doctor
                    let doctorRevenue = 0;
                    let doctorCommission = 0;

                    doc.reports?.forEach(r => {
                      const totalAmt = r.totalAmount || 0;
                      const discountAmt = r.discountAmount || 0;
                      const netAmt = r.reportAmount || 0;
                      const discountBy = r.discountBy || '-';
                      const commRate = doc.commissionRate || 0;

                      const grossComm = (totalAmt * commRate) / 100;
                      const drBorneDisc = discountBy === 'DOCTOR' ? discountAmt : 0;
                      const netComm = Math.max(0, grossComm - drBorneDisc);

                      doctorRevenue += netAmt;
                      doctorCommission += netComm;
                    });

                    return (
                      <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-800">Dr. {doc.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{doc.clinicName} • {doc.doctorId}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-xs min-w-[2.5rem]">
                            {doc.totalSamples}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-700">
                          ₹{Math.round(doctorRevenue).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 font-semibold">
                          {doc.commissionRate}%
                        </td>
                        <td className="px-6 py-4 text-right font-black text-amber-600 bg-amber-50/10">
                          ₹{Math.round(doctorCommission).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center no-print">
                          {doc.totalSamples > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
