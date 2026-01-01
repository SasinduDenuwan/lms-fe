import React, { useState, useRef } from 'react';
import { validate, showErrorToast } from '../utils/validation';
import { Eye, EyeOff, User, Lock, ArrowRight, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { register } from '../services/auth';

export default function SignUpPage() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (firstname.trim() === '') {
      showErrorToast("Please enter your first name!");
      firstnameRef.current?.focus();
      return;
    }
    const firstnameError = validate(firstname, 'name');
    if (firstnameError) {
      showErrorToast(firstnameError);
      firstnameRef.current?.focus();
      return;
    }

    if (lastname.trim() === '') {
      showErrorToast("Please enter your last name!");
      lastnameRef.current?.focus();
      return;
    }
    const lastnameError = validate(lastname, 'name');
    if (lastnameError) {
      showErrorToast(lastnameError);
      lastnameRef.current?.focus();
      return;
    }

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
    const passwordError = validate(password, 'password');
    if (passwordError) {
      showErrorToast(passwordError);
      passwordRef.current?.focus();
      return;
    }
    if (confirmPassword.trim() === '') {
      showErrorToast("Please confirm your password!");
      confirmPasswordRef.current?.focus();
      return;
    }
    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match!");
      confirmPasswordRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const data: any = await register(firstname, lastname, email, password);

      if (data) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Registration successful! Please log in.',
          confirmButtonColor: '#0d9488'
        });
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Registration Error : ", err);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Registration failed. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-500/20 bg-linear-to-br from-indigo-500 to-blue-600 transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <User className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-extrabold mb-3 bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-500 font-medium">Start your journey with us today</p>
          </div>

          <div className="space-y-5 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">First Name</label>
                <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                    </div>
                    <input
                    ref={firstnameRef}
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400 text-sm"
                    placeholder="First Name"
                    />
                </div>
                </div>
                <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Last Name</label>
                <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                    </div>
                    <input
                    ref={lastnameRef}
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400 text-sm"
                    placeholder="Last Name"
                    />
                </div>
                </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
              <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                </div>
                <input
                  ref={emailRef}
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                </div>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password</label>
              <div className="relative transition-transform duration-300 transform group-focus-within:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                </div>
                <input
                  ref={confirmPasswordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 ease-out placeholder-gray-400"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-500'} animate-fade-in`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-green-600' : 'bg-red-500'}`}></div>
                   {passwordsMatch ? 'Passwords match perfectly' : 'Passwords do not match yet'}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-linear-to-r from-indigo-500 to-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 font-medium animate-fade-in-up animation-delay-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline transition-all">
              Sign in
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
        .animate-fade-in {
             animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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