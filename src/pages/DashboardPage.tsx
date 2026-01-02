import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JudgeDashboard } from './dashboards/JudgeDashboard';
import { RegistrarDashboard } from './dashboards/RegistrarDashboard';
import { ClerkDashboard } from './dashboards/ClerkDashboard';
import { LawyerDashboard } from './dashboards/LawyerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { PartnerDashboard } from './dashboards/PartnerDashboard';
import { CourtAdminDashboard } from './dashboards/CourtAdminDashboard';
import { ITAdminDashboard } from './dashboards/ITAdminDashboard';
import { AuditorDashboard } from './dashboards/AuditorDashboard';
export function DashboardPage() {
  const {
    user
  } = useAuth();
  if (!user) {
    return null;
  }
  // Render the appropriate dashboard based on user role
  switch (user.role) {
    case 'judge':
      return <JudgeDashboard />;
    case 'registrar':
      return <RegistrarDashboard />;
    case 'clerk':
      return <ClerkDashboard />;
    case 'lawyer':
      return <LawyerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'court_admin':
      return <CourtAdminDashboard />;
    case 'it_admin':
      return <ITAdminDashboard />;
    case 'auditor':
      return <AuditorDashboard />;
    case 'partner':
      return <PartnerDashboard />;
    default:
      // Fallback for unknown roles or if role is missing
      return <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to CourtManager
          </h2>
          <p className="text-slate-500 mb-6">
            Please contact your administrator to assign a role to your account.
          </p>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-mono text-slate-600">
              Current Role: {user.role || 'None'}
            </p>
          </div>
        </div>;
  }
}