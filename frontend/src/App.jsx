import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const PatientProfile = lazy(() => import('./pages/PatientProfile'));
const Reports = lazy(() => import('./pages/Reports'));
const CreateReport = lazy(() => import('./pages/CreateReport'));
const Doctors = lazy(() => import('./pages/Doctors'));
const DoctorAnalytics = lazy(() => import('./pages/DoctorAnalytics'));
const Tests = lazy(() => import('./pages/Tests'));
const Billing = lazy(() => import('./pages/Billing'));
const PrintReport = lazy(() => import('./pages/PrintReport'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Staff = lazy(() => import('./pages/Staff'));
const Settings = lazy(() => import('./pages/Settings'));
const WidalTest = lazy(() => import('./pages/WidalTest'));
const ReportLookup = lazy(() => import('./pages/ReportLookup'));
const PublicPrint = lazy(() => import('./pages/PublicPrint'));
const PublicWelcome = lazy(() => import('./pages/PublicWelcome'));
const PublicAppointment = lazy(() => import('./pages/PublicAppointment'));

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-[#00488d] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  return (
    <Suspense fallback={<Spinner />}>
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
        <Route path="/widal" element={<ProtectedRoute><WidalTest /></ProtectedRoute>} />
      </Routes>
    </Suspense>
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
