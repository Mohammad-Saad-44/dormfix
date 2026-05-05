import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CustomSelect } from './CustomSelect';
import { ArrowLeft, Wrench, CheckCircle2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signUp } from '../../../dormfix-backend/frontend-api-client/api';

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

  const validateEmail = (email: string) => {
    const gikiEmailPattern = /^[a-zA-Z0-9._%+-]+@giki\.edu\.pk$/;
    return gikiEmailPattern.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please use a valid GIKI email address (@giki.edu.pk)';
    } else {
      // Check if email is already registered
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const demoEmails = [
        'ahmed.raza@giki.edu.pk',
        'supervisor.irfan@giki.edu.pk',
        'supervisor.khalid@giki.edu.pk',
        'supervisor.rizwan@giki.edu.pk',
        'kashif.ali@giki.edu.pk',
        'bilal.ahmad@giki.edu.pk',
        'usman.khan@giki.edu.pk',
      ];

      const isEmailTaken = registeredUsers.some((user: any) => user.email === formData.email) ||
                           demoEmails.includes(formData.email);

      if (isEmailTaken) {
        newErrors.email = 'This email is already registered. Please sign in instead.';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCurrentStep(2);
  };

  const handleSendOTP = () => {
    setOtpSent(true);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate OTP verification (in real app, verify with backend)
    if (formData.otp === '123456' || formData.otp.length === 6) {
      setCurrentStep(3);
    } else {
      setErrors({ otp: 'Invalid OTP' });
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = formData.role === 'student'
        ? 'Registration number is required'
        : 'Employee ID is required';
    }

    if (formData.role === 'student' && !formData.department) {
      newErrors.department = 'Department is required';
    }

    if (formData.role === 'student' && !formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }

    if ((formData.role === 'student' || formData.role === 'supervisor') && !formData.hostel) {
      newErrors.hostel = 'Hostel is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if supervisor already exists for this hostel
    if (formData.role === 'supervisor' && formData.hostel) {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Check registered users
      const existingSupervisor = registeredUsers.find(
        (u: any) => u.role === 'supervisor' && u.hostel === formData.hostel
      );

      // Also check demo/mock supervisors
      const demoSupervisors = [
        { hostel: 'Hostel 1', email: 'supervisor.irfan@giki.edu.pk' },
        { hostel: 'Hostel 2', email: 'supervisor.khalid@giki.edu.pk' },
        { hostel: 'Hostel 3', email: 'supervisor.rizwan@giki.edu.pk' },
      ];
      const existingDemoSupervisor = demoSupervisors.find(
        (s) => s.hostel === formData.hostel
      );

      if (existingSupervisor || existingDemoSupervisor) {
        newErrors.hostel = `A supervisor is already registered for ${formData.hostel}. Only one supervisor per hostel is allowed.`;
        setErrors(newErrors);
        return;
      }
    }

    // Save to localStorage so the app can sign in with this user
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const newUser = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      name: formData.fullName,
      fullName: formData.fullName,
      registrationNumber: formData.registrationNumber,
      department: formData.department,
      roomNumber: formData.roomNumber,
      hostel: formData.hostel,
    };
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Also save to the real database so the user appears in pgAdmin
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
    } catch (err) {
      // DB save failed silently — user can still sign in via localStorage
      console.error('Failed to save user to database:', err);
    }

    setSubmitStatus('success');
  };

  const getIdLabel = () => {
    if (formData.role === 'student') return 'Registration Number';
    if (formData.role === 'supervisor') return 'Employee ID';
    if (formData.role === 'technician') return 'Employee ID';
    return 'ID Number';
  };

  const getIdPlaceholder = () => {
    if (formData.role === 'student') return 'e.g., 2024447';
    return 'e.g., EMP-001';
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6">
        <Card className="w-[480px] glass-card border-green-300 dark:border-green-700">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
              Account created successfully! You can now sign in to access your DormFix account.
            </p>
            <Button
              onClick={onSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              size="lg"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {/* Progress Visualization */}
            <div className="glass-card border-white/20 dark:border-white/10 rounded-2xl p-8 w-[400px]">
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/40 rounded w-full mb-2"></div>
                    <div className="text-white/80 text-sm">Basic Information</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/40 rounded w-3/4 mb-2"></div>
                    <div className="text-white/80 text-sm">Email Verification</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/40 rounded w-2/3 mb-2"></div>
                    <div className="text-white/80 text-sm">Complete Profile</div>
                  </div>
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
            Join the GIKI Community
          </h2>
          <p className="text-blue-100 text-lg">
            Create your account in 3 simple steps. Fast, secure, and verified.
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
        <div className="flex-1 flex items-center justify-center px-6 py-6">
        <Card className="w-[480px] glass-card shadow-xl">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={onBack} className="glass-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center">
                  {currentStep === 1 && <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                  {currentStep === 2 && <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                  {currentStep === 3 && <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>
              <div className="w-10"></div>
            </div>
            <CardTitle className="text-xl text-center text-gray-900 dark:text-gray-100">Create Account</CardTitle>
            <CardDescription className="text-center text-sm text-gray-600 dark:text-gray-400">
              {currentStep === 1 && 'Enter your basic information'}
              {currentStep === 2 && 'Verify your email address'}
              {currentStep === 3 && 'Complete your profile'}
            </CardDescription>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className={`h-1.5 w-20 rounded-full ${currentStep >= 1 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-1.5 w-20 rounded-full ${currentStep >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-1.5 w-20 rounded-full ${currentStep >= 3 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>

                <form onSubmit={handleStep1Submit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm text-gray-900 dark:text-gray-100">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`glass-input ${errors.fullName ? 'border-red-500' : ''}`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-900 dark:text-gray-100">GIKI Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@giki.edu.pk"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`glass-input ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm text-gray-900 dark:text-gray-100">I am a</Label>
                    <CustomSelect
                      value={formData.role}
                      onValueChange={(value) => handleChange('role', value)}
                      options={[
                        { value: 'student', label: 'Student' },
                        { value: 'supervisor', label: 'Supervisor' },
                        { value: 'technician', label: 'Technician' },
                      ]}
                      placeholder="Select your role"
                      className={`glass-button ${errors.role ? 'border-red-500' : ''}`}
                    />
                    {errors.role && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.role}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <>

                <form onSubmit={handleStep2Submit} className="space-y-3">
                  {otpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm text-gray-900 dark:text-gray-100">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={formData.otp}
                        onChange={(e) => handleChange('otp', e.target.value.replace(/\D/g, ''))}
                        className={`glass-input text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
                      />
                      {errors.otp && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.otp}</p>
                      )}
                    </div>
                  )}

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                      size="lg"
                    >
                      Send OTP
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                        size="lg"
                      >
                        Verify OTP
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendOTP}
                        className="w-full glass-button"
                      >
                        Resend OTP
                      </Button>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(1)}
                    className="w-full glass-button"
                  >
                    Back
                  </Button>
                </form>
              </>
            )}

            {/* Step 3: Complete Profile */}
            {currentStep === 3 && (
              <>

                <form onSubmit={handleStep3Submit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber" className="text-sm text-gray-900 dark:text-gray-100">{getIdLabel()}</Label>
                    <Input
                      id="registrationNumber"
                      type="text"
                      placeholder={getIdPlaceholder()}
                      value={formData.registrationNumber}
                      onChange={(e) => handleChange('registrationNumber', e.target.value)}
                      className={`glass-input ${errors.registrationNumber ? 'border-red-500' : ''}`}
                    />
                    {errors.registrationNumber && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.registrationNumber}</p>
                    )}
                  </div>

                  {formData.role === 'student' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm text-gray-900 dark:text-gray-100">Department</Label>
                        <CustomSelect
                          value={formData.department}
                          onValueChange={(value) => handleChange('department', value)}
                          options={[
                            { value: 'CS', label: 'Computer Science' },
                            { value: 'EE', label: 'Electrical Engineering' },
                            { value: 'ME', label: 'Mechanical Engineering' },
                            { value: 'CE', label: 'Chemical Engineering' },
                            { value: 'MS', label: 'Material Science' },
                            { value: 'SE', label: 'Software Engineering' },
                          ]}
                          placeholder="Select"
                          className={`glass-button ${errors.department ? 'border-red-500' : ''}`}
                        />
                        {errors.department && (
                          <p className="text-xs text-red-600 dark:text-red-400">{errors.department}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="roomNumber" className="text-sm text-gray-900 dark:text-gray-100">Room Number</Label>
                        <Input
                          id="roomNumber"
                          type="text"
                          placeholder="e.g., 203-A"
                          value={formData.roomNumber}
                          onChange={(e) => handleChange('roomNumber', e.target.value)}
                          className={`glass-input ${errors.roomNumber ? 'border-red-500' : ''}`}
                        />
                        {errors.roomNumber && (
                          <p className="text-xs text-red-600 dark:text-red-400">{errors.roomNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hostel Selection for Students and Supervisors */}
                  {(formData.role === 'student' || formData.role === 'supervisor') && (
                    <div className="space-y-2">
                      <Label htmlFor="hostel" className="text-sm text-gray-900 dark:text-gray-100">Hostel</Label>
                      <CustomSelect
                        value={formData.hostel}
                        onValueChange={(value) => handleChange('hostel', value)}
                        options={[
                          { value: 'Hostel 1', label: 'Hostel 1' },
                          { value: 'Hostel 2', label: 'Hostel 2' },
                          { value: 'Hostel 3', label: 'Hostel 3' },
                          { value: 'Hostel 4', label: 'Hostel 4' },
                          { value: 'Hostel 5', label: 'Hostel 5' },
                        ]}
                        placeholder="Select your hostel"
                        className={`glass-button ${errors.hostel ? 'border-red-500' : ''}`}
                      />
                      {errors.hostel && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.hostel}</p>
                      )}
                      {formData.role === 'supervisor' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Note: Only one supervisor can be registered per hostel
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm text-gray-900 dark:text-gray-100">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          className={`glass-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm text-gray-900 dark:text-gray-100">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          className={`glass-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                    size="lg"
                  >
                    Create Account
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(2)}
                    className="w-full glass-button"
                  >
                    Back
                  </Button>
                </form>
              </>
            )}

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={onSignIn}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
