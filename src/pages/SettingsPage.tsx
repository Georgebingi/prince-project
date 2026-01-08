import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, Bell, Camera, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export function SettingsPage() {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'Hon. Justice Ibrahim',
    email: 'ibrahim.musa@court.kd.gov.ng',
    phone: '+234 800 123 4567',
    bio: 'High Court Judge serving since 2015. Specializing in Criminal and Civil Law.'
  });
  // Profile Picture State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
      alert('Password updated successfully!');
    }, 1000);
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return <Layout title="Account Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500">
              Manage your account preferences and security
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </div>
          </button>
          <button onClick={() => setActiveTab('security')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </div>
          </button>
          <button onClick={() => setActiveTab('preferences')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preferences' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Preferences
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'profile' && <Card>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden group">
                      {profileImage ? <img src={profileImage} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400">
                          <User className="h-16 w-16" />
                        </div>}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                        <input id="profile-image-upload" name="profile-image-upload" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} aria-label="Upload profile image" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Click to upload new picture
                    </p>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" value={profileData.fullName} onChange={e => setProfileData({
                    ...profileData,
                    fullName: e.target.value
                  })} />
                      <Input label="Email Address" value={profileData.email} disabled className="bg-slate-50 text-slate-500" />
                    </div>
                    <Input label="Phone Number" value={profileData.phone} onChange={e => setProfileData({
                  ...profileData,
                  phone: e.target.value
                })} />
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                        Bio
                      </label>
                      <textarea id="bio" name="bio" className="w-full rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]" value={profileData.bio} onChange={e => setProfileData({
                    ...profileData,
                    bio: e.target.value
                  })} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" isLoading={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>}

          {activeTab === 'security' && <Card>
              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                <h3 className="text-lg font-medium text-slate-900">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <Input label="Current Password" type="password" value={passwords.current} onChange={e => setPasswords({
                ...passwords,
                current: e.target.value
              })} required />
                  <Input label="New Password" type="password" value={passwords.new} onChange={e => setPasswords({
                ...passwords,
                new: e.target.value
              })} required />
                  <Input label="Confirm New Password" type="password" value={passwords.confirm} onChange={e => setPasswords({
                ...passwords,
                confirm: e.target.value
              })} required />
                </div>
                <div className="pt-4">
                  <Button type="submit" isLoading={isLoading}>
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>}

          {activeTab === 'preferences' && <Card>
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-900">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {['Email notifications for new cases', 'SMS alerts for urgent hearings', 'Weekly digest reports', 'System maintenance updates'].map((pref, i) => <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" />
                      <span className="text-slate-700">{pref}</span>
                    </label>)}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Button onClick={() => alert('Preferences saved!')}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>}
        </div>
      </div>
    </Layout>;
}