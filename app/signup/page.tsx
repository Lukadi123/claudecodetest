'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#93b44a' };
  return { score, label: 'Strong', color: '#BFF549' };
}

export default function SignUpPage() {
  const { user, profile, loading: authLoading, signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (!authLoading && user) {
      if (profile && profile.avatar_id) {
        router.push('/');
      } else {
        router.push('/choose-avatar');
      }
    }
  }, [authLoading, user, profile, router]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#BFF549] animate-spin" />
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword || !age || !gender) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1) {
      setError('Please enter a valid age.');
      return;
    }

    setSubmitting(true);

    const result = await signUp(email, password, {
      name: name.trim(),
      age: ageNum,
      gender,
      email: email.trim(),
    });

    if (result.error) {
      setError(result.error);
    }
    // Always reset submitting — navigation happens via useEffect watching `user`
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight">
            News<span className="text-[#BFF549]">Pulse</span>
          </h1>
          <p className="text-sm text-[#99A1AF] mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs text-[#99A1AF] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#93b44a]/30 text-white text-sm placeholder-[#99A1AF]/60 focus:border-[#BFF549] focus:outline-none focus:bg-white/10 transition-all rounded-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs text-[#99A1AF] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#93b44a]/30 text-white text-sm placeholder-[#99A1AF]/60 focus:border-[#BFF549] focus:outline-none focus:bg-white/10 transition-all rounded-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs text-[#99A1AF] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-[#93b44a]/30 text-white text-sm placeholder-[#99A1AF]/60 focus:border-[#BFF549] focus:outline-none focus:bg-white/10 transition-all rounded-sm"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99A1AF] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-xs text-[#99A1AF] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border text-white text-sm placeholder-[#99A1AF]/60 focus:outline-none focus:bg-white/10 transition-all rounded-sm ${
                    passwordsMismatch
                      ? 'border-red-400/60 focus:border-red-400'
                      : passwordsMatch
                        ? 'border-[#BFF549]/60 focus:border-[#BFF549]'
                        : 'border-[#93b44a]/30 focus:border-[#BFF549]'
                  }`}
                  placeholder="Re-enter password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {passwordsMatch && <Check className="w-4 h-4 text-[#BFF549]" />}
                  {passwordsMismatch && <X className="w-4 h-4 text-red-400" />}
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-[#99A1AF] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-xs text-[#99A1AF] uppercase tracking-wider mb-2">
                Age
              </label>
              <input
                id="age"
                type="number"
                required
                min={1}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#93b44a]/30 text-white text-sm placeholder-[#99A1AF]/60 focus:border-[#BFF549] focus:outline-none focus:bg-white/10 transition-all rounded-sm"
                placeholder="25"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs text-[#99A1AF] uppercase tracking-wider mb-2">
                Gender
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender('Male')}
                  className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                    gender === 'Male'
                      ? 'bg-[#93b44a] text-black border-[#93b44a]'
                      : 'bg-white/5 text-[#99A1AF] border-[#93b44a]/30 hover:border-[#BFF549] hover:text-white'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female')}
                  className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                    gender === 'Female'
                      ? 'bg-[#93b44a] text-black border-[#93b44a]'
                      : 'bg-white/5 text-[#99A1AF] border-[#93b44a]/30 hover:border-[#BFF549] hover:text-white'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm bg-red-400/10 px-3 py-2 border border-red-400/20"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#93b44a] text-black font-semibold text-sm uppercase tracking-wider hover:bg-[#BFF549] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[#99A1AF] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#BFF549] hover:underline font-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
