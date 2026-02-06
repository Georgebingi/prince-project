import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
<<<<<<< HEAD
import { User, Lock, ChevronRight, ShieldCheck, ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { LoadingButton } from '../components/ui/LoadingButton';
=======
import {
  User,
  Lock,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Mail,
  AlertCircle } from
'lucide-react';
import { Button } from '../components/ui/Button';
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('judge');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (username && password) {
        login(role, username);
        navigate('/dashboard');
      } else {
        setError('Please enter both username and password');
        setIsLoading(false);
      }
    }, 800);
  };
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setResetSuccess(true);
      setIsLoading(false);
    }, 1500);
  };
  const roleOptions = [
  {
    value: 'judge',
    label: 'Judge / Magistrate'
  },
  {
    value: 'registrar',
    label: 'Court Registrar'
  },
  {
    value: 'clerk',
    label: 'Court Clerk'
  },
  {
    value: 'admin',
    label: 'System Administrator'
  },
  {
    value: 'lawyer',
    label: 'Legal Practitioner'
  },
  {
    value: 'auditor',
    label: 'Auditor'
  }];
<<<<<<< HEAD
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Green accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-white to-green-600" aria-hidden />
=======

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Green accent top bar */}
      <div className="h-2 bg-gradient-to-r from-green-600 via-white to-green-600"></div>
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              {view === 'login' ? 'Welcome Back' : 'Reset Password'}
            </h2>
            <p className="mt-2 text-slate-600">
              {view === 'login' ?
              'Sign in to access the Kaduna State Court Management System' :
              'Enter your email to receive password reset instructions'}
            </p>
          </div>

          <Card className="p-8 shadow-xl border-slate-200">
            {view === 'login' ?
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Select
                  label="Select Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  options={roleOptions} />

                </div>

                <div className="space-y-4">
                  <Input
                  label="Username / Staff ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your ID"
                  icon={<User className="h-5 w-5" />} />


                  <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<Lock className="h-5 w-5" />} />

                </div>

                {error &&
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
              }

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded" />

                    <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-600">

                      Remember me
                    </label>
                  </div>

                  <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="text-sm font-medium text-primary hover:text-blue-700">

                    Forgot password?
                  </button>
                </div>

                <Button
                type="submit"
                className="w-full justify-center py-2.5 text-base"
                disabled={isLoading}>

                  {isLoading ?
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

                <>
                      Sign In <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                }
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Don't have an account?{' '}
                    <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="font-medium text-primary hover:text-blue-700">

                      Register here
                    </button>
                  </p>
                </div>
              </form> :

            <div className="space-y-6">
                {!resetSuccess ?
              <form onSubmit={handleResetPassword} className="space-y-6">
                    <Input
                  label="Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  icon={<Mail className="h-5 w-5" />} />


                    {error &&
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                }

                    <Button
                  type="submit"
                  className="w-full justify-center py-2.5 text-base"
                  disabled={isLoading}>

                      {isLoading ?
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

                  'Send Reset Link'
                  }
                    </Button>
                  </form> :

              <div className="text-center py-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">
                      Check your email
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      We've sent password reset instructions to{' '}
                      <strong>{resetEmail}</strong>
                    </p>
                  </div>
              }

                <div className="text-center">
                  <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setResetSuccess(false);
                    setResetEmail('');
                    setError('');
                  }}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mx-auto">

                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                </div>
              </div>
            }
          </Card>

          <p className="text-center text-xs text-slate-500">
            © 2024 Kaduna State Judiciary. All rights reserved.
          </p>
        </div>
<<<<<<< HEAD
    </div>;
=======
      </div>
    </div>);

>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
}