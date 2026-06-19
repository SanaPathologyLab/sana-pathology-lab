import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Users, Eye, Download, Mic, MicOff, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { generateAI } from '../utils/ai';

const Patients = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: ''
  });

  // Prevent duplicate / multiple submissions
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  useEffect(() => {
    fetchPatients();
    const query = new URLSearchParams(location.search).get('search');
    if (query) setSearchTerm(query);
  }, [location.search]);

  const syncOfflineQueue = async () => {
    if (!navigator.onLine) return;
    const queueStr = localStorage.getItem('sana_offline_queue');
    if (!queueStr) return;
    try {
      const queue = JSON.parse(queueStr);
      if (!Array.isArray(queue) || queue.length === 0) return;

      console.log(`Syncing ${queue.length} offline operations...`);
      const remainingQueue = [];

      for (const op of queue) {
        try {
          if (op.type === 'CREATE_PATIENT') {
            const pRes = await fetch('/api/patients', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token || user?.accessToken}` 
              },
              body: JSON.stringify(op.payload)
            });
            if (!pRes.ok) {
              remainingQueue.push(op);
            }
          }
        } catch (opErr) {
          console.error("Failed to sync offline patient:", opErr);
          remainingQueue.push(op);
        }
      }

      if (remainingQueue.length > 0) {
        localStorage.setItem('sana_offline_queue', JSON.stringify(remainingQueue));
      } else {
        localStorage.removeItem('sana_offline_queue');
        fetchPatients();
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  useEffect(() => {
    window.addEventListener('online', syncOfflineQueue);
    return () => window.removeEventListener('online', syncOfflineQueue);
  }, [patients]);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients', {
        headers: { 'Authorization': `Bearer ${user?.token || user?.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPatients(data);
          localStorage.setItem('sana_patients', JSON.stringify(data));
        }
      } else {
        throw new Error("Response was not OK");
      }
    } catch (err) {
      console.warn("Fetch failed, loading from local cache:", err.message);
      const cached = localStorage.getItem('sana_patients');
      if (cached) {
        setPatients(JSON.parse(cached));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const isOffline = !navigator.onLine;
    const name = formData.fullName.trim().toLowerCase();
    const mobile = formData.mobileNumber.trim();

    if (!editingId) {
      const duplicate = patients.find(p =>
        p.fullName?.trim().toLowerCase() === name &&
        p.mobileNumber?.trim() === mobile
      );
      if (duplicate) {
        alert(`A patient named "${formData.fullName}" with mobile ${mobile} already exists (${duplicate.patientId}).`);
        return;
      }
    }

    if (isOffline) {
      // Handle offline save
      const tempId = -Date.now();
      const patientPayload = {
        ...formData,
        age: parseInt(formData.age) || null
      };

      let offlineQueue = JSON.parse(localStorage.getItem('sana_offline_queue') || '[]');
      offlineQueue.push({
        type: 'CREATE_PATIENT',
        tempId,
        payload: patientPayload
      });
      localStorage.setItem('sana_offline_queue', JSON.stringify(offlineQueue));

      const tempPatient = {
        id: tempId,
        patientId: `SPL-TEMP-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: formData.fullName,
        age: parseInt(formData.age) || null,
        ageType: formData.ageType,
        gender: formData.gender,
        mobileNumber: formData.mobileNumber,
        city: formData.city,
        bloodGroup: formData.bloodGroup,
        telegramCode: 'QUEUED',
        isOfflineTemp: true
      };

      const updated = [tempPatient, ...patients];
      setPatients(updated);
      localStorage.setItem('sana_patients', JSON.stringify(updated));

      closeModal();
      alert("Offline Mode: Patient registration queued. They will sync automatically when connection returns!");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId 
        ? `/api/patients/${editingId}` 
        : '/api/patients';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || user?.accessToken}` 
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age)
        })
      });
      if (res.ok) {
        closeModal();
        fetchPatients();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to save patient: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (deletingId) return;
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token || user?.accessToken}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to delete: ${err.message || res.statusText}`);
      }
      fetchPatients();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPatients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPatients.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleting) return;
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected patients? This action cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/patients/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || user?.accessToken}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to delete patients: ${err.message || res.statusText}`);
      }
      setSelectedIds([]);
      fetchPatients();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: '' });
    setIsModalOpen(true);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English, catches Hindi names well
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      setIsListening(false);
      const transcript = event.results[0][0].transcript;
      
      setVoiceProcessing(true);
      try {
        // Send the dictated text to AI to parse into JSON
        const prompt = `Extract patient details from this text into a strict JSON object with keys: fullName (string), age (number), ageType (Years/Months/Days), gender (Male/Female/Other), mobileNumber (string), city (string). Text: "${transcript}". Return ONLY valid JSON, no markdown formatting or extra text.`;
        
        let text = await generateAI(prompt);
        
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        setFormData(prev => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          age: parsed.age ? String(parsed.age) : prev.age,
          ageType: parsed.ageType || prev.ageType,
          gender: parsed.gender || prev.gender,
          mobileNumber: parsed.mobileNumber || prev.mobileNumber,
          city: parsed.city || prev.city
        }));
      } catch (err) {
        console.error("AI Parsing Error:", err);
        alert(`Captured text: "${transcript}". Failed to auto-fill form. Please fill manually.`);
      } finally {
        setVoiceProcessing(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const openEditModal = (patient) => {
    setEditingId(patient.id);
    setFormData({
      fullName: patient.fullName,
      age: patient.age,
      ageType: patient.ageType || 'Years',
      gender: patient.gender,
      mobileNumber: patient.mobileNumber,
      city: patient.city || '',
      bloodGroup: patient.bloodGroup || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mobileNumber?.includes(searchTerm)
  );

  const exportToExcel = () => {
    const dataToExport = filteredPatients.map(p => ({
      'Patient ID': p.patientId,
      'Full Name': p.fullName,
      'Age': `${p.age} ${p.ageType || 'Yrs'}`,
      'Gender': p.gender,
      'Mobile Number': p.mobileNumber,
      'City': p.city || 'N/A',
      'Blood Group': p.bloodGroup || 'N/A'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
    XLSX.writeFile(workbook, `Patients_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Layout>
      {!navigator.onLine && (
        <div className="mb-4 bg-amber-500 text-white font-extrabold text-sm px-4 py-3 rounded-xl flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
            <span>Offline Mode Active: Caching is active. Registered patients will auto-sync when connection returns.</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Patient Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={openAddModal}
            className="bg-[#00488d] hover:bg-[#003875] text-white px-6 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> ADD PATIENT
          </button>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="relative w-full max-w-md bg-white border border-gray-300 rounded flex items-center px-3 py-2 focus-within:border-[#00488d]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by name, ID or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm focus:outline-none"
            />
          </div>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#00488d] bg-opacity-5 border-b border-[#00488d] border-opacity-20">
            <span className="text-sm font-bold text-[#00488d]">{selectedIds.length} patient{selectedIds.length > 1 ? 's' : ''} selected</span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredPatients.length > 0 && selectedIds.length === filteredPatients.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#00488d] focus:ring-[#00488d] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Patient ID</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Demographics</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Telegram Code</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(p => (
                  <tr key={p.id} className={`hover:bg-[#f2f7fc] transition-colors ${selectedIds.includes(p.id) ? 'bg-[#e8f0fe]' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#00488d] focus:ring-[#00488d] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#00488d]">
                      {p.patientId}
                      {p.isOfflineTemp && (
                        <span className="ml-1 text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded uppercase tracking-wider animate-pulse">Offline Queue</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{p.fullName}</p>
                      <p className="text-xs text-gray-500">BG: {p.bloodGroup || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.age} {p.ageType || 'Yrs'} | {p.gender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.mobileNumber}
                      <p className="text-xs text-gray-500">{p.city}</p>
                    </td>
                    <td className="px-6 py-4">
                      {p.telegramChatId ? (
                        <span className="text-xs font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">Linked</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 select-all text-center w-fit">
                            {p.telegramCode || '—'}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">Send to bot</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-3">
                      <button onClick={() => navigate(`/patients/${p.id}`)} className="text-purple-500 hover:text-purple-700" title="View Profile">
                        <Eye className="w-4 h-4 inline-block" />
                      </button>
                      <button onClick={() => openEditModal(p)} className="text-[#00488d] hover:text-blue-800" title="Edit">
                        <Edit2 className="w-4 h-4 inline-block" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700" title="Delete">
                        <Trash2 className="w-4 h-4 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-sm">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-[#00488d]">{editingId ? 'Edit Patient' : 'Register New Patient'}</h3>
                {!editingId && (
                  <button 
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={voiceProcessing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 
                      voiceProcessing ? 'bg-blue-100 text-blue-600 cursor-wait' : 
                      'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                    title="Dictate details (e.g. 'Rahul Sharma 35 years old male mobile 9876543210 from Delhi')"
                  >
                    {isListening ? (
                      <><Mic className="w-3.5 h-3.5" /> Listening...</>
                    ) : voiceProcessing ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                    ) : (
                      <><Mic className="w-3.5 h-3.5" /> Voice Entry</>
                    )}
                  </button>
                )}
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Age *</label>
                    <div className="flex gap-2">
                      <input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-2/3 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                      <select value={formData.ageType} onChange={e => setFormData({...formData, ageType: e.target.value})} className="w-1/3 border border-gray-300 rounded px-2 py-2 focus:outline-none focus:border-[#00488d] text-sm font-bold">
                        <option>Years</option>
                        <option>Months</option>
                        <option>Days</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gender *</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input type="text" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Blood Group</label>
                  <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]">
                    <option value="">Select...</option>
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option>
                    <option>AB+</option><option>AB-</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-6 py-2 border border-gray-300 rounded text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#00488d] text-white rounded font-bold hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Saving...' : (editingId ? 'Update Patient' : 'Save Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Patients;
