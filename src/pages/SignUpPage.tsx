import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  User,
  Lock,
  Mail,
  Phone,
  Shield,
  Building,
  ArrowLeft,
  Code2 } from
'lucide-react';
export function SignUpPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    staffId: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      alert('Registration successful! Please wait for admin approval.');
      navigate('/');
    }, 2000);
  };
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const logos = [
  {
    name: 'Kaduna State',
    url: "/1000491869.jpg",
    alt: 'Kaduna State Logo'
  },
  {
    name: 'High Court',
    url: "/1000491875.jpg",
    alt: 'High Court Logo'
  }];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden py-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

      {/* Green accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-white to-green-600"></div>

      <div className="w-full max-w-2xl p-4 relative z-10 flex-1 flex items-center">
        <div className="w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-center mb-4 gap-8 items-center">
              {logos.map((logo, index) =>
              <div
                key={index}
                className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500"
                style={{
                  animationDelay: `${index * 150}ms`
                }}>

                  <img
                  src={logo.url}
                  alt={logo.alt}
                  className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-110" />

                  <span className="text-[9px] text-slate-500 font-medium">
                    {logo.name}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Staff Registration
            </h1>
            <p className="text-sm text-slate-500">
              Kaduna State High Court - Judicial Management System
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Registration requires administrative
                approval. You will be notified once your account is activated.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    placeholder="e.g. Ibrahim Musa Abdullahi"
                    icon={<User className="h-4 w-4" />}
                    value={formData.fullName}
                    onChange={handleChange}
                    required />


                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="email@court.kd.gov.ng"
                    icon={<Mail className="h-4 w-4" />}
                    value={formData.email}
                    onChange={handleChange}
                    required />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    icon={<Phone className="h-4 w-4" />}
                    value={formData.phone}
                    onChange={handleChange}
                    required />


                  <Input
                    label="Staff ID (Optional)"
                    name="staffId"
                    placeholder="KDJ/2024/..."
                    icon={<User className="h-4 w-4" />}
                    value={formData.staffId}
                    onChange={handleChange} />

                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Professional Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Role / Position"
                    name="role"
                    options={[
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
                    }]
                    }
                    icon={<Shield className="h-4 w-4" />}
                    value={formData.role}
                    onChange={handleChange}
                    required />


                  <Select
                    label="Department"
                    name="department"
                    options={[
                    {
                      value: 'judiciary',
                      label: 'Judiciary (Bench)'
                    },
                    {
                      value: 'registry',
                      label: 'Court Registry'
                    },
                    {
                      value: 'admin',
                      label: 'Administration'
                    },
                    {
                      value: 'legal',
                      label: 'Legal Services'
                    },
                    {
                      value: 'it',
                      label: 'IT & Systems'
                    },
                    {
                      value: 'security',
                      label: 'Security'
                    }]
                    }
                    icon={<Building className="h-4 w-4" />}
                    value={formData.department}
                    onChange={handleChange}
                    required />

                </div>
              </div>

              {/* Security */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Account Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={formData.password}
                    onChange={handleChange}
                    required />


                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required />

                </div>

                <p className="text-xs text-slate-500">
                  Password must be at least 8 characters with uppercase,
                  lowercase, number, and special character.
                </p>
              </div>

              {/* Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                    required />

                  <span className="text-sm text-slate-600">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and confirm that all information provided is accurate and
                    truthful.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}>

                Submit Registration
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-sm mb-2">
              <span className="text-slate-600">Already have an account?</span>
              <Link
                to="/login"
                className="text-primary hover:text-blue-700 font-medium flex items-center gap-1">

                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </div>
            <p className="text-xs text-slate-400 text-center">
              © 2024 Kaduna State Judiciary.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-4 relative z-10 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-slate-500">
          <Code2 className="h-3.5 w-3.5" />
          <span className="text-xs">
            Developed by{' '}
            <span className="font-semibold text-slate-700">
              Prince E.N Ebereekpendu
            </span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="font-mono text-[10px] text-slate-400">
              NDAPGS/FMSIS/COM052024/4646
            </span>
          </span>
        </div>
      </footer>
    </div>);

}