import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-3xl bg-brand-gold border-4 border-brand-dark flex items-center justify-center text-5xl shadow-brutal mb-6 animate-bounce-slight">
        🧭
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-brand-dark tracking-tight mb-2">
        404 — Quest Lost!
      </h1>
      <p className="text-sm sm:text-base font-medium text-brand-dark/70 max-w-md mb-8">
        Looks like you took a detour into an uncharted territory. Let's get you back to the main quest route!
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="lg" icon={Home} className="font-black">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
