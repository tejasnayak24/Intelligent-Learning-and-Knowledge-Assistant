import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService'; 

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    console.log('Submitting credentials to API (POST /login):', formData.email);

    try {
      // 1. Fire network validation check against FastAPI database
      await authService.login(formData.email, formData.password);
      
      console.log('Login token verified and cached. Transitioning to dashboard...');
      // 2. Clear route transition only occurs if no error was raised above
      navigate('/dashboard'); 
    } catch (err) {
      console.error('Login verification catch exception:', err);
      
      // Extract FastAPI detail string or validation error array safely
      const errMsg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(Array.isArray(errMsg) ? errMsg[0].msg : errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800/60">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your study materials on <span className="font-semibold text-indigo-400">ILKA</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-md bg-red-950/50 p-3 text-sm text-red-400 border border-red-900/50">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
                placeholder="you@student.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer shadow-md shadow-indigo-600/10 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Verifying...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center text-sm text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}