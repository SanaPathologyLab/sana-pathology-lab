import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, FileText, IndianRupee, Calendar, ArrowLeft, Printer, Activity } from 'lucide-react';

const API = '/api';

const PatientProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const headers = { 'Authorization': `Bearer ${user?.accessToken}` };

  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, rRes, iRes] = await Promise.all([
          fetch(`${API}/patients/${id}`, { headers }),
          fetch(`${API}/reports`, { headers }),
          fetch(`${API}/invoices`, { headers }),
        ]);
        const pData = await pRes.json();
        const rData = await rRes.json();
        const iData = await iRes.json();
        setPatient(pData);
        setReports(rData.filter(r => r.patientId === parseInt(id)));
        setInvoices(iData.filter(i => i.patientId === parseInt(id)));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <Layout><div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  if (!patient) return <Layout><div className="text-center py-16 text-gray-400">Patient not found.</div></Layout>;

  const totalPaid = invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, i) => a + i.finalAmount, 0);
  const totalDue = invoices.filter(i => i.paymentStatus !== 'PAID').reduce((a, i) => a + i.finalAmount, 0);

  const InfoRow = ({ label, value }) => value ? (
    <div className="flex py-2 border-b border-gray-100 last:border-0">
      <span className="w-44 text-xs font-bold text-gray-500 uppercase">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  ) : null;

  return (
    <Layout>
      <div className="mb-5">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm font-bold text-[#00488d] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </button>
      </div>

      {/* Header */}
      <div className="bg-[#00488d] text-white rounded-xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{patient.fullName}</h1>
            <p className="text-blue-200 text-sm">{patient.patientId} · {patient.gender} · Age {patient.age || '—'}</p>
            <p className="text-blue-100 text-sm">{patient.mobileNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
            <p className="text-xl font-bold">{reports.length}</p>
            <p className="text-xs text-blue-200">Reports</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
            <p className="text-xl font-bold">₹{totalPaid.toLocaleString()}</p>
            <p className="text-xs text-blue-200">Total Paid</p>
          </div>
          {totalDue > 0 && (
            <div className="bg-[#ffb800]/30 rounded-lg px-4 py-2 text-center">
              <p className="text-xl font-bold text-[#ffb800]">₹{totalDue.toLocaleString()}</p>
              <p className="text-xs text-yellow-200">Due</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-sm font-bold text-[#00488d] uppercase">Personal Information</h3>
            </div>
            <div className="px-5 py-3">
              <InfoRow label="Father/Husband" value={patient.fatherHusband} />
              <InfoRow label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN') : null} />
              <InfoRow label="Blood Group" value={patient.bloodGroup} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Alternate Phone" value={patient.alternateNumber} />
              <InfoRow label="Address" value={[patient.address, patient.city, patient.state].filter(Boolean).join(', ')} />
              <InfoRow label="Aadhaar" value={patient.aadhaarNumber} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-sm font-bold text-[#00488d] uppercase">Medical History</h3>
            </div>
            <div className="px-5 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diabetes</span>
                <span className={`font-bold ${patient.diabetes ? 'text-red-600' : 'text-green-600'}`}>{patient.diabetes ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hypertension</span>
                <span className={`font-bold ${patient.hypertension ? 'text-red-600' : 'text-green-600'}`}>{patient.hypertension ? 'Yes' : 'No'}</span>
              </div>
              {patient.allergies && <div className="text-sm"><span className="text-gray-500">Allergies: </span><span className="text-gray-800">{patient.allergies}</span></div>}
              {patient.notes && <div className="text-sm text-gray-600 italic">"{patient.notes}"</div>}
            </div>
          </div>

          {patient.emergencyName && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-sm font-bold text-[#00488d] uppercase">Emergency Contact</h3>
              </div>
              <div className="px-5 py-3">
                <InfoRow label="Name" value={patient.emergencyName} />
                <InfoRow label="Relation" value={patient.emergencyRelation} />
                <InfoRow label="Phone" value={patient.emergencyPhone} />
              </div>
            </div>
          )}
        </div>

        {/* Reports & Billing */}
        <div className="lg:col-span-2 space-y-4">
          {/* Reports Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#00488d] uppercase">Test Reports ({reports.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No reports yet</p>
                </div>
              ) : reports.map(r => (
                <div key={r.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{r.reportNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(r.reportDate).toLocaleDateString('en-IN')} · {r.results?.length || 0} parameters</p>
                    {r.doctor && <p className="text-xs text-gray-400">Ref: Dr. {r.doctor.name}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.status}
                    </span>
                    <button onClick={() => navigate(`/print/${r.id}`)}
                      className="flex items-center gap-1 text-xs font-bold text-[#00488d] border border-[#00488d] px-3 py-1 rounded hover:bg-blue-50">
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-sm font-bold text-[#00488d] uppercase">Payment History ({invoices.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <IndianRupee className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No payments yet</p>
                </div>
              ) : invoices.map(inv => (
                <div key={inv.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString('en-IN')} · {inv.paymentMethod || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">₹{inv.finalAmount.toLocaleString()}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${inv.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : inv.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;
