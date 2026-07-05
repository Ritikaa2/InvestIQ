import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Switch } from '@headlessui/react';
import { 
  PaintBrushIcon, 
  CpuChipIcon, 
  BellIcon, 
  GlobeAltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings = () => {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing settings on page mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success && response.data.settings) {
          const s = response.data.settings;
          setNotificationsEnabled(Boolean(s.notifications_enabled));
          setSelectedModel(s.ai_model || 'gemini');
        }
      } catch (err) {
        console.error('Failed to load user settings preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (newTheme, newLocale, newNotifs, newModel) => {
    setIsSaving(true);
    try {
      const response = await api.put('/settings', {
        theme: newTheme || theme,
        language: newLocale || locale,
        notifications_enabled: newNotifs !== undefined ? newNotifs : notificationsEnabled,
        ai_model: newModel || selectedModel
      });
      if (response.data.success) {
        toast.success('Preferences saved successfully.');
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDarkMode = (enabled) => {
    const nextTheme = enabled ? 'dark' : 'light';
    setTheme(nextTheme);
    handleSaveSettings(nextTheme, locale, notificationsEnabled, selectedModel);
  };

  const handleLanguageChange = (e) => {
    const nextLocale = e.target.value;
    setLocale(nextLocale);
    handleSaveSettings(theme, nextLocale, notificationsEnabled, selectedModel);
  };

  const handleModelChange = (e) => {
    const nextModel = e.target.value;
    setSelectedModel(nextModel);
    handleSaveSettings(theme, locale, notificationsEnabled, nextModel);
  };

  const toggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
    handleSaveSettings(theme, locale, enabled, selectedModel);
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      'WARNING: Deleting your account is permanent. All historical reports, credentials, and watchlist bookmarks will be destroyed. This action CANNOT be undone. Proceed?'
    );
    if (!confirm) return;

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

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 glass-panel skeleton-shimmer rounded-2xl" />
          <div className="h-64 glass-panel skeleton-shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">
          {t('settings')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure preferences, change AI models, manage notification triggers, and set platform rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appearance Settings Panel */}
        <div className="glass-panel p-6 space-y-6 bg-white dark:bg-slate-900/60 shadow-lg border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <PaintBrushIcon className="w-5 h-5 text-brand-500" />
              Appearance
            </h3>
            <p className="text-[10px] text-slate-400">Configure visual themes and display states.</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-250 block">Dark Mode</span>
              <span className="text-[10px] text-slate-400">Enable dark premium theme styling</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onChange={toggleDarkMode}
              className={`${
                theme === 'dark' ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
              <span
                className={`${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>

        {/* AI Model Selection Panel */}
        <div className="glass-panel p-6 space-y-6 bg-white dark:bg-slate-900/60 shadow-lg border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <CpuChipIcon className="w-5 h-5 text-indigo-500" />
              AI Model
            </h3>
            <p className="text-[10px] text-slate-400">Choose the cognitive model driving report synthesis.</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select AI Model</label>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full glass-input px-3 py-2 text-xs cursor-pointer focus:ring-2 focus:ring-brand-500/25"
            >
              <option value="gemini" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">Gemini 1.5 Flash (Recommended)</option>
              <option value="openai" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">OpenAI GPT-4o-mini</option>
            </select>
          </div>
        </div>

        {/* Notifications Config Panel */}
        <div className="glass-panel p-6 space-y-6 bg-white dark:bg-slate-900/60 shadow-lg border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <BellIcon className="w-5 h-5 text-amber-500" />
              Notifications
            </h3>
            <p className="text-[10px] text-slate-400">Trigger settings for analytical event notifications.</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-250 block">Email Notifications</span>
              <span className="text-[10px] text-slate-400">Receive email alerts on successful runs</span>
            </div>
            <Switch
              checked={notificationsEnabled}
              onChange={toggleNotifications}
              className={`${
                notificationsEnabled ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
              <span
                className={`${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>

        {/* Other Platform Config Panel */}
        <div className="glass-panel p-6 space-y-6 bg-white dark:bg-slate-900/60 shadow-lg border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
              <GlobeAltIcon className="w-5 h-5 text-emerald-500" />
              Other Settings
            </h3>
            <p className="text-[10px] text-slate-400">Configure language localizations.</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Language</label>
            <select
              value={locale}
              onChange={handleLanguageChange}
              className="w-full glass-input px-3 py-2 text-xs cursor-pointer focus:ring-2 focus:ring-brand-500/25"
            >
              <option value="en" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">English (EN)</option>
              <option value="es" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">Español (ES)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 border border-red-200/30 dark:border-red-950/20 bg-red-500/5 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-red-600 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 animate-pulse" />
          Danger Zone
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Deleting your account is permanent. All historical reports, user credentials, API log journals, and active watchlist bookmarks will be destroyed. This action cannot be reversed.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          Delete Account Permanently
        </button>
      </div>

    </div>
  );
};

export default Settings;
