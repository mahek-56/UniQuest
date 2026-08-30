import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <AuthLayout
      title="Recover Your Quest Key"
      subtitle="Enter your university email to receive a password reset token."
      sticker="KEY RECOVERY"
    >
      {submitted ? (
        <div className="flex flex-col items-center text-center p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-brand-green mb-2" />
          <h3 className="font-black text-base text-brand-dark mb-1">Reset Link Sent!</h3>
          <p className="text-xs font-medium text-brand-dark/70 mb-4">
            We sent a secure recovery link to <span className="font-bold">{email}</span>. Please check your inbox.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="primary" size="md" className="w-full font-black">
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
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

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2 font-black">
            Send Reset Instructions
          </Button>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-dark/70 hover:text-brand-dark mt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </form>
      )}
    </AuthLayout>
  );
};
