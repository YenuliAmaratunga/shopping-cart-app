import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Store, LogOut, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { cartCount, user, logout } = useAppContext();

  const handleLogout = () => {
    toast.custom((toastInstance) => (
      <div className="w-[520px] max-w-[96vw] rounded-2xl border-2 border-amber-300 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.28)]">
        <div className="flex items-start gap-4 p-5 bg-amber-50/70 border-b border-amber-200">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-900">Confirm logout</p>
            <p className="mt-1 text-sm text-gray-700">You will need to sign in again to access your account and cart.</p>
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => toast.dismiss(toastInstance.id)}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(toastInstance.id);
              logout();
              toast.success('Logged out successfully');
            }}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    ), { duration: 8000, position: 'top-center' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition-colors">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">FreshCart</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors hover:bg-gray-100 rounded-full"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200" title={user.name}>
                  <span className="text-indigo-700 font-medium text-sm">{user.name?.charAt(0) || 'U'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-full border border-gray-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}
