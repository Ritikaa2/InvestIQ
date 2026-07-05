import React, { useState } from 'react';
import { useAuth, API_ORIGIN } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Profile Form States
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(localStorage.getItem(`phone_${user?.id}`) || '+1 (555) 019-2834');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      // Save phone number locally since it isn't in core DB schema
      localStorage.setItem(`phone_${user?.id}`, phone);

      const success = await updateProfile(formData);
      if (success) {
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.put('/profile', { password: data.newPassword });
      if (response.data.success) {
        toast.success('Password updated successfully.');
        reset();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">
          User Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identifiers, contact details, profile picture, and account credentials.
        </p>
      </div>

      <div className="glass-panel overflow-hidden bg-white dark:bg-slate-900/60 shadow-xl border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex flex-col md:flex-row min-h-[480px]">
        
        {/* Left Side Tab Navigation */}
        <div className="w-full md:w-64 border-r border-slate-200/50 dark:border-slate-800/30 p-6 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'profile' 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Profile Information
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'password' 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30'
              }`}
            >
              <KeyIcon className="w-4 h-4" />
              Change Password
            </button>
          </div>

          {/* User Quick Info */}
          <div className="hidden md:flex items-center gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-800/30">
            <img 
              src={avatarPreview || (user?.avatar_url?.startsWith('/') ? `${API_ORIGIN}${user.avatar_url}` : user?.avatar_url)} 
              alt="avatar" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.username}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Right Side Settings Panel */}
        <div className="flex-grow p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.form 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleProfileSubmit}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Profile Information
                </h3>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  
                  {/* Left Form Inputs */}
                  <div className="flex-grow w-full space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name / Username
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. John Doe"
                          required
                          className="w-full glass-input pl-10 pr-4 py-2 text-xs" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          disabled
                          className="w-full glass-input pl-10 pr-4 py-2 text-xs bg-slate-100/50 dark:bg-slate-900/50 cursor-not-allowed text-slate-400" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full glass-input pl-10 pr-4 py-2 text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Avatar Uploader */}
                  <div className="w-48 shrink-0 flex flex-col items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start md:self-center">
                      Profile Picture
                    </span>
                    <div className="relative group">
                      <img 
                        src={avatarPreview || (user?.avatar_url?.startsWith('/') ? `${API_ORIGIN}${user.avatar_url}` : user?.avatar_url)} 
                        alt="avatar" 
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md group-hover:opacity-90 transition-opacity"
                      />
                      <label className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white rounded-full flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <CloudArrowUpIcon className="w-6 h-6 mb-1" />
                        <span className="text-[9px] font-semibold">Change Photo</span>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </div>
                    {avatarFile && (
                      <span className="text-[10px] text-brand-500 font-semibold italic animate-pulse">New avatar staged</span>
                    )}
                  </div>

                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    {isSavingProfile ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit(handlePasswordSubmit)}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Change Password
                </h3>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full glass-input px-3 py-2 text-xs" 
                      {...register('newPassword', { 
                        required: 'New password is required', 
                        minLength: { value: 6, message: 'Password must be at least 6 characters long' } 
                      })}
                    />
                    {errors.newPassword && <span className="text-[9px] text-red-500 mt-1 block">{errors.newPassword.message}</span>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full glass-input px-3 py-2 text-xs" 
                      {...register('confirmPassword', { 
                        required: 'Please confirm password' 
                      })}
                    />
                    {errors.confirmPassword && <span className="text-[9px] text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default Profile;
