import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
<<<<<<< HEAD
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
=======
export function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const {
    user
  } = useAuth();
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}