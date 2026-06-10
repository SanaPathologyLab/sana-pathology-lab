import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Phone, Stethoscope, X } from 'lucide-react';

const Doctors = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', specialization: '', mobileNumber: '', clinicName: '', commissionRate: ''
  });

  // Prevent duplicate / multiple submissions
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors', {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const name = formData.name.trim().toLowerCase();
    const mobile = formData.mobileNumber.trim();
    if (!editingId) {
      const duplicate = doctors.find(d =>
        d.name.trim().toLowerCase() === name &&
        d.mobileNumber.trim() === mobile
      );
      if (duplicate) {
        alert(`A doctor named "${formData.name}" with mobile ${mobile} already exists.`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const url = editingId 
        ? `/api/doctors/${editingId}` 
        : '/api/doctors';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify({
          name: formData.name,
          specialization: formData.specialization,
          mobileNumber: formData.mobileNumber,
          clinicName: formData.clinicName,
          commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : 0
        })
      });
      if (res.ok) {
        closeModal();
        fetchDoctors();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to save doctor: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify({ isApproved: true })
      });
      if (res.ok) {
        fetchDoctors();
      } else {
        alert('Failed to approve doctor');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        fetchDoctors();
      } else {
        // Try to parse JSON, if it fails, it will jump to catch
        const text = await res.text();
        let errorMsg = 'Access Denied';
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || errorMsg;
        } catch (e) {
          errorMsg = text || res.statusText;
        }
        alert(`Failed to delete: ${errorMsg}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Network or server error occurred: ${err.message}`);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', specialization: '', mobileNumber: '', clinicName: '', commissionRate: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingId(doc.id);
    setFormData({
      name: doc.name,
      specialization: doc.specialization || '',
      mobileNumber: doc.mobileNumber,
      clinicName: doc.clinicName || '',
      commissionRate: doc.commissionRate || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Referring Doctors</h2>
        <button 
          onClick={openAddModal}
          className="bg-[#00488d] hover:bg-[#003875] text-white px-6 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> ADD DOCTOR
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm p-4 mb-6">
        <div className="relative w-full max-w-lg bg-white border border-gray-300 rounded flex items-center px-3 py-2 focus-within:border-[#00488d]">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search by name, specialization, or clinic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(d => (
            <div key={d.id} className="bg-white rounded border border-gray-200 p-6 shadow-sm hover:border-[#00488d] transition-colors relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#ffb800] opacity-10 rounded-bl-full"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded bg-[#00488d] text-[#ffb800] flex items-center justify-center text-xl font-bold">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{d.specialization || 'General'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(d)} className="text-gray-400 hover:text-[#00488d]" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!d.isApproved && (
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded p-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-orange-600 uppercase tracking-wide">Pending Approval</span>
                  <button onClick={() => handleApprove(d.id)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                    APPROVE
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {d.mobileNumber}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2 text-gray-400 font-bold flex items-center justify-center">C</span>
                  {d.clinicName || 'Independent Practice'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 text-sm">
            No doctors found matching your criteria.
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#00488d]">{editingId ? 'Edit Doctor' : 'Register New Doctor'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Doctor Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input type="text" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Specialization</label>
                  <input type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" placeholder="e.g. Cardiologist" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Clinic Name</label>
                  <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Commission Rate (%)</label>
                  <input type="number" step="0.1" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#00488d]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-6 py-2 border border-gray-300 rounded text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#00488d] text-white rounded font-bold hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Saving...' : (editingId ? 'Update Doctor' : 'Save Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Doctors;
