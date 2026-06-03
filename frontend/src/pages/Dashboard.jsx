import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, IndianRupee, Activity, TrendingUp, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const API = '/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0, todayPatients: 0, pendingReports: 0, completedReports: 0,
    totalRevenue: 0, todayRevenue: 0, monthRevenue: 0,
    topDoctors: [], monthlyPatients: [], lowStockCount: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${user?.accessToken}` };
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, pRes, rRes, tRes] = await Promise.all([
          fetch(`${API}/dashboard/stats`, { headers }),
          fetch(`${API}/patients`, { headers }),
          fetch(`${API}/reports`, { headers }),
          fetch(`${API}/tests`, { headers }),
        ]);
        const statsData = await statsRes.json();
        const patients = await pRes.json();
        const reports = await rRes.json();
        const testsData = await tRes.json();

        setStats(statsData);
        setRecentPatients(Array.isArray(patients) ? patients.slice(0, 6) : []);
        setPendingReports(Array.isArray(reports) ? reports.filter(r => r.status === 'PENDING').slice(0, 5) : []);
        setTests(Array.isArray(testsData) ? testsData : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      setLoading(false);
    };
    if (user) fetchAll();
  }, [user]);

  const statCards = [
    { name: "Today's Patients", value: stats.todayPatients, icon: <Users className="h-5 w-5" />, color: 'from-blue-500 to-blue-700', sub: `${stats.totalPatients} total` },
    { name: 'Pending Reports', value: stats.pendingReports, icon: <Clock className="h-5 w-5" />, color: 'from-orange-400 to-orange-600', sub: `${stats.completedReports} completed` },
    { name: "Today's Revenue", value: `₹${(stats.todayRevenue || 0).toLocaleString()}`, icon: <IndianRupee className="h-5 w-5" />, color: 'from-green-500 to-green-700', sub: `₹${(stats.monthRevenue || 0).toLocaleString()} this month` },
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

  // Revenue chart — last 6 months placeholder (using monthRevenue as latest)
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

  // Patient chart
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
      <div className="bg-gradient-to-r from-[#00488d] to-blue-800 text-white rounded-xl p-6 mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute -right-5 bottom-0 w-32 h-32 bg-[#ffb800]/20 rounded-full"></div>
        <div className="relative">
          <h2 className="text-2xl font-extrabold mb-1">Welcome, {user?.name} 👋</h2>
          <p className="text-blue-200 text-sm">Sana Pathology Lab Management System · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {stats.lowStockCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-[#ffb800]/20 border border-[#ffb800]/40 text-yellow-200 px-3 py-1.5 rounded text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> {stats.lowStockCount} inventory item{stats.lowStockCount > 1 ? 's' : ''} low on stock
            </div>
          )}
        </div>
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

        {/* Quick Stats */}
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

      {/* Recent Patients & Pending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </Layout>
  );
};

export default Dashboard;
