import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, HeartPulse } from 'lucide-react';

const API_BASE = 'https://sana-pathology-backend.onrender.com';

const Login = () => {
  const [activeTab, setActiveTab] = useState('PATIENT'); // STAFF, DOCTOR, PATIENT
  const [isRegisteringDoctor, setIsRegisteringDoctor] = useState(false);
  const [isRegisteringStaff, setIsRegisteringStaff] = useState(false);
  const [isRecoveringId, setIsRecoveringId] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  
  const [docName, setDocName] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [recoverFullName, setRecoverFullName] = useState('');
  const [recoveredId, setRecoveredId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRecoveredId('');
    setLoading(true);
    try {
      if (isRegisteringStaff) {
        const response = await fetch(API_BASE + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: regName, phone: regPhone, role: 'ADMIN' })
        });
        const data = await response.json();
        if (response.ok) {
          setSuccess('Staff account created! Please sign in with your credentials.');
          setIsRegisteringStaff(false);
          setRegName('');
          setRegPhone('');
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      }

      if (isRegisteringDoctor) {
        const response = await fetch(API_BASE + '/api/auth/register/doctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: docName, mobileNumber, clinicName: docClinic })
        });
        const data = await response.json();
        if (response.ok) {
          setSuccess(data.message + ` Your ID is: ${data.doctorId}`);
          setIsRegisteringDoctor(false);
          setMobileNumber('');
          setDocName('');
          setDocClinic('');
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      }

      if (isRecoveringId) {
        if (activeTab === 'STAFF') {
          setError('Please contact the Lab Admin to reset your staff password.');
          setLoading(false);
          return;
        }

        const endpoint = activeTab === 'PATIENT' ? '/api/auth/recover/patient' : '/api/auth/recover/doctor';
        const response = await fetch(API_BASE + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber, fullName: recoverFullName })
        });
        const data = await response.json();
        if (response.ok) {
          setRecoveredId(data.id);
          setSuccess('ID found successfully!');
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      }

      let endpoint = '';
      let bodyData = {};

      if (activeTab === 'STAFF') {
        endpoint = '/api/auth/login';
        bodyData = { email, password };
      } else if (activeTab === 'PATIENT') {
        endpoint = '/api/auth/login/patient';
        bodyData = { mobileNumber, patientId };
      } else if (activeTab === 'DOCTOR') {
        endpoint = '/api/auth/login/doctor';
        bodyData = { mobileNumber, doctorId };
      }

      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await response.json();
      if (response.ok) {
        login(data);
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'PATIENT', label: 'Patient', icon: HeartPulse },
    { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
    { id: 'STAFF', label: 'Staff / Admin', icon: User },
  ];

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f0f4f8]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#00488d] mb-1">Sana Pathology</h1>
          <p className="text-gray-500 font-medium">{isRegisteringDoctor ? 'Register as Doctor' : isRegisteringStaff ? 'Register Staff Account' : 'Sign in to your account'}</p>
        </div>

        {!isRegisteringDoctor && !isRegisteringStaff && !isRecoveringId && (
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); setRecoveredId(''); setIsRecoveringId(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                    isActive ? 'bg-white text-[#00488d] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold border border-red-100">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-100">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* RECOVERY MODAL */}
          {isRecoveringId && (
            <>
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">
                  {activeTab === 'STAFF' ? 'Recover Staff Password' : `Recover ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} ID`}
                </p>
                {activeTab === 'STAFF' ? (
                  <p className="text-sm text-gray-500">Staff passwords cannot be recovered online. Please contact the Lab Admin.</p>
                ) : (
                  <p className="text-sm text-gray-500">Please enter your exact full name and registered mobile number to securely retrieve your ID.</p>
                )}
              </div>
              
              {activeTab !== 'STAFF' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Exact Full Name</label>
                    <input type="text" value={recoverFullName} onChange={(e) => setRecoverFullName(e.target.value)} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Registered Mobile Number</label>
                    <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
                  </div>
                </>
              )}

              {recoveredId && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-700 font-bold mb-1">Your ID is:</p>
                  <p className="text-2xl font-black text-[#00488d]">{recoveredId}</p>
                </div>
              )}
              
              <div className="text-center mt-6">
                <button type="button" onClick={() => { setIsRecoveringId(false); setRecoveredId(''); setError(''); setSuccess(''); }} className="text-sm text-[#00488d] font-semibold hover:underline">
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* STAFF REGISTRATION */}
          {activeTab === 'STAFF' && isRegisteringStaff && !isRecoveringId && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setIsRegisteringStaff(false)} className="text-sm text-[#00488d] font-semibold hover:underline">
                  Already have an account? Sign in
                </button>
              </div>
            </>
          )}

          {/* STAFF LOGIN */}
          {activeTab === 'STAFF' && !isRegisteringDoctor && !isRegisteringStaff && !isRecoveringId && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Login ID (Staff ID or Email)</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => { setIsRegisteringStaff(true); setError(''); setSuccess(''); }} className="text-sm text-[#00488d] font-semibold hover:underline">
                  First time? Register new account
                </button>
              </div>
            </>
          )}

          {/* PATIENT LOGIN */}
          {activeTab === 'PATIENT' && !isRegisteringDoctor && !isRecoveringId && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Patient ID (e.g. SPL-0001)</label>
                <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent uppercase" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
            </>
          )}

          {/* DOCTOR LOGIN */}
          {activeTab === 'DOCTOR' && !isRegisteringDoctor && !isRecoveringId && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Doctor ID (e.g. DOC-0001)</label>
                <input type="text" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent uppercase" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setIsRegisteringDoctor(true)} className="text-sm text-[#00488d] font-semibold hover:underline">
                  Don't have an ID? Register here.
                </button>
              </div>
            </>
          )}

          {/* DOCTOR REGISTRATION */}
          {isRegisteringDoctor && !isRecoveringId && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name (with Dr.)</label>
                <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Clinic / Hospital Name</label>
                <input type="text" value={docClinic} onChange={(e) => setDocClinic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00488d] focus:border-transparent" />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setIsRegisteringDoctor(false)} className="text-sm text-gray-500 font-semibold hover:underline">
                  Back to Login
                </button>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading || (isRecoveringId && activeTab === 'STAFF')}
            className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#00488d] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00488d] transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRecoveringId ? 'Find My ID' : (isRegisteringDoctor || isRegisteringStaff ? 'Register' : 'Sign In'))}
          </button>
        </form>

        {!isRecoveringId && !isRegisteringDoctor && !isRegisteringStaff && (
          <div className="text-center mt-4">
            <button type="button" onClick={() => { setIsRecoveringId(true); setError(''); setSuccess(''); }} className="text-xs text-gray-500 font-semibold hover:text-[#00488d] hover:underline">
              Forgot ID / Password?
            </button>
          </div>
        )}
        
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-[#00488d]">
            ← Back to Public Report Lookup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
