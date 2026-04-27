import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMode, setAuthMode] = useState('user');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const payload = isRegistering 
        ? formData 
        : { provider: authMode === 'admin' ? 'Admin' : 'Email', email: formData.email, password: formData.password };

      const response = await api.post(endpoint, payload);
      
      login(response.data.user, response.data.token);
      toast.success(`Welcome back, ${response.data.user.name}!`);
      navigate(response.data.user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (provider) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        provider,
        name: 'Guest User'
      });
      
      login(response.data.user, response.data.token);
      toast.success('Logged in with ' + provider);
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Login failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = formData.email?.trim();
    if (!email) {
      toast.error('Enter your email first, then click Forgot password');
      return;
    }

    setShowResetForm(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const email = formData.email?.trim();
    if (!email) {
      toast.error('Enter your email address');
      return;
    }

    if (!resetData.newPassword || !resetData.confirmPassword) {
      toast.error('Fill in both password fields');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      const response = await api.post('/auth/reset-password', {
        email,
        newPassword: resetData.newPassword,
      });

      toast.success(response.data?.message || 'Password reset successful');
      setShowResetForm(false);
      setResetData({ newPassword: '', confirmPassword: '' });
      setIsRegistering(false);
      setAuthMode('user');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isRegistering ? 'Create an account' : authMode === 'admin' ? 'Admin login' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isRegistering ? 'Join FreshCart today' : authMode === 'admin' ? 'Enter your admin credentials to continue' : 'Sign in to continue to FreshCart'}
            </p>
          </div>

          {!isRegistering && (
            <div className="mt-4 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setAuthMode('user')}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${authMode === 'user' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('admin')}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${authMode === 'admin' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                Admin Login
              </button>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
            {isRegistering && (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            )}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Email address"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : authMode === 'admin' ? 'Sign In as Admin' : 'Sign In')}
            </button>

            {!isRegistering && authMode === 'user' && (
              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-60"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          {showResetForm && !isRegistering && authMode === 'user' && (
            <form onSubmit={handleResetPassword} className="mt-4 space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <p className="text-sm font-semibold text-indigo-800">Reset password for {formData.email || 'your account'}</p>
              <input
                type="password"
                placeholder="New password"
                value={resetData.newPassword}
                onChange={(e) => setResetData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="w-full py-2 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {!isRegistering && authMode === 'user' && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleMockLogin('Google')}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    Google
                  </button>
                  <button
                    onClick={() => handleMockLogin('Facebook')}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166FE5] transition-all"
                  >
                    Facebook
                  </button>
                </div>
                
                <button
                  onClick={() => handleMockLogin('Passkey')}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-900 rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all"
                >
                  <Fingerprint className="h-4 w-4 mr-2 text-indigo-400" />
                  Passkey
                </button>
              </>
            )}

            {!isRegistering && authMode === 'admin' && (
              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Enter admin@gmail.com and admin, then sign in to go directly to the admin page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
