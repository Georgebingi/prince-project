<<<<<<< HEAD
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation } from
'react-router-dom';
=======
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CasesProvider } from './contexts/CasesContext';
import { StaffProvider } from './contexts/StaffContext';
import { SystemProvider } from './contexts/SystemContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatWidget } from './components/ChatWidget';
<<<<<<< HEAD
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { WelcomePage } from './pages/WelcomePage';
=======
import { LoadingOverlay } from './components/LoadingOverlay';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
<<<<<<< HEAD
import { WelcomePage } from './pages/WelcomePage';
=======
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
// Dashboards
import { JudgeDashboard } from './pages/dashboards/JudgeDashboard';
import { RegistrarDashboard } from './pages/dashboards/RegistrarDashboard';
import { ClerkDashboard } from './pages/dashboards/ClerkDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { LawyerDashboard } from './pages/dashboards/LawyerDashboard';
import { PartnerDashboard } from './pages/dashboards/PartnerDashboard';
// Functional Pages
import { CaseManagementPage } from './pages/CaseManagementPage';
import { DocumentRepositoryPage } from './pages/DocumentRepositoryPage';
import { StaffRegistrationPage } from './pages/StaffRegistrationPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { PartnerInteroperabilityPage } from './pages/PartnerInteroperabilityPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
// New Pages
import { SettingsPage } from './pages/SettingsPage';
import { WriteJudgmentPage } from './pages/WriteJudgmentPage';
import { ReviewMotionsPage } from './pages/ReviewMotionsPage';
import { SignOrdersPage } from './pages/SignOrdersPage';
function DashboardRouter() {
<<<<<<< HEAD
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
=======
  const {
    user
  } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  }
  // Route to role-specific dashboard
  switch (user.role) {
    case 'judge':
      return <JudgeDashboard />;
    case 'registrar':
      return <RegistrarDashboard />;
    case 'clerk':
      return <ClerkDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'it_admin':
      return <AdminDashboard />;
    case 'court_admin':
      return <AdminDashboard />;
    case 'lawyer':
      return <LawyerDashboard />;
    case 'auditor':
      return <AdminDashboard />;
    case 'partner':
      return <PartnerDashboard />;
    default:
<<<<<<< HEAD
      return <Navigate to="/login" replace />;
  }
}
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  // Only show chat widget if user is logged in and not on public pages
  const showChat =
  user && !['/', '/login', '/signup'].includes(location.pathname);
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
          <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />

        <Route
          path="/cases"
          element={
          <ProtectedRoute>
              <CaseManagementPage />
            </ProtectedRoute>
          } />

        <Route
          path="/cases/:id"
          element={
          <ProtectedRoute>
              <CaseDetailPage />
            </ProtectedRoute>
          } />

        <Route
          path="/documents"
          element={
          <ProtectedRoute>
              <DocumentRepositoryPage />
            </ProtectedRoute>
          } />

        <Route
          path="/staff"
          element={
          <ProtectedRoute>
              <StaffRegistrationPage />
            </ProtectedRoute>
          } />

        <Route
          path="/reports"
          element={
          <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />

        <Route
          path="/audit"
          element={
          <ProtectedRoute>
              <AuditLogPage />
            </ProtectedRoute>
          } />

        <Route
          path="/interoperability"
          element={
          <ProtectedRoute>
              <PartnerInteroperabilityPage />
            </ProtectedRoute>
          } />

        <Route
          path="/settings"
          element={
          <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

        <Route
          path="/write-judgment"
          element={
          <ProtectedRoute>
              <WriteJudgmentPage />
            </ProtectedRoute>
          } />

        <Route
          path="/review-motions"
          element={
          <ProtectedRoute>
              <ReviewMotionsPage />
            </ProtectedRoute>
          } />

        <Route
          path="/sign-orders"
          element={
          <ProtectedRoute>
              <SignOrdersPage />
            </ProtectedRoute>
          } />

=======
      return <Navigate to="/" replace />;
  }
}
function AppContent() {
  const {
    user,
    isLoading: authLoading
  } = useAuth();
  const location = useLocation();
  // Only show chat widget if user is logged in and not on login/signup pages
  const showChat = user && !['/', '/login', '/signup'].includes(location.pathname);
  return <>
      <LoadingOverlay isLoading={authLoading} text="Authenticating..." />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>} />
        <Route path="/cases" element={<ProtectedRoute>
              <CaseManagementPage />
            </ProtectedRoute>} />
        <Route path="/cases/:id" element={<ProtectedRoute>
              <CaseDetailPage />
            </ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute>
              <DocumentRepositoryPage />
            </ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute>
              <StaffRegistrationPage />
            </ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute>
              <AuditLogPage />
            </ProtectedRoute>} />
        <Route path="/interoperability" element={<ProtectedRoute>
              <PartnerInteroperabilityPage />
            </ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>} />
        <Route path="/write-judgment" element={<ProtectedRoute>
              <WriteJudgmentPage />
            </ProtectedRoute>} />
        <Route path="/review-motions" element={<ProtectedRoute>
              <ReviewMotionsPage />
            </ProtectedRoute>} />
        <Route path="/sign-orders" element={<ProtectedRoute>
              <SignOrdersPage />
            </ProtectedRoute>} />
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showChat && <ChatWidget />}
<<<<<<< HEAD
    </>);

}
export function App() {
  return (
    <AuthProvider>
=======
    </>;
}
export function App() {
  return <AuthProvider>
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
      <SystemProvider>
        <StaffProvider>
          <CasesProvider>
            <ChatProvider>
<<<<<<< HEAD
              <Router>
=======
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
                <AppContent />
              </Router>
            </ChatProvider>
          </CasesProvider>
        </StaffProvider>
      </SystemProvider>
<<<<<<< HEAD
    </AuthProvider>);

=======
    </AuthProvider>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}