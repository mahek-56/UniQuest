import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, UserCheck } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError('');
    try {
      // Uses the seeded demo account: demo@uniquest.edu / UniQuest2024!
      await login({ email: 'demo@uniquest.edu', password: 'UniQuest2024!' });
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Make sure the backend is running and seeded. Run: python -m app.database.seed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back, Scholar!"
      subtitle="Enter your credentials to continue your learning quest."
      sticker="LOGIN QUEST"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-brand-red rounded-xl text-xs font-bold text-brand-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="University Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@university.edu"
          icon={Mail}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <div className="flex items-center justify-between text-xs font-bold">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" defaultChecked className="rounded border-brand-dark accent-brand-blue" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-brand-blue hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 font-black"
          disabled={loading}
          icon={LogIn}
        >
          {loading ? 'Entering Quest...' : 'Sign In to UniQuest'}
        </Button>
      </form>

      {/* Quick Demo Login Personas */}
      <div className="mt-6 pt-5 border-t-2 border-cream-200">
        <span className="block text-[11px] font-black uppercase tracking-wider text-brand-dark/60 text-center mb-3">
          ⚡ One-Click Demo Access
        </span>
        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={() => handleQuickDemo()}
            icon={UserCheck}
          >
            Demo Login (Alex Rivera)
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs font-bold text-brand-dark/75">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-brand-pink font-black hover:underline">
          Join the Quest Free
        </Link>
      </div>
    </AuthLayout>
  );
};
