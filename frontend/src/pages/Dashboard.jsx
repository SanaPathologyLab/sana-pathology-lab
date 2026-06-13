import React, { useEffect, useState, useContext, useCallback } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, FileText, IndianRupee, Activity, TrendingUp, Clock, 
  UserCheck, AlertTriangle, HeartPulse, Stethoscope, User, 
  Calendar, PhoneCall, ChevronRight, CheckCircle2, Award,
  PlusCircle, Search, Zap, Bell, RefreshCw, FlaskConical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Loader from '../components/Loader';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const API = '/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // States
  const [stats, setStats] = useState({
    totalPatients: 0, todayPatients: 0, pendingReports: 0, completedReports: 0,
    totalRevenue: 0, todayRevenue: 0, monthRevenue: 0,
    topDoctors: [], lowStockCount: 0, totalCommission: 0, commissionRate: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [trends, setTrends] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState('');
  const [loading, setLoading] = useState(true);
  const [liveTime, setLiveTime] = useState(new Date());
  const [allReportsForActivity, setAllReportsForActivity] = useState([]);
  const [dueCheckups, setDueCheckups] = useState([]);

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const headers = { 'Authorization': `Bearer ${user.accessToken}` };
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Base stats are loaded for all roles
        const statsRes = await fetch(`${API}/dashboard/stats`, { headers });
        const statsData = await statsRes.json();
        setStats(statsData);

        if (user.userType === 'PATIENT') {
          // Patient specific loading
          const [reportsRes, profileRes, trendsRes, testsRes] = await Promise.all([
            fetch(`${API}/reports`, { headers }),
            fetch(`${API}/patients/${user.id}`, { headers }),
            fetch(`${API}/patients/${user.id}/trends`, { headers }),
            fetch(`${API}/tests`, { headers })
          ]);
          
          const reportsData = await reportsRes.json();
          const profileData = await profileRes.json();
          const trendsData = await trendsRes.json();
          const testsData = await testsRes.json();

          setAllReports(Array.isArray(reportsData) ? reportsData : []);
          setPatientProfile(profileData);
          setTrends(Array.isArray(trendsData) ? trendsData : []);
          setTests(Array.isArray(testsData) ? testsData : []);
          
          if (Array.isArray(trendsData) && trendsData.length > 0) {
            setSelectedTrend(trendsData[0].parameterName);
          }
        } 
        else if (user.userType === 'DOCTOR') {
          // Doctor specific loading
          const [reportsRes, testsRes] = await Promise.all([
            fetch(`${API}/reports`, { headers }),
            fetch(`${API}/tests`, { headers })
          ]);

          const reportsData = await reportsRes.json();
          const testsData = await testsRes.json();

          setAllReports(Array.isArray(reportsData) ? reportsData : []);
          setTests(Array.isArray(testsData) ? testsData : []);
        } 
        else {
          // Staff/Admin loading
          const [pRes, rRes, tRes] = await Promise.all([
            fetch(`${API}/patients`, { headers }),
            fetch(`${API}/reports`, { headers }),
            fetch(`${API}/tests`, { headers })
          ]);
          
          const patientsData = await pRes.json();
          const reportsData = await rRes.json();
          const testsData = await tRes.json();

          setRecentPatients(Array.isArray(patientsData) ? patientsData.slice(0, 6) : []);
          const allReps = Array.isArray(reportsData) ? reportsData : [];
          setPendingReports(allReps.filter(r => r.status === 'PENDING').slice(0, 5));
          setAllReportsForActivity(allReps.slice(0, 6));
          setTests(Array.isArray(testsData) ? testsData : []);

          // Fetch due checkups (non-blocking)
          try {
            const dcRes = await fetch(`${API}/dashboard/due-checkups`, { headers });
            if (dcRes.ok) setDueCheckups(await dcRes.json());
          } catch (_) {}
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader type="page" size="md" />
        </div>
      </Layout>
    );
  }

  // ────────────────────────────────────────────────────────
  // PATIENT RENDERING
  // ────────────────────────────────────────────────────────
  if (user?.userType === 'PATIENT') {
    const activeTrend = trends.find(t => t.parameterName === selectedTrend);
    const trendLineData = activeTrend ? {
      labels: activeTrend.history.map(h => new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: `${activeTrend.parameterName} (${activeTrend.unit})`,
        data: activeTrend.history.map(h => h.value),
        borderColor: '#00488d',
        backgroundColor: 'rgba(0, 72, 141, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#00488d',
        pointHoverRadius: 7,
        pointRadius: 5
      }]
    } : null;

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const histNode = activeTrend?.history[context.dataIndex];
              return `Value: ${context.parsed.y} ${activeTrend?.unit} (${histNode?.flag || 'NORMAL'})`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: '#f1f5f9' },
          title: { display: true, text: activeTrend?.unit || '', font: { size: 11 } }
        },
        x: { grid: { display: false } }
      }
    };

    return (
      <Layout>
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#085041] to-[#0f766e] text-white rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative">
            <span className="bg-[#ffb800] text-gray-900 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              Patient Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">Welcome back, {user?.name}!</h2>
            <p className="text-teal-100 text-sm max-w-xl">
              Track your vital health metrics, lookup completed diagnostic test parameters, download laboratory reports, and book local home visits.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">{stats.completedReports}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed Reports</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">{stats.pendingReports}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Reports</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600"><Clock className="w-5 h-5" /></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Payments</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><IndianRupee className="w-5 h-5" /></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">{patientProfile?.bloodGroup || 'A+'}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Blood Group</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-red-600"><HeartPulse className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Trends Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><Activity className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-black text-gray-800 uppercase tracking-wide">🧬 Health History Tracker</h3>
                  <p className="text-xs text-gray-400">Plot historical numerical parameters from your reports</p>
                </div>
              </div>
              {trends.length > 0 && (
                <select 
                  className="bg-gray-50 border border-gray-200 text-sm font-semibold rounded-lg px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-[#085041] transition-all cursor-pointer"
                  value={selectedTrend}
                  onChange={e => setSelectedTrend(e.target.value)}
                >
                  {trends.map(t => (
                    <option key={t.parameterName} value={t.parameterName}>{t.parameterName}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="h-64">
              {trends.length > 0 && trendLineData ? (
                <Line data={trendLineData} options={chartOptions} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Activity className="w-12 h-12 text-gray-200 mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-gray-500">No completed reports to track health history yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Once reports are verified, your parameter trends will appear here!</p>
                </div>
              )}
            </div>

            {activeTrend && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500">Normal Clinical Reference Range:</span>
                <span className="text-gray-800 font-bold bg-white px-2 py-1 rounded border border-gray-100">
                  {activeTrend.referenceRange} {activeTrend.unit}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions & Profile Info */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Quick Services</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#00488d] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                >
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Book Home Collection</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border border-gray-200 transition-all"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> View Test Reports</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <a
                  href="https://wa.me/916396786939"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-sm border border-emerald-200 transition-all"
                >
                  <span className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-emerald-600" /> WhatsApp Live Helpline</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Registered Profile</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400 font-bold uppercase">Patient ID</span>
                  <span className="text-gray-800 font-bold">{patientProfile?.patientId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400 font-bold uppercase">Diabetes</span>
                  <span className={`font-black ${patientProfile?.diabetes ? 'text-red-600' : 'text-green-600'}`}>
                    {patientProfile?.diabetes ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400 font-bold uppercase">Hypertension</span>
                  <span className={`font-black ${patientProfile?.hypertension ? 'text-red-600' : 'text-green-600'}`}>
                    {patientProfile?.hypertension ? 'YES' : 'NO'}
                  </span>
                </div>
                {patientProfile?.allergies && (
                  <div className="py-1">
                    <span className="text-gray-400 font-bold uppercase block mb-1">Known Allergies</span>
                    <span className="text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded inline-block font-semibold">
                      {patientProfile.allergies}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent reports list */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Recent Diagnostic Reports</h3>
            <button onClick={() => navigate('/reports')} className="text-xs font-black text-[#00488d] hover:underline">VIEW ALL REPORTS →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Report Number</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Referred Doctor</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allReports.length > 0 ? allReports.slice(0, 5).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{r.reportNumber}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(r.reportDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-gray-600">{r.doctor?.name ? `Dr. ${r.doctor.name}` : 'Self'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/print/${r.id}`)}
                        className="text-xs font-bold text-[#00488d] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Print/View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No reports generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }

  // ────────────────────────────────────────────────────────
  // DOCTOR RENDERING
  // ────────────────────────────────────────────────────────
  if (user?.userType === 'DOCTOR') {
    // Generate referral bar chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const referralCounts = Array(12).fill(0);
    allReports.forEach(r => {
      const monthIdx = new Date(r.createdAt).getMonth();
      referralCounts[monthIdx]++;
    });

    const currentMonthIndex = new Date().getMonth();
    const chartMonths = [];
    const chartData = [];
    // Show last 6 months
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      chartMonths.push(monthNames[idx]);
      chartData.push(referralCounts[idx]);
    }

    const doctorReferralsChart = {
      labels: chartMonths,
      datasets: [{
        label: 'Patients Referred',
        data: chartData,
        backgroundColor: '#00488d',
        borderRadius: 6,
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

    return (
      <Layout>
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#00488d] to-blue-800 text-white rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative">
            <span className="bg-[#ffb800] text-gray-900 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              Doctor Panel
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">Welcome back, Dr. {user?.name}!</h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Track referrals, review your patients' test reports, and monitor estimated commission details from this secure medical portal.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">{stats.totalPatients}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Referred Patients</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">{stats.pendingReports}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Reports</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600"><Clock className="w-5 h-5" /></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">{stats.completedReports}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed Reports</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-800">₹{(stats.totalCommission || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Est. Commissions</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Rate: {stats.commissionRate}%</p>
            </div>
            <div className="bg-[#ffb800]/10 p-3 rounded-lg text-[#ffb800]"><Award className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Referrals Volume (Last 6 Months)</h3>
            <div className="h-64">
              <Bar data={doctorReferralsChart} options={chartOptions} />
            </div>
          </div>

          {/* Quick Support & Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Referral Policy</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Thank you for your trusted referrals. If you notice diagnostic reports pending for more than 12 hours, feel free to contact our senior lab technician for prioritized report generation.
              </p>
              <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" /> Commission Settings
                </p>
                Your referral rate is set to <strong>{stats.commissionRate}%</strong>. Discounts requested by the doctor are adjusted against the net commission payouts.
              </div>
            </div>
            <a
              href="https://wa.me/916396786939"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-sm border border-emerald-200 transition-all text-center"
            >
              <span className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-emerald-600" /> WhatsApp Lab Desk</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Referred Patients List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Referred Patients & Reports</h3>
            <button onClick={() => navigate('/reports')} className="text-xs font-black text-[#00488d] hover:underline">VIEW ALL PATIENTS →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Patient Name</th>
                  <th className="px-6 py-3.5">Report Number</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allReports.length > 0 ? allReports.slice(0, 10).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{r.patient?.fullName}</p>
                      <p className="text-[10px] text-gray-400">{r.patient?.patientId} · {r.patient?.gender} · {r.patient?.age} Yrs</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{r.reportNumber}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(r.reportDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/print/${r.id}`)}
                        className="text-xs font-bold text-[#00488d] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Print/View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No referred patients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }

  // ────────────────────────────────────────────────────────
  // STAFF / ADMIN RENDERING
  // ────────────────────────────────────────────────────────
  const statCards = [
    { name: "Today's Patients", value: stats.todayPatients, icon: <Users className="h-5 w-5" />, color: 'from-[#00488d] to-blue-800', sub: `${stats.totalPatients} total` },
    { name: 'Pending Reports', value: stats.pendingReports, icon: <Clock className="h-5 w-5" />, color: 'from-orange-400 to-orange-600', sub: `${stats.completedReports} completed` },
    { name: "Today's Revenue", value: `₹${(stats.todayRevenue || 0).toLocaleString()}`, icon: <IndianRupee className="h-5 w-5" />, color: 'from-emerald-500 to-emerald-700', sub: `₹${(stats.monthRevenue || 0).toLocaleString()} this month` },
    { name: 'Tests Available', value: tests.length, icon: <Activity className="h-5 w-5" />, color: 'from-purple-500 to-purple-700', sub: 'in test catalogue' },
  ];

  // Chart data for test categories
  const categoryMap = tests.reduce((acc, t) => {
    const cat = t.category?.name || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(categoryMap),
    datasets: [{
      data: Object.values(categoryMap),
      backgroundColor: ['#00488d', '#ffb800', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = {
    labels: months,
    datasets: [{
      label: 'Revenue (₹)',
      data: [0, 0, 0, 0, 0, stats.monthRevenue || 0],
      backgroundColor: 'rgba(0, 72, 141, 0.15)',
      borderColor: '#00488d',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00488d',
    }],
  };

  const patientData = {
    labels: months,
    datasets: [{
      label: 'Patients',
      data: [0, 0, 0, 0, 0, stats.totalPatients || 0],
      backgroundColor: '#ffb800',
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#00488d] to-blue-800 text-white rounded-xl p-5 mb-4 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute -right-5 bottom-0 w-32 h-32 bg-[#ffb800]/20 rounded-full"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold mb-0.5">Welcome, {user?.name} 👋</h2>
            <p className="text-blue-200 text-xs">{liveTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {stats.lowStockCount > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 bg-[#ffb800]/20 border border-[#ffb800]/40 text-yellow-200 px-3 py-1.5 rounded text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> {stats.lowStockCount} inventory item{stats.lowStockCount > 1 ? 's' : ''} low on stock
              </div>
            )}
          </div>
          {/* Live Clock */}
          <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center backdrop-blur-sm shrink-0">
            <p className="text-2xl font-black tabular-nums tracking-wide">
              {liveTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-0.5">IST Live</p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'New Report', icon: <FileText className="w-4 h-4" />, color: 'bg-[#00488d] hover:bg-blue-800', href: '/reports/new' },
          { label: 'Add Patient', icon: <PlusCircle className="w-4 h-4" />, color: 'bg-[#085041] hover:bg-emerald-800', href: '/patients' },
          { label: 'View Billing', icon: <IndianRupee className="w-4 h-4" />, color: 'bg-amber-600 hover:bg-amber-700', href: '/billing' },
          { label: 'Inventory', icon: <FlaskConical className="w-4 h-4" />, color: 'bg-purple-700 hover:bg-purple-800', href: '/inventory' },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.href)}
            className={`${action.color} animate-fade-in-up stagger-${i + 1} text-white flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">{card.icon}</div>
            </div>
            <p className="text-2xl font-extrabold">{card.value}</p>
            <p className="text-xs font-bold uppercase tracking-wide opacity-80 mt-1">{card.name}</p>
            <p className="text-xs opacity-60 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#00488d] uppercase tracking-wide">Revenue Trend</h3>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-48">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Test Categories Doughnut */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#00488d] uppercase tracking-wide mb-4">Test Categories</h3>
          <div className="h-48">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
          </div>
        </div>
      </div>

      {/* Patient Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#00488d] uppercase tracking-wide mb-4">Patient Growth</h3>
          <div className="h-40">
            <Bar data={patientData} options={chartOptions} />
          </div>
        </div>

        {/* Top Referring Doctors */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#00488d] uppercase tracking-wide mb-4">Top Referring Doctors</h3>
          {stats.topDoctors?.length > 0 ? (
            <div className="space-y-3">
              {stats.topDoctors.map((doc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                      <div className="h-1.5 bg-[#00488d] rounded-full" style={{ width: `${Math.min((doc.count / (stats.topDoctors[0]?.count || 1)) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00488d]">{doc.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">No referrals yet</div>
          )}
        </div>

        {/* Month Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#00488d] uppercase tracking-wide mb-4">Month Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-green-600' },
              { label: 'This Month', value: `₹${(stats.monthRevenue || 0).toLocaleString()}`, color: 'text-blue-600' },
              { label: 'Total Patients', value: stats.totalPatients, color: 'text-purple-600' },
              { label: 'Completed Reports', value: stats.completedReports, color: 'text-green-600' },
              { label: 'Pending Reports', value: stats.pendingReports, color: 'text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patients, Pending Reports & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#00488d] uppercase">Recent Patients</h3>
            <button onClick={() => navigate('/patients')} className="text-xs font-bold text-[#00488d] hover:underline">VIEW ALL →</button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPatients.length > 0 ? recentPatients.map(p => (
              <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00488d] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {p.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-[#00488d]">{p.fullName}</p>
                    <p className="text-xs text-gray-400">{p.patientId} · {p.mobileNumber}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">No patients yet</div>
            )}
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#00488d] uppercase">Pending Reports</h3>
            <button onClick={() => navigate('/reports')} className="text-xs font-bold text-[#00488d] hover:underline">VIEW ALL →</button>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingReports.length > 0 ? pendingReports.map(r => (
              <div key={r.id} onClick={() => navigate('/reports')}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-gray-800">{r.reportNumber}</p>
                  <p className="text-xs text-gray-400">{r.patient?.fullName} · {new Date(r.reportDate).toLocaleDateString('en-IN')}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-[#ffb800] text-gray-900">PENDING</span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">🎉 No pending reports!</div>
            )}
          </div>
        </div>
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00488d] uppercase">Recent Activity</h3>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {allReportsForActivity.length > 0 ? allReportsForActivity.map((r, i) => (
              <div key={r.id}
                className={`px-5 py-3 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${r.status === 'COMPLETED' ? 'bg-green-500 animate-pulse-glow' : 'bg-amber-400'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{r.reportNumber}</p>
                    <p className="text-[10px] text-gray-400 truncate">{r.patient?.fullName}</p>
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${r.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {r.status === 'COMPLETED' ? 'DONE' : 'PEND'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 mt-1 pl-5">
                  {new Date(r.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </p>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Annual Checkup Reminders — Admin Only */}
      {(user?.userType !== 'PATIENT' && user?.userType !== 'DOCTOR') && dueCheckups.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
                Due for Annual Checkup
              </h3>
              <span className="ml-1 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {dueCheckups.length}
              </span>
            </div>
            <p className="text-xs text-amber-600 font-medium">Patients with no completed report in 11+ months</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Patient</th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Last Report</th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Months Ago</th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Mobile</th>
                  <th className="px-5 py-2.5 text-[10px] font-bold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dueCheckups.map(p => {
                  const waMsg = encodeURIComponent(
                    `Dear ${p.fullName}, your last health checkup at Sana Pathology Lab was ${p.monthsSinceLast} months ago (${p.lastReportNumber}). We recommend scheduling your Annual Checkup. Call us: 6396786939`
                  );
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-bold text-slate-800">{p.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.patientId} · {p.gender} · {p.age}y</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600 font-mono">
                        {p.lastReportNumber}
                        <br />
                        <span className="text-gray-400">{new Date(p.lastReportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${p.monthsSinceLast >= 24 ? 'bg-red-100 text-red-700' : p.monthsSinceLast >= 18 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.monthsSinceLast} months
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 font-mono">{p.mobileNumber}</td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={`https://wa.me/91${p.mobileNumber}?text=${waMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Reminder
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
