import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ArrowLeft, Wrench, AlertCircle, LogIn, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { signIn, resetPassword } from '../../../dormfix-backend/frontend-api-client/api';

interface SignInPageProps {
  onBack: () => void;
  onSignIn: (role: 'supervisor' | 'student' | 'technician') => void;
  onSignUp: () => void;
}

// Mock user database for demo purposes
const mockUsers = [
  { email: 'ahmed.raza@giki.edu.pk', password: 'student123', role: 'student' as const, name: 'Ahmed Raza', hostel: 'Hostel 1', roomNumber: '203-A' },
  { email: 'supervisor.irfan@giki.edu.pk', password: 'super123', role: 'supervisor' as const, name: 'Supervisor Irfan', hostel: 'Hostel 1' },
  { email: 'supervisor.khalid@giki.edu.pk', password: 'super123', role: 'supervisor' as const, name: 'Supervisor Khalid', hostel: 'Hostel 2' },
  { email: 'supervisor.rizwan@giki.edu.pk', password: 'super123', role: 'supervisor' as const, name: 'Supervisor Rizwan', hostel: 'Hostel 3' },
  { email: 'kashif.ali@giki.edu.pk', password: 'tech123', role: 'technician' as const, name: 'Kashif Ali' },
  { email: 'bilal.ahmad@giki.edu.pk', password: 'tech123', role: 'technician' as const, name: 'Bilal Ahmad' },
  { email: 'usman.khan@giki.edu.pk', password: 'tech123', role: 'technician' as const, name: 'Usman Khan' },
];

