import { useState, useEffect, useRef, type FormEvent, type JSX } from 'react';
import { Lock, Eye, EyeOff, Check, ArrowLeft, Mail, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { forgotPassword, checkOTP, resetPassword } from '../services/auth';

type Step = 1 | 2 | 3;
type PasswordRequirements = {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
};

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false
  });

  const navigate = useNavigate();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: number;

    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = (): void => {
    setTimer(30);
  };

  useEffect(() => {
    setPasswordRequirements({
      hasMinLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    });
  }, [password]);

  const validatePassword = (): boolean => {
    return passwordRequirements.hasMinLength && 
           passwordRequirements.hasUpperCase && 
           passwordRequirements.hasNumber;
  };

  const handleSendOTP = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Required',
        text: 'Please enter your email address',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setIsLoading(true);
    try {
      const data: any = await forgotPassword(email);

      if(data.code === 404){
        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: data.message,
          confirmButtonColor: '#d33'
        });
      }else{
        await Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: data.message || 'OTP sent successfully',
          timer: 1500,
          showConfirmButton: false
        });
        setStep(2);
        startTimer();
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }

  
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send OTP. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    if (timer > 0) {
      Swal.fire({
        icon: 'info',
        title: 'Please Wait',
        text: `Please wait ${timer} seconds before resending`,
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setIsResending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoOTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('New Demo OTP:', demoOTP);
      
      Swal.fire({
        icon: 'success',
        title: 'Resent',
        text: `OTP resent to ${email}!`,
        timer: 1500,
        showConfirmButton: false
      });
      startTimer();
    } catch (error) {
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to resend OTP. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string, index: number): void => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = otpInputRefs.current[index + 1];
      if (nextInput) nextInput.focus();
    }

    if (value && index === 5) {
      const otpString = newOtp.join('');
      if (otpString.length === 6) {
        handleVerifyOTP(newOtp.join(''));
      }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number): void => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = otpInputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  // ✅ ONLY THIS FUNCTION WAS EDITED
  const handleVerifyOTP = async (otpString?: string): Promise<void> => {
    const finalOtp = otpString || otp.join('');
    
    if (finalOtp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete',
        text: 'Please enter the complete 6-digit OTP',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setIsLoading(true);
    try {
      const data: any = await checkOTP(email, finalOtp);      
      console.log(data.code);
      console.log(data.message);
      if (data.code === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Verified',
          text: 'OTP verified successfully!',
          timer: 1000,
          showConfirmButton: false
        });
        setStep(3);
      }
      else {
        setOtp(['', '', '', '', '', '']);

        otpInputRefs.current.forEach((input) => {
          if (input) input.value = '';
        });

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
        
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: data.message,
          confirmButtonColor: '#d33'
        });
      } 

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to verify OTP. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      if (!password || !confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Required',
          text: 'Please fill in all fields',
          confirmButtonColor: '#0d9488'
        });
        setIsLoading(false);
        return;
      }

      if (!validatePassword()) {
         Swal.fire({
          icon: 'warning',
          title: 'Weak Password',
          text: 'Please meet all password requirements',
          confirmButtonColor: '#0d9488'
        });
        setIsLoading(false);
        return;
      }

      const passwordsMatch = password === confirmPassword;
      if (!passwordsMatch) {
         Swal.fire({
          icon: 'error',
          title: 'Mismatch',
          text: 'Passwords do not match',
          confirmButtonColor: '#d33'
        });
        setIsLoading(false);
        return;
      }

      const data = await resetPassword(email, password); 

      if (data.code === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Password Reset',
          text: 'Password reset successfully! You can now login with your new password.',
          confirmButtonColor: '#0d9488'
        });
        navigate('/login');
      }
      else {
         Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message,
          confirmButtonColor: '#d33'
        });
      }
      
    } catch (error) {
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reset password. Please try again.',
        confirmButtonColor: '#d33'
      });
      setIsLoading(false);
    }
  };

  const passwordsMatch: boolean = password === confirmPassword && confirmPassword.length > 0;
  const isOtpComplete: boolean = otp.join('').length === 6;

  const renderStep1 = (): JSX.Element => (
    <form onSubmit={handleSendOTP}>
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-block p-4 rounded-2xl mb-4 shadow-lg transform transition-transform hover:rotate-12 duration-300" style={{background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)'}}>
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Reset Your Password
        </h1>
        <p className="text-gray-600">Enter your email to receive a verification code</p>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DD4BF] transition-colors duration-300 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2DD4BF] focus:outline-none transition-all duration-300 bg-[#F0FDFA] focus:bg-white"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          style={{background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)'}}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Send Verification Code
            </>
          )}
        </button>

        <Link to="/login"
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-[#0D9488] transition-colors duration-300 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Login</span>
        </Link>
      </div>
    </form>
  );

  const renderStep2 = (): JSX.Element => (
    <div>
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-block p-4 rounded-2xl mb-4 shadow-lg transform transition-transform hover:rotate-12 duration-300" style={{background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)'}}>
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Enter Verification Code
        </h1>
        <p className="text-gray-600 mb-2">We sent a 6-digit code to</p>
        <p className="text-[#0D9488] font-semibold">{email}</p>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter the 6-digit code
          </label>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
             <input
                key={index}
                ref={(el) => {
                  otpInputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-[#2DD4BF] focus:outline-none transition-all duration-300 bg-[#F0FDFA] focus:bg-white"
              />
            ))}
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => handleVerifyOTP()}
              disabled={isLoading || !isOtpComplete}
              className="w-full text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)'}}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify Code
                </>
              )}
            </button>

            <div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || timer > 0}
                className="text-[#14B8A6] hover:text-[#0D9488] font-semibold transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
              >
                {isResending ? (
                  <div className="w-4 h-4 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep(1)}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-[#0D9488] transition-colors duration-300 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Change Email</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = (): JSX.Element => (
    <form onSubmit={handleResetPassword}>
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-block p-4 rounded-2xl mb-4 shadow-lg transform transition-transform hover:rotate-12 duration-300" style={{background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)'}}>
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Create New Password
        </h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DD4BF] transition-colors duration-300 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2DD4BF] focus:outline-none transition-all duration-300 bg-[#F0FDFA] focus:bg-white"
              placeholder="Enter new password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2DD4BF] transition-colors duration-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DD4BF] transition-colors duration-300 w-5 h-5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-[#F0FDFA] focus:bg-white ${
                confirmPassword && !passwordsMatch
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#2DD4BF]'
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2DD4BF] transition-colors	duration-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {confirmPassword && (
            <div className={`flex items-center gap-2 mt-2 text-sm ${
              passwordsMatch ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                passwordsMatch 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-red-500'
              }`}>
                {passwordsMatch && <Check className="w-3 h-3" />}
              </div>
              <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
            </div>
          )}
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                passwordRequirements.hasMinLength ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              At least 6 characters
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                passwordRequirements.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                passwordRequirements.hasNumber ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              One number
            </li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          style={{background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)'}}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Reset Password
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-[#0D9488] transition-colors	duration-300 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Verification</span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex	items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-[#2DD4BF] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    step > stepNumber ? 'bg-[#2DD4BF]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <button 
              onClick={() => Swal.fire({
                icon: 'info',
                title: 'Contact Support',
                text: 'Contact support at help@example.com',
                confirmButtonColor: '#0d9488'
              })} 
              className="text-[#14B8A6] hover:text-[#0D9488] font-semibold transition-colors"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}