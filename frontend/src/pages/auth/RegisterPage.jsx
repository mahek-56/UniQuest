import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      // Backend expects full_name (not name)
      await register({ full_name: name, email, password });
      navigate('/onboarding');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail && detail.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(detail || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Character"
      subtitle="Join UniQuest and start turning your degree into an adventure."
      sticker="NEW RECRUIT"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-brand-red rounded-xl text-xs font-bold text-brand-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Rivera"
          icon={User}
          required
        />

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
          placeholder="•••••••• (Min 8 chars)"
          icon={Lock}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          icon={Lock}
          required
        />

        <Button
          type="submit"
          variant="pink"
          size="lg"
          className="w-full mt-2 font-black"
          disabled={loading}
          icon={Sparkles}
        >
          {loading ? 'Creating Character...' : 'Begin My Quest 🚀'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs font-bold text-brand-dark/75">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-blue font-black hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};
