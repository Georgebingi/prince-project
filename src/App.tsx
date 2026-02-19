// ======================================================
// App.tsx - Main Application Entry Point
// ======================================================

import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { CasesProvider } from './contexts/CasesContext';
import { StaffProvider } from './contexts/StaffContext';
import { SystemProvider } from './contexts/SystemContext';
import { ChatProvider } from './contexts/ChatContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatWidget } from './components/ChatWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { queryClient } from './queryClient';
import { initPerformanceMonitoring } from './utils/performance';

// ======================================================
// Eagerly Loaded Pages
// ======================================================
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { WelcomePage } from './pages/WelcomePage';

// ======================================================
// Lazy Loaded Dashboard Pages
// ======================================================
const JudgeDashboard = lazy(() => import('./pages/dashboards/JudgeDashboard'));
const RegistrarDashboard = lazy(() => import('./pages/dashboards/RegistrarDashboard'));
const ClerkDashboard = lazy(() => import('./pages/dashboards/ClerkDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const LawyerDashboard = lazy(() => import('./pages/dashboards/LawyerDashboard'));
const PartnerDashboard = lazy(() => import('./pages/dashboards/PartnerDashboard'));
const CourtAdminDashboard = lazy(() => import('./pages/dashboards/CourtAdminDashboard'));
const ITAdminDashboard = lazy(() => import('./pages/dashboards/ITAdminDashboard'));
const AuditorDashboard = lazy(() => import('./pages/dashboards/AuditorDashboard'));

// ======================================================
// Lazy Loaded Functional Pages
// ======================================================
const CaseManagementPage = lazy(() => import('./pages/CaseManagementPage'));
const DocumentRepositoryPage = lazy(() => import('./pages/DocumentRepositoryPage'));
const StaffRegistrationPage = lazy(() => import('./pages/StaffRegistrationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const PartnerInteroperabilityPage = lazy(() => import('./pages/PartnerInteroperabilityPage'));
const CaseDetailPage = lazy(() => import('./pages/CaseDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WriteJudgmentPage = lazy(() => import('./pages/WriteJudgmentPage'));
const ReviewMotionsPage = lazy(() => import('./pages/ReviewMotionsPage'));
const SignOrdersPage = lazy(() => import('./pages/SignOrdersPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));

// ======================================================
// Initialize Performance Monitoring
// ======================================================
initPerformanceMonitoring();

// ======================================================
// Page Loader Component (Suspense Fallback)
// ======================================================
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-secondary text-sm">Loading...</p>
    </div>
  </div>
);

// ======================================================
// Protected Route Wrapper
// ======================================================
export function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />; // Allows nested routes to render
}

// ======================================================
// Dashboard Router
// ======================================================

function DashboardRouter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Store current route for refresh persistence
  useEffect(() => {
    if (user && !['/', '/login', '/signup'].includes(location.pathname)) {
      localStorage.setItem('court_last_route', location.pathname + location.search);
    }
  }, [location, user]);

  // Redirect to stored route on refresh if authenticated
  useEffect(() => {
    if (user) {
      const lastRoute = localStorage.getItem('court_last_route');
      if (lastRoute && location.pathname === '/dashboard') {
        navigate(lastRoute, { replace: true });
      }
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;

  switch (user.role) {
    case 'judge': return <JudgeDashboard />;
    case 'registrar': return <RegistrarDashboard />;
    case 'clerk': return <ClerkDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'it_admin': return <ITAdminDashboard />;
    case 'court_admin': return <CourtAdminDashboard />;
    case 'auditor': return <AuditorDashboard />;
    case 'lawyer': return <LawyerDashboard />;
    case 'partner': return <PartnerDashboard />;
    default: return <Navigate to="/login" replace />;
  }
}


// ======================================================
// App Content (All Routes)
// ======================================================
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const { toasts, removeToast } = useToast();

  const showChat = user && !['/', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Routes>
        {/* ====================================================== */}
        {/* Public Pages */}
        {/* ====================================================== */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* ====================================================== */}
        {/* Protected Routes */}
        {/* ====================================================== */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardRouter />
              </Suspense>
            }
          />
          <Route
            path="/cases"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <CaseManagementPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <CaseDetailPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/documents"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <DocumentRepositoryPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/staff"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <StaffRegistrationPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/reports"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <ReportsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/audit"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AuditLogPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/interoperability"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <PartnerInteroperabilityPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <SettingsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/write-judgment"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <WriteJudgmentPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/review-motions"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <ReviewMotionsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/sign-orders"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <SignOrdersPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <CalendarPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
        </Route>

        {/* ====================================================== */}
        {/* Catch-all Route */}
        {/* ====================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showChat && <ChatWidget />}
    </>
  );
}

// ======================================================
// Main App Component
// ======================================================
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <SocketProvider>
            <SystemProvider>
              <StaffProvider>
                <CasesProvider>
                  <ChatProvider>
                    <AppContent />
                  </ChatProvider>
                </CasesProvider>
              </StaffProvider>
            </SystemProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// ======================================================
// End of App.tsx
// ======================================================
