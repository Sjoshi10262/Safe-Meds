import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

// --- Types ---

interface AuthProps {
  onAuthSuccess: (isNewUser: boolean) => void;
  onBack: () => void;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  general?: string;
}

// --- Reusable UI Components ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ElementType;
  error?: string;
  rightElement?: React.ReactNode;
}

const FormInput: React.FC<InputProps> = ({ label, icon: Icon, error, rightElement, className = "", ...props }) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      {error && (
        <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-fade-in">
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
    <div className={`relative group transition-all duration-300 ${error ? 'animate-shake' : ''}`}>
      <Icon 
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
          error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-blue-500'
        }`} 
        size={20} 
      />
      <input 
        className={`w-full bg-white dark:bg-slate-900 border rounded-2xl py-4 pl-12 pr-12 font-bold text-slate-800 dark:text-slate-100 outline-none transition-all shadow-sm
          ${error 
            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
          } ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

interface SocialButtonProps {
  provider: string;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  colorClass: string; // Tailored glow color
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, isLoading, isDisabled, onClick, icon, colorClass }) => (
  <button 
    type="button" 
    onClick={onClick} 
    disabled={isDisabled || isLoading}
    className={`w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-300 relative group
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 hover:border-transparent'}
      ${!isDisabled && !isLoading ? colorClass : ''}
    `}
  >
    {isLoading ? (
      <Loader2 className="animate-spin text-slate-400" size={24} />
    ) : (
      <div className="transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
    )}
  </button>
);

const PrimaryButton: React.FC<{ isLoading: boolean; children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }> = ({ isLoading, children, onClick, type = "submit" }) => (
  <button 
    type={type}
    onClick={onClick}
    disabled={isLoading}
    className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transform transition-all disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
  >
    {isLoading && (
       <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
    )}
    {isLoading ? (
       <Loader2 className="animate-spin" size={24} />
    ) : (
       children
    )}
  </button>
);

// --- Main Logic ---

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
  // State
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name as keyof FormErrors] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (isSignUp && !formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API Call to /api/auth/login
      // In a real scenario: const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(formData) });
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Realistic network delay

      // Mock validation failure for demo purposes
      if (formData.email.includes('error')) {
        throw new Error('User not found. Please check your credentials.');
      }

      onAuthSuccess(isSignUp);
    } catch (error: any) {
      setErrors(prev => ({ ...prev, general: error.message || 'Authentication failed' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setSocialLoading(provider);
    
    // UI Feedback delay before "redirecting"
    setTimeout(() => {
        // In a real Next.js app or similar, this would be the actual endpoint
        // Since we are in a client-side preview, we log it but don't break the page
        console.log(`Redirecting to /auth/${provider}`);
        window.location.href = `/auth/${provider}`;
        
        // Note: In this preview environment, this might lead to a 404 page. 
        // We'll reset loading after a timeout if the page doesn't unload.
        setTimeout(() => setSocialLoading(null), 5000); 
    }, 800);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({ fullName: '', email: '', password: '' });
  };

  return (
    <div className="h-full w-full flex flex-col px-6 pt-12 pb-6 relative overflow-hidden overflow-y-auto no-scrollbar">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-20 active:scale-95"
      >
        <ArrowRight size={20} className="rotate-180" />
      </button>

      {/* Header */}
      <div className="mt-12 mb-8 animate-slide-up">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {isSignUp ? 'Start your safe medication journey.' : 'Sign in to access your medicine cabinet.'}
        </p>
      </div>

      {/* General Error Alert */}
      {errors.general && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-center gap-3 animate-shake">
          <AlertCircle className="text-rose-500 shrink-0" size={20} />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-300">{errors.general}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-5 animate-slide-up-delay-1 flex-1 flex flex-col">
        
        {isSignUp && (
          <FormInput
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="John Doe"
            icon={User}
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
        )}

        <FormInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormInput
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="pt-2">
            <PrimaryButton isLoading={isSubmitting}>
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={20} />
            </PrimaryButton>
        </div>

        {/* Divider */}
        <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Or continue with</span>
            </div>
        </div>

        {/* Social Buttons Row */}
        <div className="flex items-center justify-center gap-4 mb-4">
           {/* Google */}
           <SocialButton 
             provider="google"
             isLoading={socialLoading === 'google'}
             isDisabled={socialLoading !== null && socialLoading !== 'google'}
             onClick={() => handleOAuthLogin('google')}
             colorClass="hover:shadow-[0_0_20px_rgba(66,133,244,0.4)] hover:border-blue-400"
             icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
             }
           />
           
           {/* Facebook */}
           <SocialButton 
             provider="facebook"
             isLoading={socialLoading === 'facebook'}
             isDisabled={socialLoading !== null && socialLoading !== 'facebook'}
             onClick={() => handleOAuthLogin('facebook')}
             colorClass="hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] hover:border-blue-600"
             icon={
              <svg className="w-6 h-6 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
             }
           />

           {/* GitHub */}
           <SocialButton 
             provider="github"
             isLoading={socialLoading === 'github'}
             isDisabled={socialLoading !== null && socialLoading !== 'github'}
             onClick={() => handleOAuthLogin('github')}
             colorClass="hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:border-slate-400"
             icon={
              <svg className="w-6 h-6 text-slate-800 dark:text-white fill-current" viewBox="0 0 24 24">
                 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
             }
           />

           {/* X / Twitter */}
           <SocialButton 
             provider="x"
             isLoading={socialLoading === 'x'}
             isDisabled={socialLoading !== null && socialLoading !== 'x'}
             onClick={() => handleOAuthLogin('x')}
             colorClass="hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-slate-500"
             icon={
              <svg className="w-5 h-5 text-slate-900 dark:text-white fill-current" viewBox="0 0 24 24">
                 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
             }
           />
        </div>

        {/* Footer Switcher */}
        <div className="mt-auto text-center pb-4">
           <p className="text-slate-500 font-medium text-sm">
             {isSignUp ? 'Already have an account?' : "Don't have an account?"}
             <button 
               type="button"
               onClick={toggleMode}
               className="ml-2 text-blue-600 dark:text-blue-400 font-bold hover:underline focus:outline-none"
             >
               {isSignUp ? 'Sign In' : 'Sign Up'}
             </button>
           </p>
        </div>

      </form>

    </div>
  );
};

export default Auth;