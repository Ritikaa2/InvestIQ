import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = token
        ? { token, password: data.password }
        : { email: data.email, otp: data.otp, password: data.password };

      const response = await api.post('/auth/reset-password', payload);

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100">Set New Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            {token ? 'Please enter your new password below.' : 'Enter your email, OTP, and new password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!token && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    className={`w-full glass-input pl-10 pr-4 py-2 text-xs ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    {...register('email', { 
                      required: 'Email address is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' }
                    })}
                  />
                </div>
                {errors.email && <span className="text-[10px] text-red-500 mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">OTP Code</label>
                <div className="relative">
                  <ShieldCheckIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className={`w-full glass-input pl-10 pr-4 py-2 text-xs tracking-[0.25em] ${errors.otp ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    {...register('otp', { 
                      required: 'OTP is required',
                      pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' }
                    })}
                  />
                </div>
                {errors.otp && <span className="text-[10px] text-red-500 mt-1 block">{errors.otp.message}</span>}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">New Password</label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                placeholder="--------"
                className={`w-full glass-input pl-10 pr-4 py-2 text-xs ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                })}
              />
            </div>
            {errors.password && <span className="text-[10px] text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-brand-500/10 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {!token && (
          <div className="text-center mt-6 text-xs text-slate-400">
            Need a code?{' '}
            <Link to="/forgot-password" className="text-brand-500 hover:underline font-semibold">Send OTP</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
