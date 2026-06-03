import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Reports from './pages/Reports';
import CreateReport from './pages/CreateReport';
import Doctors from './pages/Doctors';
import DoctorAnalytics from './pages/DoctorAnalytics';
import Tests from './pages/Tests';
import Billing from './pages/Billing';
import PrintReport from './pages/PrintReport';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import ReportLookup from './pages/ReportLookup';
import PublicPrint from './pages/PublicPrint';
import PublicWelcome from './pages/PublicWelcome';
import PublicAppointment from './pages/PublicAppointment';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicWelcome />} />
      <Route path="/report-lookup" element={<ReportLookup />} />
      <Route path="/book-appointment" element={<PublicAppointment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/public-print/:reportNumber" element={<PublicPrint />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
      <Route path="/doctors/analytics" element={<ProtectedRoute><DoctorAnalytics /></ProtectedRoute>} />
      <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/reports/new" element={<ProtectedRoute><CreateReport /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      <Route path="/print/:id" element={<ProtectedRoute><PrintReport /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
