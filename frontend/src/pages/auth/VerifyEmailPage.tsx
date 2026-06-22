import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { verifyOtp, resendOtp, clearError } from '@/features/auth/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);

  const state = location.state as { name?: string; email?: string; password?: string } | null;

  useEffect(() => {
    // Redirect if no state (user didn't come from register page)
    if (!state?.email || !state?.name || !state?.password) {
      navigate('/register');
    }
  }, [state, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setOtpError('');
    
    if (!otp.trim() || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpError('Please enter a valid 6-digit OTP');
      toast.error('Invalid OTP format');
      return;
    }

    if (!state) return;

    const result = await dispatch(verifyOtp({ 
      name: state.name!, 
      email: state.email!, 
      password: state.password!, 
      otp 
    }));
    
    if (verifyOtp.fulfilled.match(result)) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.payload as string || 'Failed to verify OTP');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    if (state?.email) {
      const result = await dispatch(resendOtp(state.email));
      if (resendOtp.fulfilled.match(result)) {
        toast.success('A new OTP has been sent to your email.');
        setCountdown(60);
      } else {
        toast.error(result.payload as string || 'Failed to resend OTP');
      }
    }
  };

  if (!state?.email) return null;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h1>
          <p className="text-gray-500 text-sm">
            Enter the 6-digit OTP sent to <span className="font-semibold text-gray-700">{state.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</div>
          )}
          
          <div>
            <Input
              label="One-Time Password (OTP)"
              type="text"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 6) setOtp(val);
              }}
              error={otpError}
              placeholder="123456"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          
          <Button type="submit" loading={loading} className="w-full h-12 text-lg" disabled={otp.length !== 6 || loading}>
            Verify & Create Account
          </Button>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button 
              type="button" 
              onClick={handleResendOtp}
              disabled={countdown > 0 || loading}
              className={`text-sm font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-accent hover:text-accent-dark hover:underline'}`}
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