export function SignInPage({ onBack, onSignIn, onSignUp }: SignInPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const gikiEmailPattern = /^[a-zA-Z0-9._%+-]+@giki\.edu\.pk$/;
    return gikiEmailPattern.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please use a valid GIKI email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await signIn(formData.email, formData.password);

      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostel: user.hostel,
        roomNumber: user.roomNumber,
      }));

      if (user.hostel) {
        localStorage.setItem('userHostel', user.hostel);
      }

      toast.success('Login Successful!', {
        description: `Welcome back${user.hostel ? ` to ${user.hostel}` : ''}!`,
      });
      onSignIn(user.role as 'supervisor' | 'student' | 'technician');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOTP = () => {
    const newErrors: Record<string, string> = {};

    if (!resetEmail.trim()) {
      newErrors.resetEmail = 'Email is required';
      setResetErrors(newErrors);
      return;
    }
    if (!validateEmail(resetEmail)) {
      newErrors.resetEmail = 'Please enter a valid GIKI email address';
      setResetErrors(newErrors);
      return;
    }

    // (OTP sending is simulated — no backend OTP endpoint yet)

    setOtpSent(true);
    toast.success('OTP Sent', {
      description: 'A 6-digit code has been sent to your email',
    });
  };

  const handleVerifyResetOTP = () => {
    const newErrors: Record<string, string> = {};

    if (!resetOtp.trim()) {
      newErrors.resetOtp = 'OTP is required';
      setResetErrors(newErrors);
      return;
    }
    if (resetOtp.length !== 6) {
      newErrors.resetOtp = 'OTP must be 6 digits';
      setResetErrors(newErrors);
      return;
    }

    // Simulate OTP verification (in real app, verify with backend)
    if (resetOtp === '123456' || resetOtp.length === 6) {
      setResetStep(2);
      setResetErrors({});
    } else {
      newErrors.resetOtp = 'Invalid OTP';
      setResetErrors(newErrors);
    }
  };

  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      return;
    }

    // Check if it's a demo user
    const isDemoUser = mockUsers.some((u) => u.email === resetEmail);

    if (isDemoUser) {
      toast.error('Cannot Reset Demo Account Password', {
        description: 'Demo account passwords cannot be changed. Please use the original password.',
        duration: 5000,
      });
      return;
    }

    // Update password in the real database
    try {
      await resetPassword(resetEmail, newPassword);
    } catch (err) {
      console.error('Failed to reset password in database:', err);
    }

    // Also update in localStorage so mock/registered users can still sign in
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = registeredUsers.map((u: any) =>
      u.email === resetEmail ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    toast.success('Password Reset Successful', {
      description: 'You can now sign in with your new password',
    });

    // Reset all states
    setShowForgotPassword(false);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetStep(1);
    setOtpSent(false);
    setResetErrors({});
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetStep(1);
    setOtpSent(false);
    setResetErrors({});
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="glass-card w-12 h-12 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DormFix</h1>
              <p className="text-xs text-blue-100 dark:text-blue-200">GIKI Maintenance System</p>
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative">
            {/* Main Card */}
            <div className="glass-card border-white/20 dark:border-white/10 rounded-2xl p-8 w-[400px]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Wrench className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/30 rounded w-32 mb-2"></div>
                    <div className="h-2 bg-white/20 rounded w-24"></div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/30 rounded w-28 mb-2"></div>
                    <div className="h-2 bg-white/20 rounded w-20"></div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                    <LogIn className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/30 rounded w-36 mb-2"></div>
                    <div className="h-2 bg-white/20 rounded w-28"></div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-2xl transform rotate-12"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full"></div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Welcome Back to DormFix
          </h2>
          <p className="text-blue-100 text-lg">
            Track and manage hostel maintenance issues efficiently. Sign in to continue.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">DormFix</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">GIKI Maintenance</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
        <Card className="w-[480px] glass-card shadow-xl">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={onBack} className="glass-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="w-10"></div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-gray-100">Welcome Back</CardTitle>
            <CardDescription className="text-center text-sm text-gray-600 dark:text-gray-400">
              Sign in to your DormFix account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {loginError && (
              <Alert className="mb-6 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">GIKI Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@giki.edu.pk"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`glass-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`glass-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={onSignUp}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              {resetStep === 1 ? 'Reset Password' : 'Create New Password'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {resetStep === 1
                ? 'Enter your email and verify with OTP to reset your password.'
                : 'Enter your new password.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Email and OTP Verification */}
          {resetStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-900 dark:text-gray-100">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your.name@giki.edu.pk"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetErrors({ ...resetErrors, resetEmail: '' });
                  }}
                  disabled={otpSent}
                  className={`glass-input ${resetErrors.resetEmail ? 'border-red-500' : ''}`}
                />
                {resetErrors.resetEmail && (
                  <p className="text-xs text-red-600 dark:text-red-400">{resetErrors.resetEmail}</p>
                )}
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="reset-otp" className="text-gray-900 dark:text-gray-100">
                    Enter OTP
                  </Label>
                  <Input
                    id="reset-otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => {
                      setResetOtp(e.target.value.replace(/\D/g, ''));
                      setResetErrors({ ...resetErrors, resetOtp: '' });
                    }}
                    className={`glass-input text-center text-2xl tracking-widest ${resetErrors.resetOtp ? 'border-red-500' : ''}`}
                  />
                  {resetErrors.resetOtp && (
                    <p className="text-xs text-red-600 dark:text-red-400">{resetErrors.resetOtp}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: New Password */}
          {resetStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-900 dark:text-gray-100">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setResetErrors({ ...resetErrors, newPassword: '' });
                    }}
                    className={`glass-input pr-10 ${resetErrors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetErrors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">{resetErrors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-gray-900 dark:text-gray-100">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setResetErrors({ ...resetErrors, confirmNewPassword: '' });
                    }}
                    className={`glass-input pr-10 ${resetErrors.confirmNewPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetErrors.confirmNewPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">{resetErrors.confirmNewPassword}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseForgotPassword}
              className="glass-button"
            >
              Cancel
            </Button>

            {resetStep === 1 && !otpSent && (
              <Button
                onClick={handleSendResetOTP}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                Send OTP
              </Button>
            )}

            {resetStep === 1 && otpSent && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSendResetOTP}
                  className="glass-button"
                >
                  Resend OTP
                </Button>
                <Button
                  onClick={handleVerifyResetOTP}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                >
                  Verify OTP
                </Button>
              </>
            )}

            {resetStep === 2 && (
              <Button
                onClick={handleResetPassword}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                Reset Password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
