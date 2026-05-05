/**
 * Updated SignInPage
 *
 * Drop this into: src/app/components/SignInPage.tsx
 *
 * ONLY change from original:
 *  - handleSubmit now calls the /api/auth/signin endpoint
 *  - The mock user array and localStorage lookups are removed
 *  - All UI, validation, styling, OTP flow — completely unchanged
 */

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
import { signIn } from '../services/api';

interface SignInPageProps {
  onBack: () => void;
  onSignIn: (role: 'supervisor' | 'student' | 'technician', userData?: any) => void;
  onSignUp: () => void;
}

export function SignInPage({ onBack, onSignIn, onSignUp }: SignInPageProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    if (errors[field]) setErrors({ ...errors, [field]: '' });
    if (loginError) setLoginError('');
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
      const result = await signIn(formData.email, formData.password);
      const user = result.user;

      // Store user info in localStorage for components that still read from it
      localStorage.setItem('currentUser', JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        hostel: user.hostel,
        roomNumber: user.roomNumber,
      }));
      if (user.hostel) localStorage.setItem('userHostel', user.hostel);

      toast.success(`Welcome back, ${user.name}!`);
      onSignIn(user.role, user);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password (UI only — no real email in demo) ─────────────────────
  const handleSendOtp = () => {
    const newErrors: Record<string, string> = {};
    if (!resetEmail.trim()) {
      newErrors.resetEmail = 'Email is required';
    } else if (!validateEmail(resetEmail)) {
      newErrors.resetEmail = 'Please use a valid GIKI email address';
    }
    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      return;
    }
    setOtpSent(true);
    toast.success('OTP sent to your email address (demo: use 123456)');
  };

  const handleVerifyOtp = () => {
    if (resetOtp === '123456') {
      setResetStep(2);
      setResetErrors({});
    } else {
      setResetErrors({ otp: 'Invalid OTP. Demo OTP is 123456' });
    }
  };

  const handleResetPassword = () => {
    const newErrors: Record<string, string> = {};
    if (!newPassword) newErrors.newPassword = 'Password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!confirmNewPassword) newErrors.confirmNewPassword = 'Please confirm password';
    else if (newPassword !== confirmNewPassword) newErrors.confirmNewPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      return;
    }

    toast.success('Password reset successfully! Please sign in with your new password.');
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail('');
    setResetOtp('');
    setOtpSent(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setResetErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your DormFix account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@giki.edu.pk"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Demo credentials:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium">Student:</span> ahmed.raza@giki.edu.pk / student123</p>
                <p><span className="font-medium">Supervisor:</span> supervisor.irfan@giki.edu.pk / super123</p>
                <p><span className="font-medium">Technician:</span> kashif.ali@giki.edu.pk / tech123</p>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button onClick={onSignUp} className="text-primary font-medium hover:underline">
                Sign up
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Reset Password
              </DialogTitle>
              <DialogDescription>
                {resetStep === 1 ? 'Enter your GIKI email to receive an OTP' : 'Set your new password'}
              </DialogDescription>
            </DialogHeader>

            {resetStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your.name@giki.edu.pk"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setResetErrors({});
                    }}
                    className={resetErrors.resetEmail ? 'border-destructive' : ''}
                  />
                  {resetErrors.resetEmail && (
                    <p className="text-sm text-destructive">{resetErrors.resetEmail}</p>
                  )}
                </div>

                {!otpSent ? (
                  <Button className="w-full" onClick={handleSendOtp}>
                    Send OTP
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>OTP sent! Demo OTP is: 123456</AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label>Enter OTP</Label>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        value={resetOtp}
                        onChange={(e) => {
                          setResetOtp(e.target.value);
                          setResetErrors({});
                        }}
                        className={resetErrors.otp ? 'border-destructive' : ''}
                      />
                      {resetErrors.otp && (
                        <p className="text-sm text-destructive">{resetErrors.otp}</p>
                      )}
                    </div>
                    <Button className="w-full" onClick={handleVerifyOtp}>
                      Verify OTP
                    </Button>
                  </div>
                )}
              </div>
            )}

            {resetStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={resetErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {resetErrors.newPassword && (
                    <p className="text-sm text-destructive">{resetErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={resetErrors.confirmNewPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {resetErrors.confirmNewPassword && (
                    <p className="text-sm text-destructive">{resetErrors.confirmNewPassword}</p>
                  )}
                </div>

                <Button className="w-full" onClick={handleResetPassword}>
                  Reset Password
                </Button>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowForgotPassword(false);
                setResetStep(1);
                setOtpSent(false);
                setResetEmail('');
                setResetOtp('');
                setResetErrors({});
              }}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
