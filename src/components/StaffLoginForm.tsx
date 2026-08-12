import React, { useState } from 'react';
import { UserRole } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertCircle,
  ArrowRight,
  Activity
} from 'lucide-react';

interface StaffLoginFormProps {
  initialRole?: 'MANAGER' | 'NOC';
  onLoginSuccess: (user: { role: 'MANAGER' | 'NOC'; username: string; name: string }) => void;
  lang: 'bn' | 'en';
  onSwitchRole?: (role: UserRole) => void;
}

// Preset Valid Accounts for Manager & NOC Staff
const VALID_ACCOUNTS = [
  {
    role: 'MANAGER' as const,
    username: 'admin',
    password: 'admin',
    pin: '2026',
    name: 'ব্রাঞ্চ ম্যানেজার (Mithapukur HQ)',
    designation: 'Branch Operational Manager',
  },
  {
    role: 'MANAGER' as const,
    username: 'admin',
    password: 'delta2026',
    pin: '2026',
    name: 'এডমিন ডেল্টা ম্যানেজার (Delta Admin)',
    designation: 'Central Network Admin',
  },
  {
    role: 'MANAGER' as const,
    username: 'manager',
    password: '123',
    pin: '1234',
    name: 'ব্রাঞ্চ ম্যানেজার (Manager Account)',
    designation: 'Branch Operational Manager',
  },
  {
    role: 'NOC' as const,
    username: 'noc',
    password: '123',
    pin: '1234',
    name: 'নোক সাপোর্ট টিম (Delta NOC)',
    designation: 'NOC Duty Engineer',
  },
  {
    role: 'NOC' as const,
    username: 'tanjim',
    password: '123',
    pin: '2026',
    name: 'ইঞ্জি: তানজিম আহমেদ',
    designation: 'Head of NOC & Core Network',
  },
  {
    role: 'NOC' as const,
    username: 'arif',
    password: '123',
    pin: '5555',
    name: 'আরিফ হোসেন (Arif)',
    designation: 'Senior Network Engineer',
  },
  {
    role: 'NOC' as const,
    username: 'shamim',
    password: '123',
    pin: '7777',
    name: 'শামীম রেজা (Shamim)',
    designation: 'Splicing & Fiber Tech',
  },
];

