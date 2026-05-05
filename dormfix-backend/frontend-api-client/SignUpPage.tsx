/**
 * Updated SignUpPage
 *
 * Drop this into: src/app/components/SignUpPage.tsx
 *
 * ONLY change from original:
 *  - Email-already-taken check calls /api/auth/check-email
 *  - Final submit calls /api/auth/signup
 *  - All steps, UI, validation, and styling are completely unchanged
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CustomSelect } from './CustomSelect';
import { ArrowLeft, Wrench, CheckCircle2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signUp, checkEmailAvailable } from '../services/api';
import { toast } from 'sonner';

interface SignUpPageProps {
  onBack: () => void;
  onSignIn: () => void;
}

export function SignUpPage({ onBack, onSignIn }: SignUpPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    otp: '',
    registrationNumber: '',
    department: '',
    roomNumber: '',
    hostel: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const gikiEmailPattern = /^[a-zA-Z0-9._%+-]+@giki\.edu\.pk$/;
    return gikiEmailPattern.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please use a valid GIKI email address (@giki.edu.pk)';
    } else {
      // Check availability via API
      try {
        const available = await checkEmailAvailable(formData.email);
        if (!available) {
          newErrors.email = 'This email is already registered. Please sign in instead.';
        }
      } catch {
        newErrors.email = 'Could not verify email. Please try again.';
      }
    }

    if (!formData.role) newErrors.role = 'Please select your role';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate sending OTP
    setOtpSent(true);
    toast.success('OTP sent to your email! (Demo OTP: 123456)');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    if (formData.otp !== '123456') {
      setErrors({ otp: 'Invalid OTP. Demo OTP is 123456' });
      return;
    }
    setCurrentStep(2);
    setErrors({});
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.role === 'student') {
      if (!formData.registrationNumber.trim())
        newErrors.registrationNumber = 'Registration number is required';
      if (!formData.department.trim())
        newErrors.department = 'Department is required';
      if (!formData.roomNumber.trim())
        newErrors.roomNumber = 'Room number is required';
      if (!formData.hostel)
        newErrors.hostel = 'Please select your hostel';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCurrentStep(3);
    setErrors({});
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        role: formData.role,
        hostel: formData.hostel || undefined,
        roomNumber: formData.roomNumber || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        department: formData.department || undefined,
      });
      setSubmitStatus('success');
    } catch (err: any) {
      setSubmitStatus('error');
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Account Created!</h2>
            <p className="text-muted-foreground">
              Welcome to DormFix, {formData.fullName}! Your account has been created successfully.
            </p>
            <Button className="w-full" onClick={onSignIn}>
              Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-8">
          <button
            onClick={currentStep === 1 ? onBack : () => setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center mb-6 gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-8 h-px mx-1 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {currentStep === 1 && 'Create Account'}
              {currentStep === 2 && 'Your Details'}
              {currentStep === 3 && 'Set Password'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Join DormFix to report and track maintenance issues'}
              {currentStep === 2 && 'Tell us more about yourself'}
              {currentStep === 3 && 'Choose a secure password for your account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Step 1: Basic info + OTP */}
            {currentStep === 1 && (
              <form onSubmit={otpSent ? handleVerifyOtp : handleStep1Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                      disabled={otpSent}
                    />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">GIKI Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@giki.edu.pk"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      disabled={otpSent}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <CustomSelect
                    value={formData.role}
                    onValueChange={(value) => handleChange('role', value)}
                    placeholder="Select your role"
                    options={[
                      { value: 'student', label: 'Student' },
                      { value: 'supervisor', label: 'Supervisor' },
                      { value: 'technician', label: 'Technician' },
                    ]}
                    disabled={otpSent}
                  />
                  {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>OTP sent! Demo OTP is: 123456</AlertDescription>
                    </Alert>
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={(e) => handleChange('otp', e.target.value)}
                      className={errors.otp ? 'border-destructive' : ''}
                    />
                    {errors.otp && <p className="text-sm text-destructive">{errors.otp}</p>}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {otpSent ? (
                    <span className="flex items-center gap-2">
                      Verify OTP <ArrowRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send OTP <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Role-specific details */}
            {currentStep === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                {formData.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        placeholder="e.g. 2021-EE-001"
                        value={formData.registrationNumber}
                        onChange={(e) => handleChange('registrationNumber', e.target.value)}
                        className={errors.registrationNumber ? 'border-destructive' : ''}
                      />
                      {errors.registrationNumber && (
                        <p className="text-sm text-destructive">{errors.registrationNumber}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g. Electrical Engineering"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className={errors.department ? 'border-destructive' : ''}
                      />
                      {errors.department && (
                        <p className="text-sm text-destructive">{errors.department}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Hostel</Label>
                      <CustomSelect
                        value={formData.hostel}
                        onValueChange={(value) => handleChange('hostel', value)}
                        placeholder="Select your hostel"
                        options={[
                          { value: 'Hostel 1', label: 'Hostel 1' },
                          { value: 'Hostel 2', label: 'Hostel 2' },
                          { value: 'Hostel 3', label: 'Hostel 3' },
                          { value: 'Hostel 4', label: 'Hostel 4' },
                          { value: 'Hostel 5', label: 'Hostel 5' },
                        ]}
                      />
                      {errors.hostel && <p className="text-sm text-destructive">{errors.hostel}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomNumber">Room Number</Label>
                      <Input
                        id="roomNumber"
                        placeholder="e.g. 203-A"
                        value={formData.roomNumber}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                        className={errors.roomNumber ? 'border-destructive' : ''}
                      />
                      {errors.roomNumber && (
                        <p className="text-sm text-destructive">{errors.roomNumber}</p>
                      )}
                    </div>
                  </>
                )}

                {(formData.role === 'supervisor' || formData.role === 'technician') && (
                  <div className="py-4 text-center text-muted-foreground">
                    <p>No additional details required for {formData.role}s.</p>
                    <p className="text-sm mt-1">Click Next to set your password.</p>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <span className="flex items-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </form>
            )}

            {/* Step 3: Password */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Create Account
                    </span>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button onClick={onSignIn} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
