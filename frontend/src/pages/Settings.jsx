import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ORIGIN, useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useForm } from 'react-hook-form';
import { 
  Cog6ToothIcon, 
  TrashIcon, 
  LockClosedIcon, 
  UserIcon, 
  BellIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();

  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register: passRegister, handleSubmit: handlePassSubmit, reset: resetPass, formState: { errors: passErrors } } = useForm();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    
    const formData = new FormData();
    if (username) formData.append('username', username);
    if (avatarFile) formData.append('avatar', avatarFile);

    const success = await updateProfile(formData);
    if (success) {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const notifications_enabled = e.target.notifications.checked;
    
    try {
      const response = await api.put('/settings', {
        theme,
        language: locale,
        notifications_enabled
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error('Failed to update settings preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  const changePassword = async (data) => {
    setUpdatingPassword(true);
    try {
      const response = await api.put('/profile', { password: data.newPassword });
      if (response.data.success) {
        toast.success('Password updated successfully.');
        resetPass();
      }
    } catch (err) {
      toast.error('Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('WARNING: Deleting your account will permanently remove all search history, saved reports, and watchlist bookmarks. This action CANNOT be undone. Proceed?')) return;
    
    try {
      const response = await api.delete('/settings/delete-account');
      if (response.data.success) {
        toast.success('Account deleted successfully.');
        logout();
        navigate('/');
      }
    } catch (err) {
      toast.error('Failed to delete account.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">{t('settings')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure theme, language translations, and manage profile security details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side Profile Card */}
        <div className="md:col-span-1 glass-panel p-5 text-center flex flex-col items-center justify-between h-fit">
          <div className="w-full flex flex-col items-center">
            <div className="relative mb-4">
              <img 
                src={avatarPreview || (user?.avatar_url?.startsWith('/') ? `${API_ORIGIN}${user.avatar_url}` : user?.avatar_url)} 
                alt="avatar" 
                className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/20"
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full cursor-pointer shadow-md">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <Cog6ToothIcon className="w-4 h-4" />
              </label>
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{user?.username}</h3>
            <span className="text-[10px] text-slate-400">{user?.email}</span>
          </div>

          <form onSubmit={handleProfileUpdate} className="w-full mt-6 space-y-3.5 text-left">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Modify Username</label>
              <input type="text" name="username" defaultValue={user?.username} className="w-full glass-input px-3 py-1.5 text-xs" />
            </div>
            {(avatarFile || avatarPreview) && (
              <div className="text-[10px] text-brand-500 font-semibold italic text-center">New avatar image staged for upload.</div>
            )}
            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-md">
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Right Side config boxes */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Preferences Settings */}
          <div className="glass-panel p-5">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><PaintBrushIcon className="w-5 h-5 text-brand-500" /> Preferences</h4>
            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Interface Theme</label>
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full glass-input px-3 py-1.5 text-xs cursor-pointer"
                  >
                    <option value="dark" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">Dark Premium Theme</option>
                    <option value="light" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">Light Clean Theme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">System Language</label>
                  <select 
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full glass-input px-3 py-1.5 text-xs cursor-pointer"
                  >
                    <option value="en" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">English (EN)</option>
                    <option value="es" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">EspaÃ±ol (ES)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  defaultChecked={true}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500/20"
                />
                <label htmlFor="notifications" className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><BellIcon className="w-4 h-4" /> Enable system audit notifications</label>
              </div>

              <button type="submit" disabled={savingSettings} className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition-all">
                {savingSettings ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-panel p-5">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><LockClosedIcon className="w-5 h-5 text-indigo-500" /> Security Credentials</h4>
            <form onSubmit={handlePassSubmit(changePassword)} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="--------"
                    className="w-full glass-input px-3 py-1.5 text-xs" 
                    {...passRegister('newPassword', { required: 'Password is required', minLength: { value: 6, message: 'Must be 6+ chars' } })}
                  />
                  {passErrors.newPassword && <span className="text-[9px] text-red-500 mt-0.5 block">{passErrors.newPassword.message}</span>}
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Verify Password</label>
                  <input 
                    type="password" 
                    placeholder="--------"
                    className="w-full glass-input px-3 py-1.5 text-xs" 
                    {...passRegister('confirmPassword', { required: 'Please confirm password' })}
                  />
                </div>
              </div>

              <button type="submit" disabled={updatingPassword} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition-all">
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-5 border-red-500/20 dark:border-red-950/20 bg-red-500/5">
            <h4 className="font-bold text-sm text-red-600 mb-2 flex items-center gap-2"><TrashIcon className="w-5 h-5 text-red-500 animate-pulse" /> Danger Zone</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">Deleting your account is permanent. All historical reports, user credentials, and active watchlist bookmarks will be destroyed.</p>
            <button onClick={deleteAccount} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md">
              Delete Account Permanently
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;




