import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Users, Eye, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  useEffect(() => {
    fetchPatients();
    const query = new URLSearchParams(location.search).get('search');
    if (query) setSearchTerm(query);
  }, [location.search]);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients', {
        headers: { 'Authorization': `Bearer ${user?.token || user?.accessToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
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

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: '' });
    setIsModalOpen(true);
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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Patient ID</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Demographics</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(p => (
                  <tr key={p.id} className="hover:bg-[#f2f7fc] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#00488d]">
                      {p.patientId}
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
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
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
              <h3 className="text-xl font-bold text-[#00488d]">{editingId ? 'Edit Patient' : 'Register New Patient'}</h3>
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
