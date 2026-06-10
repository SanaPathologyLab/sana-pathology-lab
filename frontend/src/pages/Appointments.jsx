import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import {
  Plus, Pencil, Trash2, X, Calendar, Clock, User, Stethoscope,
  CheckCircle, XCircle, Download, FlaskConical, IndianRupee, UserPlus,
  Users, Search, ChevronRight, Phone, MapPin
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Loader from '../components/Loader';

const API = '/api';

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const GENDERS = ['Male', 'Female', 'Other'];

const emptyNewPatient = {
  fullName: '', age: '', gender: 'Male', mobileNumber: '', city: '', bloodGroup: ''
};

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Booking form state
  const [patientMode, setPatientMode] = useState('new'); // 'new' | 'existing'
  const [newPatient, setNewPatient] = useState(emptyNewPatient);
  const [existingPatientId, setExistingPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedTests, setSelectedTests] = useState([]); // array of test ids
  const [form, setForm] = useState({
    doctorId: '', date: new Date().toISOString().split('T')[0], time: '09:00', notes: '', status: 'SCHEDULED',
  });

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, dRes, tRes] = await Promise.all([
        fetch(`${API}/appointments`, { headers }),
        fetch(`${API}/patients`, { headers }),
        fetch(`${API}/doctors`, { headers }),
        fetch(`${API}/tests`, { headers }),
      ]);
      const [aData, pData, dData, tData] = await Promise.all([aRes.json(), pRes.json(), dRes.json(), tRes.json()]);
      setAppointments(Array.isArray(aData) ? aData : []);
      setPatients(Array.isArray(pData) ? pData : []);
      setDoctors(Array.isArray(dData) ? dData : []);
      setTests(Array.isArray(tData) ? tData : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const selectedTestObjects = tests.filter(t => selectedTests.includes(t.id));
  const totalAmount = selectedTestObjects.reduce((sum, t) => sum + t.price, 0);

  const selectedDoctor = doctors.find(d => d.id === parseInt(form.doctorId));
  const commissionAmount = selectedDoctor
    ? ((totalAmount * (selectedDoctor.commissionRate || 0)) / 100)
    : 0;

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mobileNumber?.includes(patientSearch) ||
    p.patientId?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // ─── Open/Reset Modal ─────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setPatientMode('new');
    setNewPatient(emptyNewPatient);
    setExistingPatientId('');
    setPatientSearch('');
    setSelectedTests([]);
    setForm({ doctorId: '', date: new Date().toISOString().split('T')[0], time: '09:00', notes: '', status: 'SCHEDULED' });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditItem(a);
    setPatientMode('existing');
    setExistingPatientId(String(a.patientId));
    setPatientSearch('');
    setSelectedTests([]);
    setForm({
      doctorId: a.doctorId ? String(a.doctorId) : '',
      date: a.date.split('T')[0], time: a.time,
      notes: a.notes || '', status: a.status,
    });
    setShowModal(true);
  };

  // ─── Toggle Test ──────────────────────────────────────────────────────────
  const toggleTest = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let patientId = existingPatientId ? parseInt(existingPatientId) : null;

      // If new patient mode, first create the patient
      if (!editItem && patientMode === 'new') {
        if (!newPatient.fullName || !newPatient.mobileNumber) {
          alert('Patient name and mobile number are required.');
          return;
        }
        const pRes = await fetch(`${API}/patients`, {
          method: 'POST', headers,
          body: JSON.stringify({ ...newPatient, age: parseInt(newPatient.age) || null })
        });
        if (!pRes.ok) { alert('Failed to create patient'); return; }
        const created = await pRes.json();
        patientId = created.id;
      }

      if (!patientId) { alert('Please select or enter a patient.'); return; }

      const payload = {
        patientId,
        doctorId: form.doctorId ? parseInt(form.doctorId) : null,
        date: form.date,
        time: form.time,
        notes: form.notes,
        status: form.status,
        selectedTests, // send along for notes/display (not stored as FK but useful)
      };

      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `${API}/appointments/${editItem.id}` : `${API}/appointments`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });

      if (res.ok) {
        setShowModal(false);
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save appointment');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    await fetch(`${API}/appointments/${id}`, { method: 'DELETE', headers });
    fetchAll();
  };

  const handleStatusChange = async (id, status) => {
    await fetch(`${API}/appointments/${id}`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
    fetchAll();
  };

  const exportToExcel = () => {
    const dataToExport = filtered.map(a => ({
      'Patient Name': a.patient?.fullName || 'N/A',
      'Patient ID': a.patient?.patientId || 'N/A',
      'Mobile': a.patient?.mobileNumber || 'N/A',
      'Doctor': a.doctor?.name ? `Dr. ${a.doctor.name}` : 'N/A',
      'Date': new Date(a.date).toLocaleDateString('en-IN'),
      'Time': a.time,
      'Status': a.status,
      'Notes': a.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
    XLSX.writeFile(wb, `Appointments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filtered = filterStatus === 'ALL' ? appointments : appointments.filter(a => a.status === filterStatus);

  // Group tests by category
  const testsByCategory = tests.reduce((acc, t) => {
    const cat = t.category?.name || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">{appointments.length} total appointments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#00488d] hover:bg-blue-800 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-colors ${filterStatus === s ? 'bg-[#00488d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00488d]'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <Loader className="py-16" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-500 bg-white rounded border border-gray-200">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold">No appointments found</p>
            </div>
          ) : filtered.map(a => (
            <div key={a.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:border-[#00488d] transition-colors p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded border ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {a.status}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-[#00488d]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <User className="w-4 h-4 text-[#00488d]" />
                  {a.patient?.fullName}
                  <span className="text-xs text-gray-400 font-normal">({a.patient?.patientId})</span>
                </div>
                {a.doctor && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4 text-[#00488d]" />
                    Dr. {a.doctor?.name}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#00488d]" />{new Date(a.date).toLocaleDateString('en-IN')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#00488d]" />{a.time}</span>
                </div>
                {a.notes && <p className="text-xs text-gray-500 italic">"{a.notes}"</p>}
              </div>
              {a.status === 'SCHEDULED' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => handleStatusChange(a.id, 'COMPLETED')}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 py-1.5 rounded transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Done
                  </button>
                  <button onClick={() => handleStatusChange(a.id, 'CANCELLED')}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 py-1.5 rounded transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Booking Modal ──────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#00488d] rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {editItem ? 'Edit Appointment' : 'Book New Appointment'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-gray-100">

                {/* ── Left Column: Patient ───────────────────────────────────── */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#00488d]" /> Patient Details
                  </h3>

                  {!editItem && (
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button type="button" onClick={() => setPatientMode('new')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${patientMode === 'new' ? 'bg-white text-[#00488d] shadow' : 'text-gray-500'}`}>
                        <UserPlus className="w-3.5 h-3.5" /> New Patient
                      </button>
                      <button type="button" onClick={() => setPatientMode('existing')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${patientMode === 'existing' ? 'bg-white text-[#00488d] shadow' : 'text-gray-500'}`}>
                        <Users className="w-3.5 h-3.5" /> Existing
                      </button>
                    </div>
                  )}

                  {/* New Patient Form */}
                  {(patientMode === 'new' && !editItem) && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
                        <input required value={newPatient.fullName} onChange={e => setNewPatient(p => ({ ...p, fullName: e.target.value }))}
                          placeholder="Patient full name"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Age</label>
                          <input type="number" min="0" max="120" value={newPatient.age} onChange={e => setNewPatient(p => ({ ...p, age: e.target.value }))}
                            placeholder="e.g. 35"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Gender</label>
                          <select value={newPatient.gender} onChange={e => setNewPatient(p => ({ ...p, gender: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                            {GENDERS.map(g => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Mobile Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input required type="tel" value={newPatient.mobileNumber} onChange={e => setNewPatient(p => ({ ...p, mobileNumber: e.target.value }))}
                            placeholder="10-digit number"
                            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input value={newPatient.city} onChange={e => setNewPatient(p => ({ ...p, city: e.target.value }))}
                            placeholder="City"
                            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Blood Group</label>
                        <select value={newPatient.bloodGroup} onChange={e => setNewPatient(p => ({ ...p, bloodGroup: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                          <option value="">Select</option>
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg}>{bg}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Existing Patient */}
                  {(patientMode === 'existing' || editItem) && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                          placeholder="Search by name, mobile, ID..."
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                      </div>
                      <div className="max-h-52 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1 bg-gray-50">
                        {filteredPatients.slice(0, 20).map(p => (
                          <button type="button" key={p.id}
                            onClick={() => setExistingPatientId(String(p.id))}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${existingPatientId === String(p.id) ? 'bg-[#00488d] text-white' : 'hover:bg-white hover:shadow-sm text-gray-700'}`}>
                            <div>
                              <p className="font-bold">{p.fullName}</p>
                              <p className={`text-xs ${existingPatientId === String(p.id) ? 'text-blue-100' : 'text-gray-400'}`}>
                                {p.patientId} · {p.mobileNumber}
                              </p>
                            </div>
                            {existingPatientId === String(p.id) && <ChevronRight className="w-4 h-4" />}
                          </button>
                        ))}
                        {filteredPatients.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-4">No patients found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Middle Column: Test & Doctor ───────────────────────────── */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-[#00488d]" /> Tests & Referring Doctor
                  </h3>

                  {/* Doctor */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Referring Doctor</label>
                    <select value={form.doctorId} onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                      <option value="">Walk-in / No Doctor</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.name}{d.commissionRate ? ` (${d.commissionRate}% comm.)` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedDoctor && (
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        🩺 {selectedDoctor.clinicName || 'Independent'} · Commission: {selectedDoctor.commissionRate || 0}%
                      </p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Date *</label>
                      <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Time *</label>
                      <input required type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]" />
                    </div>
                  </div>

                  {/* Tests by Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Select Tests</label>
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                      {Object.entries(testsByCategory).map(([cat, catTests]) => (
                        <div key={cat}>
                          <p className="text-xs font-extrabold text-[#00488d] uppercase tracking-wider mb-1 pb-1 border-b border-blue-50">{cat}</p>
                          <div className="space-y-1">
                            {catTests.map(t => (
                              <label key={t.id}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedTests.includes(t.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" checked={selectedTests.includes(t.id)} onChange={() => toggleTest(t.id)}
                                    className="w-4 h-4 accent-[#00488d]" />
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{t.testName}</p>
                                    <p className="text-xs text-gray-400">{t.testCode} · {t.sampleType}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-[#00488d] ml-2">₹{t.price}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      {tests.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No tests found. Add tests from the Tests page first.</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      rows={2} placeholder="Any special instructions..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d] resize-none" />
                  </div>

                  {editItem && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                      <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                        <option>SCHEDULED</option>
                        <option>COMPLETED</option>
                        <option>CANCELLED</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* ── Right Column: Summary ──────────────────────────────────── */}
                <div className="p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#00488d]" /> Booking Summary
                  </h3>

                  {/* Patient Summary */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-2">Patient</p>
                    {patientMode === 'new' && !editItem ? (
                      newPatient.fullName ? (
                        <div>
                          <p className="font-bold text-gray-800">{newPatient.fullName}</p>
                          <p className="text-xs text-gray-500">{newPatient.age ? `${newPatient.age}Y` : ''} {newPatient.gender} · {newPatient.mobileNumber || '—'}</p>
                          {newPatient.city && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{newPatient.city}</p>}
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">Fill in patient details →</p>
                    ) : (
                      (() => {
                        const p = patients.find(p => String(p.id) === existingPatientId);
                        return p ? (
                          <div>
                            <p className="font-bold text-gray-800">{p.fullName}</p>
                            <p className="text-xs text-gray-500">{p.patientId} · {p.mobileNumber}</p>
                            <p className="text-xs text-gray-500">{p.age ? `${p.age}Y` : ''} {p.gender}</p>
                          </div>
                        ) : <p className="text-xs text-gray-400 italic">Select a patient →</p>;
                      })()
                    )}
                  </div>

                  {/* Appointment Time */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#00488d]" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {form.date ? new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                      <p className="text-xs text-gray-500">at {form.time}</p>
                    </div>
                  </div>

                  {/* Doctor */}
                  {selectedDoctor && (
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">Dr. {selectedDoctor.name}</p>
                        <p className="text-xs text-gray-500">{selectedDoctor.specialization || 'General'} · {selectedDoctor.clinicName || 'Independent'}</p>
                      </div>
                    </div>
                  )}

                  {/* Tests Summary */}
                  {selectedTestObjects.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <p className="text-xs font-bold text-gray-500 uppercase px-3 py-2 bg-gray-50 border-b border-gray-100">Selected Tests</p>
                      <div className="divide-y divide-gray-50">
                        {selectedTestObjects.map(t => (
                          <div key={t.id} className="flex justify-between items-center px-3 py-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{t.testName}</p>
                              <p className="text-xs text-gray-400">{t.category?.name}</p>
                            </div>
                            <span className="text-sm font-bold text-[#00488d]">₹{t.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount Breakdown */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-auto">
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tests ({selectedTestObjects.length})</span>
                        <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
                      </div>
                      {selectedDoctor && selectedDoctor.commissionRate > 0 && (
                        <div className="flex justify-between text-sm text-purple-600">
                          <span>Dr. Commission ({selectedDoctor.commissionRate}%)</span>
                          <span className="font-bold">₹{commissionAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-extrabold text-gray-900 text-base">Total Payable</span>
                        <span className="text-2xl font-black text-[#00488d]">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 py-2.5 bg-[#00488d] text-white rounded-xl text-sm font-bold hover:bg-blue-800 shadow-md shadow-blue-200 transition-colors">
                      {editItem ? 'Update' : 'Book Appointment'}
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Appointments;
