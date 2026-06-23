import React, { useContext, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

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
const ActivityLog = lazy(() => import('./pages/ActivityLog'));
const Packages = lazy(() => import('./pages/Packages'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const TestsCatalog = lazy(() => import('./pages/TestsCatalog'));
const Blog = lazy(() => import('./pages/Blog'));
const Corporate = lazy(() => import('./pages/Corporate'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const Collections = lazy(() => import('./pages/Collections'));
const TrackPhlebotomist = lazy(() => import('./pages/TrackPhlebotomist'));
const Track = lazy(() => import('./pages/Track'));
const Offers = lazy(() => import('./pages/Offers'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const PackagesPublic = lazy(() => import('./pages/PackagesPublic'));
const UploadPrescription = lazy(() => import('./pages/UploadPrescription'));
const DoctorExperts = lazy(() => import('./pages/DoctorExperts'));
const LabTour = lazy(() => import('./pages/LabTour'));
const HealthCalculators = lazy(() => import('./pages/HealthCalculators'));
const CityPages = lazy(() => import('./pages/CityPages'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const WhyUs = lazy(() => import('./pages/WhyUs'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const TestFinderPage = lazy(() => import('./pages/TestFinderPage'));
const BookOnlinePage = lazy(() => import('./pages/BookOnlinePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

import Loader from './components/Loader';
import { syncOfflineRequests } from './utils/offlineSync';

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader type="page" size="md" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Spinner />;

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicWelcome />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/test-finder" element={<TestFinderPage />} />
        <Route path="/book-online" element={<BookOnlinePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/book-appointment" element={<PublicAppointment />} />
        <Route path="/report-lookup" element={<ReportLookup />} />
        <Route path="/public-print/:reportNumber" element={<PublicPrint />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/tests-catalog" element={<TestsCatalog />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/corporate" element={<Corporate />} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/track/:bookingId" element={<TrackPhlebotomist />} />
        <Route path="/track" element={<Track />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/health-packages" element={<PackagesPublic />} />
        <Route path="/upload-prescription" element={<UploadPrescription />} />
        <Route path="/our-doctors" element={<DoctorExperts />} />
        <Route path="/lab-tour" element={<LabTour />} />
        <Route path="/health-calculators" element={<HealthCalculators />} />
        {/* City SEO Pages */}
        <Route path="/blood-test-sambhal" element={<CityPages />} />
        <Route path="/blood-test-chandausi" element={<CityPages />} />
        <Route path="/blood-test-bahjoi" element={<CityPages />} />
        <Route path="/blood-test-sirsi" element={<CityPages />} />
        <Route path="/home-collection-sambhal" element={<CityPages />} />
        {/* Patient Dashboard (Public, OTP-secured) */}
        <Route path="/my-health" element={<PatientDashboard />} />
        
        {/* Protected dashboard and portal routes */}
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
        <Route path="/dashboard/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="/dashboard/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
        <Route path="/widal" element={<ProtectedRoute><WidalTest /></ProtectedRoute>} />

        {/* Catch-all redirect to root */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineRequests();
    };
    window.addEventListener('online', handleOnline);
    // Try syncing on initial load if online
    if (navigator.onLine) {
      syncOfflineRequests();
    }
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
