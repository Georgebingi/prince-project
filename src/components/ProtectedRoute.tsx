import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const {
    user,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
