import React, { useState, useRef } from 'react';
import { validate, showErrorToast } from '../utils/validation';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { login, getMyDetails } from '../services/auth'; // Make sure you have a login service
import { useAuth } from '../context/authContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim() === '') {
      showErrorToast("Please enter your email!");
      emailRef.current?.focus();
      return;
    }

    const emailError = validate(email, 'email');
    if (emailError) {
      showErrorToast(emailError);
      emailRef.current?.focus();
      return;
    }

    if (password.trim() === '') {
      showErrorToast("Please enter your password!");
      passwordRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const data: any = await login(email, password);

      if (data.data || data) {
         await Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Login successful!',
          timer: 1500,
          showConfirmButton: false
        });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Update Auth Context Immediately
        try {
            const userRes = await getMyDetails();
            if (userRes.data) {
                setUser(userRes.data);
                
                // Check if user is admin
                if (userRes.data.roles && (userRes.data.roles.includes('ADMIN') || userRes.data.roles.includes('admin'))) {
                  navigate('/admin');
                } else {
                  navigate('/');
                }
            } else {
              navigate('/');
            }
        } catch (error) {
            console.error("Failed to fetch user details after login", error);
            navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Login Error: ', err);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-linear-to-br from-indigo-50 via-white to-cyan-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-linear-to-br from-teal-400/20 to-blue-500/20 blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-linear-to-br from-purple-400/20 to-pink-500/20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-linear-to-br from-blue-400/20 to-indigo-500/20 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/50 transform transition-all duration-500 hover:shadow-cyan-100/50">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-down">
            <div className="inline-flex p-4 rounded-2xl mb-6 shadow-lg shadow-teal-500/20 bg-linear-to-br from-teal-500 to-blue-600 transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <Lock className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-extrabold mb-3 bg-linear-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-medium">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form className="space-y-6 animate-fade-in-up" onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300" />
                </div>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300" />
                </div>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all duration-200"></div>
                  <div className="absolute top-0.5 left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span className="ml-2.5 text-gray-600 group-hover:text-gray-900 transition-colors font-medium">Remember me</span>
              </label>
              <Link
                to="/forgot-pw"
                className="text-teal-600 hover:text-teal-700 font-semibold hover:underline decoration-2 underline-offset-2 transition-all"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-linear-to-r from-teal-500 to-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </form>



          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-8 font-medium animate-fade-in-up animation-delay-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>

  );
}
