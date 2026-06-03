import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Users, CalendarCheck, Wallet, ToggleLeft, ToggleRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const API = '/api';

const ROLES = ['TECHNICIAN', 'RECEPTIONIST', 'HELPER', 'ACCOUNTANT', 'MANAGER', 'CLEANER', 'OTHER'];
const ATTENDANCE_STATUS = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];
const ATTENDANCE_COLORS = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  HALF_DAY: 'bg-yellow-100 text-yellow-800',
  LEAVE: 'bg-blue-100 text-blue-800',
};

const Staff = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ACTIVE');
  const [form, setForm] = useState({ name: '', role: 'TECHNICIAN', mobile: '', email: '', address: '', joiningDate: '', salary: '' });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/staff`, { headers });
      setStaff(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const openAdd = () => {
    setForm({ name: '', role: 'TECHNICIAN', mobile: '', email: '', address: '', joiningDate: new Date().toISOString().split('T')[0], salary: '' });
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name, role: s.role, mobile: s.mobile || '', email: s.email || '',
      address: s.address || '', joiningDate: s.joiningDate ? s.joiningDate.split('T')[0] : '', salary: s.salary || '',
    });
    setEditItem(s);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editItem ? 'PUT' : 'POST';
    const url = editItem ? `${API}/staff/${editItem.id}` : `${API}/staff`;
    await fetch(url, { method, headers, body: JSON.stringify(form) });
    setShowModal(false);
    fetchStaff();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    await fetch(`${API}/staff/${id}`, { method: 'DELETE', headers });
    fetchStaff();
  };

  const handleToggleActive = async (s) => {
    await fetch(`${API}/staff/${s.id}`, { method: 'PUT', headers, body: JSON.stringify({ isActive: !s.isActive }) });
    fetchStaff();
  };

  const markAttendance = async (staffId, status) => {
    await fetch(`${API}/staff/attendance`, { method: 'POST', headers, body: JSON.stringify({ staffId, date: attendanceDate, status }) });
    fetchStaff();
  };

  const filtered = staff.filter(s => tab === 'ACTIVE' ? s.isActive : !s.isActive);
  const todayStr = new Date().toISOString().split('T')[0];

  const exportToExcel = () => {
    const dataToExport = filtered.map(s => ({
      'Staff ID': s.staffId || 'N/A',
      'Name': s.name,
      'Role': s.role,
      'Mobile': s.mobile || 'N/A',
      'Email': s.email || 'N/A',
      'Salary (₹)': s.salary || 'N/A',
      'Joining Date': s.joiningDate ? new Date(s.joiningDate).toLocaleDateString('en-IN') : 'N/A',
      'Status': s.isActive ? 'Active' : 'Inactive'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Staff_${tab}`);
    XLSX.writeFile(workbook, `Staff_Report_${tab}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">{staff.filter(s => s.isActive).length} active staff members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowAttendance(!showAttendance)}
            className={`flex items-center gap-2 px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm border ${showAttendance ? 'bg-[#00488d] text-white border-[#00488d]' : 'bg-white text-[#00488d] border-[#00488d] hover:bg-blue-50'}`}>
            <CalendarCheck className="w-4 h-4" /> Attendance
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#00488d] hover:bg-blue-800 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Attendance Panel */}
      {showAttendance && (
        <div className="bg-white rounded-lg border border-[#00488d] shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#00488d]">Mark Attendance</h3>
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00488d]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Staff</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                  {ATTENDANCE_STATUS.map(s => (
                    <th key={s} className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase">{s.replace('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.filter(s => s.isActive).map(s => {
                  const todayAtt = s.attendance?.find(a => a.date.split('T')[0] === attendanceDate);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-gray-800">{s.name}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{s.role}</td>
                      {ATTENDANCE_STATUS.map(status => (
                        <td key={status} className="px-3 py-2 text-center">
                          <button onClick={() => markAttendance(s.id, status)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${todayAtt?.status === status ? ATTENDANCE_COLORS[status] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {status === 'HALF_DAY' ? 'HALF' : status.charAt(0)}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['ACTIVE', 'INACTIVE'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase ${tab === t ? 'bg-[#00488d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00488d]'}`}>
            {t} ({staff.filter(s => t === 'ACTIVE' ? s.isActive : !s.isActive).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400 bg-white rounded border border-gray-200">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold">No staff members found</p>
            </div>
          ) : filtered.map(s => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:border-[#00488d] transition-colors p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.staffId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                <p className="text-sm text-gray-600"><span className="font-bold text-[#00488d]">Role:</span> {s.role}</p>
                {s.mobile && <p className="text-sm text-gray-600"><span className="font-bold text-[#00488d]">Mobile:</span> {s.mobile}</p>}
                {s.salary && <p className="text-sm text-gray-600"><span className="font-bold text-[#00488d]">Salary:</span> ₹{parseFloat(s.salary).toLocaleString()}/mo</p>}
                {s.joiningDate && <p className="text-sm text-gray-600"><span className="font-bold text-[#00488d]">Joined:</span> {new Date(s.joiningDate).toLocaleDateString('en-IN')}</p>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-[#00488d] border border-[#00488d] py-1.5 rounded hover:bg-blue-50">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleToggleActive(s)} className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold py-1.5 rounded ${s.isActive ? 'border border-orange-400 text-orange-600 hover:bg-orange-50' : 'border border-green-400 text-green-600 hover:bg-green-50'}`}>
                  {s.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {s.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-600 px-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#00488d]">{editItem ? 'Edit Staff' : 'Add Staff Member'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role *</label>
                  <select required value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                  <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salary (₹/mo)</label>
                  <input type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Joining Date</label>
                  <input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                  <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#00488d] text-white rounded text-sm font-bold hover:bg-blue-800">
                  {editItem ? 'Update' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Staff;
