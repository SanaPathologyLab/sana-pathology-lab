import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import {
  Users, Clock, CheckCircle2, Award, Calendar, Stethoscope,
  Phone, ChevronRight, ArrowUpRight, FileText, Search
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingReports: 0,
    completedReports: 0,
    totalCommission: 0,
    commissionRate: 0
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        fetch('/api/dashboard/stats', { headers }),
        fetch('/api/reports', { headers })
      ]);

      if (statsRes.ok && reportsRes.ok) {
        const statsData = await statsRes.json();
        const reportsData = await reportsRes.json();
        setStats(statsData);
        setReports(Array.isArray(reportsData) ? reportsData : []);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Compute 6 months referral trend data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const referralCounts = Array(12).fill(0);
  reports.forEach(r => {
    const monthIdx = new Date(r.reportDate).getMonth();
    referralCounts[monthIdx]++;
  });

  const currentMonthIndex = new Date().getMonth();
  const chartMonths = [];
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonthIndex - i + 12) % 12;
    chartMonths.push(monthNames[idx]);
    chartData.push(referralCounts[idx]);
  }

  const referralsChartData = {
    labels: chartMonths,
    datasets: [{
      label: 'Patients Referred',
      data: chartData,
      backgroundColor: '#1D9E75', // Brand green/teal
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    },
  };

  // Filter reports
  const filteredReports = reports.filter(r => 
    r.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reportNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient?.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1D9E75]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#1D9E75] to-[#128362] text-white rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative">
          <span className="bg-[#ffb800] text-gray-900 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            Doctor Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">Welcome back, Dr. {user?.name}!</h2>
          <p className="text-teal-100 text-sm max-w-xl">
            Track patient referrals, view verified diagnostics reports, and monitor estimated commission details from this secure portal.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-800">{stats.totalPatients}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Total Referrals</p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl text-primary"><Users className="w-5 h-5" /></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-800">{stats.pendingReports}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Pending Reports</p>
          </div>
          <div className="bg-amber-50/50 p-3.5 rounded-xl text-amber-600"><Clock className="w-5 h-5" /></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-800">{stats.completedReports}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Completed Reports</p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-slate-800">₹{(stats.totalCommission || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Total Commissions</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Commission Rate: {stats.commissionRate}%</p>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl text-[#F39C12]"><Award className="w-5 h-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Referrals Volume (Last 6 Months)</h3>
          <div className="h-64">
            <Bar data={referralsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Support & Policy info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Referral Guidelines</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Discounts requested directly by the doctor are adjusted against the net commission payouts. For urgent sample collections or critical report verification, contact our senior pathologist immediately.
            </p>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-xs text-primary font-semibold">
              <p className="font-extrabold flex items-center gap-1.5 mb-1 text-primary-light uppercase">
                <Stethoscope className="w-4 h-4" /> Commission Terms
              </p>
              Your active referral commission is set to <strong className="text-slate-800">{stats.commissionRate}%</strong>.
            </div>
          </div>
          <a
            href="https://wa.me/916396786939?text=Hi%20Sana%20Pathology%2C%20I%20am%20inquiring%20about%20a%20referred%20patient%20report"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-sm border border-emerald-200/50 transition-all text-center"
          >
            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> WhatsApp Lab Desk</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Referred Patients List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Referred Patients & Reports</h3>
            <p className="text-xs text-slate-400 mt-1">Review verified results or download PDF reports</p>
          </div>
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search patients or report ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1D9E75] transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length > 0 ? filteredReports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{r.patient?.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{r.patient?.patientId} · {r.patient?.gender} · {r.patient?.age} Yrs</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{r.reportNumber}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(r.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'COMPLETED' ? (
                      <a
                        href={`#/print/${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#E7F3F0] hover:bg-[#D1E7E2] text-primary px-3.5 py-2 rounded-lg font-bold text-xs transition-colors"
                      >
                        <span>View/Print</span>
                        <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-bold italic">Awaiting lab results</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold">No referred patient reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
