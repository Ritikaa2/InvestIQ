import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    const success = await signup(data.username, data.email, data.password);
    setSubmitting(false);
    if (success) {
      navigate('/dashboard');
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
              <SparklesIcon className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Get instant access to multi-agent equity audits.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Username</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="johndoe"
                className={`w-full glass-input pl-10 pr-4 py-2 text-xs ${errors.username ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters long' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Alphanumeric and underscores only' }
                })}
              />
            </div>
            {errors.username && <span className="text-[10px] text-red-500 mt-1 block">{errors.username.message}</span>}
          </div>

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
            <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Password</label>
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
            {submitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:underline font-semibold">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;



