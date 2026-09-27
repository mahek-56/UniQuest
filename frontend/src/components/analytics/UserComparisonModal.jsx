import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Users,
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { userApi } from '../../services/userApi';
import { Button } from '../common/Button';

export const UserComparisonModal = ({ isOpen, onClose, initialTargetUserId = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [peers, setPeers] = useState([]);
  const [selectedPeerId, setSelectedPeerId] = useState(initialTargetUserId);
  const [comparison, setComparison] = useState(null);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState(null);

  // Load initial peers list on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchPeers = async () => {
      setLoadingPeers(true);
      try {
        const list = await userApi.searchStudents(searchQuery);
        setPeers(list);
      } catch (err) {
        console.error('Failed to search students:', err);
      } finally {
        setLoadingPeers(false);
      }
    };
    fetchPeers();
  }, [isOpen, searchQuery]);

  // When a peer is selected or initialTargetUserId is passed, load comparison
  useEffect(() => {
    if (!isOpen || !selectedPeerId) return;
    const loadComparison = async () => {
      setLoadingComparison(true);
      setError(null);
      try {
        const data = await userApi.compareStudent(selectedPeerId);
        setComparison(data);
      } catch (err) {
        console.error('Comparison error:', err);
        setError(err.response?.data?.detail || 'Unable to compare with this student.');
        setComparison(null);
      } finally {
        setLoadingComparison(false);
      }
    };
    loadComparison();
  }, [isOpen, selectedPeerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-brutal-lg max-h-[90vh] overflow-y-auto flex flex-col gap-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl border-2 border-brand-dark bg-cream-100 hover:bg-cream-200 flex items-center justify-center font-black cursor-pointer shadow-brutal-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-2">
            <Users className="w-4 h-4" /> Academic Peer Benchmark
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark">
            Compare Academic Progress Side-by-Side
          </h2>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-0.5">
            Select a classmate across your department or university to benchmark XP, quiz accuracy, and subject mastery.
          </p>
        </div>

        {/* Search & Student Picker */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50" />
            <input
              type="text"
              placeholder="Search classmates by name, department, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-50 text-brand-dark font-bold text-xs border-2 border-brand-dark rounded-xl pl-10 pr-4 py-2.5 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {/* Peers Quick Select Pills */}
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto py-1">
            {peers.map((p) => {
              const isSelected = selectedPeerId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeerId(p.id)}
                  className={`px-3 py-1.5 rounded-xl border-2 border-brand-dark text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-brutal-sm'
                      : 'bg-cream-100 hover:bg-cream-200 text-brand-dark'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-brand-green" />
                  <span>{p.full_name}</span>
                  <span className="text-[10px] opacity-75 font-black">Lvl {p.level}</span>
                </button>
              );
            })}
            {peers.length === 0 && !loadingPeers && (
              <span className="text-xs font-medium text-brand-dark/50 italic py-1">
                No matching classmates found. Try another search query.
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border-2 border-brand-red rounded-2xl flex items-center gap-2 text-xs font-bold text-brand-red shadow-brutal-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loadingComparison && (
          <div className="py-12 text-center flex flex-col items-center gap-2">
            <div className="animate-spin text-4xl">⚡</div>
            <p className="font-bold text-xs text-brand-dark">Evaluating Academic Telemetry...</p>
          </div>
        )}

        {/* Side-by-Side Comparison Display */}
        {comparison && !loadingComparison && (
          <div className="flex flex-col gap-6">
            {/* Student Comparison Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* You Card */}
              <div className="bg-blue-50/70 border-2 border-brand-blue rounded-2xl p-5 shadow-brutal flex items-center gap-4">
                <img
                  src={comparison.you.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comparison.you.full_name)}&backgroundColor=0055DA`}
                  alt={comparison.you.full_name}
                  className="w-14 h-14 rounded-2xl border-2 border-brand-dark bg-white shadow-brutal-sm object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase bg-brand-blue text-white px-2 py-0.5 rounded-full">
                      You
                    </span>
                    <span className="text-xs font-black text-brand-dark">Level {comparison.you.level}</span>
                  </div>
                  <h3 className="font-black text-lg text-brand-dark">{comparison.you.full_name}</h3>
                  <p className="text-[11px] font-bold text-brand-dark/60">
                    {comparison.you.department || 'Computer Science'} • {comparison.you.university || 'Tech University'}
                  </p>
                </div>
              </div>

              {/* Peer Card */}
              <div className="bg-amber-50/70 border-2 border-brand-gold rounded-2xl p-5 shadow-brutal flex items-center gap-4">
                <img
                  src={comparison.peer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comparison.peer.full_name)}&backgroundColor=FFD400`}
                  alt={comparison.peer.full_name}
                  className="w-14 h-14 rounded-2xl border-2 border-brand-dark bg-white shadow-brutal-sm object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase bg-brand-gold text-brand-dark px-2 py-0.5 rounded-full border border-brand-dark">
                      Classmate
                    </span>
                    <span className="text-xs font-black text-brand-dark">Level {comparison.peer.level}</span>
                  </div>
                  <h3 className="font-black text-lg text-brand-dark">{comparison.peer.full_name}</h3>
                  <p className="text-[11px] font-bold text-brand-dark/60">
                    {comparison.peer.department || 'Computer Science'} • {comparison.peer.university || 'Tech University'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Table */}
            <div className="bg-white border-2 border-brand-dark rounded-2xl p-4 sm:p-5 shadow-brutal">
              <h4 className="font-black text-xs uppercase tracking-wider text-brand-dark/70 mb-3">
                Key Performance Metrics
              </h4>
              <div className="flex flex-col divide-y divide-cream-200">
                {comparison.comparison_metrics.map((m, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-bold">
                    <span className="w-1/3 text-left text-brand-blue font-black">{m.you}</span>
                    <span className="w-1/3 text-center text-brand-dark font-black uppercase tracking-wider text-[11px]">
                      {m.metric}
                    </span>
                    <span className="w-1/3 text-right text-amber-900 font-black">{m.peer}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Topics vs Weak Topics Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-500 rounded-2xl">
                <h5 className="font-black text-xs text-emerald-950 uppercase mb-2 flex items-center gap-1.5">
                  <span>🏆</span> Your Key Strengths:
                </h5>
                <ul className="text-xs font-bold text-emerald-900 flex flex-col gap-1">
                  {comparison.you.strong_topics.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/70 border-2 border-rose-500 rounded-2xl">
                <h5 className="font-black text-xs text-rose-950 uppercase mb-2 flex items-center gap-1.5">
                  <span>🎯</span> Priority Growth Areas:
                </h5>
                <ul className="text-xs font-bold text-rose-900 flex flex-col gap-1">
                  {comparison.you.weak_topics.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Benchmark Insights */}
            {comparison.insights && comparison.insights.length > 0 && (
              <div className="p-4 bg-cream-100 border-2 border-brand-dark rounded-2xl flex flex-col gap-1.5">
                <span className="font-black text-xs uppercase text-brand-dark flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-pink" /> AI Comparative Diagnostic
                </span>
                {comparison.insights.map((ins, idx) => (
                  <p key={idx} className="text-xs font-medium text-brand-dark/80">
                    • {ins}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty selection state */}
        {!selectedPeerId && !comparison && (
          <div className="py-12 text-center bg-cream-50 border-2 border-dashed border-brand-dark/30 rounded-2xl flex flex-col items-center">
            <span className="text-4xl mb-2">👥</span>
            <h4 className="font-black text-base text-brand-dark">Select a Student to Compare</h4>
            <p className="text-xs font-medium text-brand-dark/60 mt-1 max-w-sm">
              Click on any classmate name above to generate an instant comparative analysis against your academic record.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
