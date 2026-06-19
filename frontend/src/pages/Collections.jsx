import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { 
  MapPin, Calendar, Clock, User, FlaskConical, CheckCircle2, 
  ClipboardList, RefreshCw, AlertTriangle, UserCheck, X
} from 'lucide-react';
import Loader from '../components/Loader';

const API = '/api';

const Collections = () => {
  const { user } = useContext(AuthContext);
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, SCHEDULED, COMPLETED, CANCELLED
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, staffRes] = await Promise.all([
        fetch(`${API}/appointments`, { headers }),
        fetch(`${API}/staff`, { headers })
      ]);

      if (aptRes.ok && staffRes.ok) {
        const aptData = await aptRes.json();
        const staffData = await staffRes.json();
        
        // Filter appointments for HOME_COLLECTION type
        const collectionsOnly = Array.isArray(aptData) 
          ? aptData.filter(a => a.type === 'HOME_COLLECTION') 
          : [];
        
        setAppointments(collectionsOnly);
        setStaffList(Array.isArray(staffData) ? staffData : []);
      }
    } catch (err) {
      console.error('Failed to fetch collections data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAssignPhlebotomist = async (appointmentId, staffId) => {
    try {
      const response = await fetch(`${API}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ assignedToId: staffId ? parseInt(staffId) : null })
      });
      if (response.ok) {
        // Update local state
        setAppointments(prev => prev.map(apt => {
          if (apt.id === appointmentId) {
            const staffMember = staffList.find(s => s.id === parseInt(staffId));
            return { ...apt, assignedToId: staffId ? parseInt(staffId) : null, assignedTo: staffMember || null };
          }
          return apt;
        }));
      } else {
        alert('Failed to assign phlebotomist.');
      }
    } catch (err) {
      console.error('Assign phlebotomist error:', err);
    }
  };

  const handleMarkCollected = async (appointmentId) => {
    try {
      const response = await fetch(`${API}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (response.ok) {
        setAppointments(prev => prev.map(apt => {
          if (apt.id === appointmentId) {
            return { ...apt, status: 'COMPLETED' };
          }
          return apt;
        }));
      } else {
        alert('Failed to update collection status.');
      }
    } catch (err) {
      console.error('Mark collected error:', err);
    }
  };

  // Filter staff list to only active technicians/phlebotomists
  const phlebotomists = staffList.filter(s => s.isActive && (s.role === 'TECHNICIAN' || s.role === 'HELPER' || s.role === 'OTHER'));

  // Filter and search logic
  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'ALL' || apt.status === filterStatus;
    const patientName = apt.patient?.fullName?.toLowerCase() || '';
    const patientMobile = apt.patient?.mobileNumber || '';
    const address = apt.address?.toLowerCase() || '';
    const refId = `SPL-APT-${apt.id.toString().padStart(6, '0')}`.toLowerCase();
    
    const matchesSearch = 
      patientName.includes(searchTerm.toLowerCase()) ||
      patientMobile.includes(searchTerm) ||
      address.includes(searchTerm.toLowerCase()) ||
      refId.includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00488d] uppercase tracking-wide">Home Sample Collections</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage home visits, phlebotomist assignments, and collection updates.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-200 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                filterStatus === status 
                  ? 'bg-[#00488d] text-white' 
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status} ({
                status === 'ALL' 
                  ? appointments.length 
                  : appointments.filter(a => a.status === status).length
              })
            </button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search by patient name, mobile, address, ref..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00488d] transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader type="page" size="md" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold">No home collection requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAppointments.map(apt => (
                <div 
                  key={apt.id} 
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between gap-5 ${
                    apt.status === 'COMPLETED' 
                      ? 'border-emerald-100 bg-emerald-50/5' 
                      : apt.status === 'CANCELLED' 
                        ? 'border-red-100 bg-red-50/5' 
                        : 'border-slate-200 hover:border-[#00488d]'
                  }`}
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black bg-blue-50 text-[#00488d] px-2.5 py-1 rounded-lg font-mono">
                        SPL-APT-{apt.id.toString().padStart(6, '0')}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        apt.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : apt.status === 'CANCELLED' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-800">{apt.patient?.fullName}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {apt.patient?.patientId} · {apt.patient?.gender} · {apt.patient?.age} Yrs · {apt.patient?.mobileNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Date: <strong className="text-slate-700">{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Time Slot: <strong className="text-slate-700">{apt.time}</strong></span>
                      </div>
                      <div className="col-span-1 sm:col-span-2 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>Address: <strong className="text-slate-700">{apt.address || 'N/A'}</strong></span>
                      </div>
                      {apt.notes && (
                        <div className="col-span-1 sm:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patient Notes</p>
                          <p className="text-slate-700 mt-0.5 font-medium">{apt.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between sm:items-end gap-4 min-w-[200px] border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div className="space-y-2 w-full">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Phlebotomist Assigned
                      </label>
                      {apt.status === 'COMPLETED' || apt.status === 'CANCELLED' ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                          <UserCheck className="w-4 h-4 text-slate-400" />
                          <span>{apt.assignedTo?.name || 'None Assigned'}</span>
                        </div>
                      ) : (
                        <select
                          value={apt.assignedToId || ''}
                          onChange={e => handleAssignPhlebotomist(apt.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-[#00488d] transition-all outline-none"
                        >
                          <option value="">-- Assign Staff --</option>
                          {phlebotomists.map(staff => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {apt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleMarkCollected(apt.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Collected</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Collections;