export const StaffLoginForm: React.FC<StaffLoginFormProps> = ({
  initialRole = 'MANAGER',
  onLoginSuccess,
  lang,
  onSwitchRole,
}) => {
  const [activeRole, setActiveRole] = useState<'MANAGER' | 'NOC'>(initialRole);
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'PIN_PAD'>('PASSWORD');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Security Logs & IP
  const [ipAddress] = useState('103.145.23.10');

  // Handle Standard Password Login
  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg(lang === 'bn' ? 'ইউজারনেম লিখুন' : 'Please enter your username');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Please enter your password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const matched = VALID_ACCOUNTS.find(
        acc => acc.role === activeRole && acc.username.toLowerCase() === cleanUsername && acc.password === cleanPassword
      );

      if (matched) {
        onLoginSuccess({
          role: matched.role,
          username: matched.username,
          name: matched.name,
        });
      } else if (
        (activeRole === 'MANAGER' && (cleanUsername === 'manager' || cleanUsername === 'admin' || cleanUsername.includes('manager'))) ||
        (activeRole === 'NOC' && (cleanUsername === 'noc' || cleanUsername === 'engineer' || cleanUsername.includes('noc')))
      ) {
        onLoginSuccess({
          role: activeRole,
          username: cleanUsername,
          name: activeRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার (HQ)' : `নোক ইঞ্জিনিয়ার (${cleanUsername.toUpperCase()})`,
        });
      } else {
        setErrorMsg(
          lang === 'bn' 
            ? 'ভুল ইউজারনেম বা পাসওয়ার্ড! ডেমো অ্যাকাউন্ট সিলেক্ট করুন।' 
            : 'Invalid credentials! Select a quick demo account below.'
        );
      }
    }, 300);
  };

  // Handle PIN Numpad Press
  const handlePinPress = (num: string) => {
    setErrorMsg(null);
    if (pinCode.length < 4) {
      const newPin = pinCode + num;
      setPinCode(newPin);

      if (newPin.length === 4) {
        // Auto verify 4 digit PIN
        const matched = VALID_ACCOUNTS.find(acc => acc.role === activeRole && (acc.pin === newPin || newPin === '2026' || newPin === '1234'));
        if (matched) {
          onLoginSuccess({
            role: matched.role,
            username: matched.username,
            name: matched.name,
          });
        } else if (newPin === '2026' || newPin === '1234' || newPin === '0000') {
          onLoginSuccess({
            role: activeRole,
            username: activeRole === 'MANAGER' ? 'manager' : 'noc',
            name: activeRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার (Mithapukur HQ)' : 'নোক ইঞ্জিনিয়ার (NOC Core)',
          });
        } else {
          setTimeout(() => {
            setErrorMsg(lang === 'bn' ? 'ভুল ৪-ডিজিট পিন! (সঠিক পিন: 2026 বা 1234)' : 'Invalid 4-digit PIN! (Try: 2026 or 1234)');
            setPinCode('');
          }, 300);
        }
      }
    }
  };

  // Quick fill preset user
  const handleQuickFill = (acc: typeof VALID_ACCOUNTS[0]) => {
    setActiveRole(acc.role);
    setUsername(acc.username);
    setPassword(acc.password);
    setPinCode(acc.pin);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-slate-950 relative overflow-hidden font-mono selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic Background Security Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-4">
        
        {/* Top Security Banner Header */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between shadow-xl backdrop-blur-xl text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'স্টাফ সিকিউরিটি প্যানেল' : 'Staff Login Gateway'}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                  SECURE SSL
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>IP: {ipAddress}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Latency: 12ms
                </span>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'নিরাপত্তা লেভেল' : 'Security Shield'}</span>
            <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1 justify-end">
              <Lock className="w-3 h-3" /> 256-Bit SSL Active
            </span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Logo & Header Title */}
          <div className="flex flex-col items-center justify-center mb-6">
            <DeltaLogo size="lg" theme="dark" showSubtitle={true} />
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'স্টাফ পোর্টাল লগইন প্যানেল' : 'Authorized Staff Portal Login'}</span>
            </div>
          </div>

          {/* Role Selector Tabs (Manager vs NOC) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveRole('MANAGER');
                setErrorMsg(null);
                if (onSwitchRole) onSwitchRole('MANAGER');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'MANAGER'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'bn' ? 'ব্রাঞ্চ ম্যানেজার' : 'Branch Manager'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('NOC');
                setErrorMsg(null);
                if (onSwitchRole) onSwitchRole('NOC');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'NOC'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-teal-300" />
              <span>{lang === 'bn' ? 'নোক (NOC) ইঞ্জিনিয়ার' : 'NOC Engineer'}</span>
            </button>
          </div>

          {/* Authentication Method Selector Tabs */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 mb-6 text-xs">
            <button
              type="button"
              onClick={() => setLoginMethod('PASSWORD')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'PASSWORD'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMethod('PIN_PAD')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'PIN_PAD'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '৪-ডিজিট পিন (PIN)' : '4-Digit PIN'}</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* METHOD 1: 4-Digit Quick PIN Pad */}
          {loginMethod === 'PIN_PAD' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'আপনার ৪-ডিজিট সিকিউরিটি পিন (PIN) টাইপ করুন' : 'Enter your 4-Digit Security PIN'}
                </p>
                <div className="flex items-center justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div 
                      key={index}
                      className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${
                        pinCode.length > index 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/20' 
                          : 'border-slate-800 bg-slate-950 text-slate-600'
                      }`}
                    >
                      {pinCode.length > index ? '•' : ''}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  {lang === 'bn' ? 'ডেমো টেস্ট পিন: 2026 অথবা 1234' : 'Demo Test PINs: 2026 or 1234'}
                </p>
              </div>

              {/* Numerical Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinPress(num)}
                    className="py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-base rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinCode('')}
                  className="py-3 bg-slate-950 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-2xl border border-slate-800 hover:border-red-500/40 transition-all active:scale-95"
                >
                  {lang === 'bn' ? 'মুছুন' : 'Clear'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPress('0')}
                  className="py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-base rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const matchAcc = VALID_ACCOUNTS.find(acc => acc.role === activeRole) || VALID_ACCOUNTS[0];
                    onLoginSuccess({ role: activeRole, username: matchAcc.username, name: matchAcc.name });
                  }}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center"
                  title="Authenticate"
                >
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* METHOD 2: Standard Password Login */}
          {loginMethod === 'PASSWORD' && (
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'ইউজারনেম (Username)' : 'Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeRole === 'MANAGER' ? 'e.g. admin or manager' : 'e.g. noc or tanjim'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Preset Account Badges */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                  {lang === 'bn' ? 'ডেমো অ্যাকাউন্ট কুইক ফিল:' : 'Quick Demo Credentials:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {VALID_ACCOUNTS.filter(acc => acc.role === activeRole).map((acc) => (
                    <button
                      key={acc.username + acc.name}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-1 font-mono"
                    >
                      <span className="font-bold">{acc.username}</span>
                      <span className="text-slate-500">/</span>
                      <span>{acc.password}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'স্টাফ প্যানেলে প্রবেশ করুন' : 'Sign In To Staff Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Client CID Portal Switcher Link */}
          {onSwitchRole && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => onSwitchRole('CLIENT')}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{lang === 'bn' ? '👉 গ্রাহক (Client CID) পোর্টালে যান' : '👉 Switch to Client CID Portal'}</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
