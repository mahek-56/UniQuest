import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  User,
  Sparkles,
  Shuffle,
  Check,
  Palette,
  GraduationCap,
  Building2,
  Clock,
  Target,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';

const PRESET_AVATARS = [
  { id: 'bot-alex', name: 'Cobalt Pilot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=0055DA' },
  { id: 'bot-maya', name: 'Emerald Scout', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maya&backgroundColor=00C68D' },
  { id: 'bot-marcus', name: 'Ruby Vanguard', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=FF0052' },
  { id: 'bot-sid', name: 'Gold Sentinel', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Siddharth&backgroundColor=FFD400' },
  { id: 'bot-elena', name: 'Cyan Voyager', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena&backgroundColor=76D2DB' },
  { id: 'bot-nova', name: 'Neon Spectre', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=36064D' },
  { id: 'bot-cyber', name: 'Solaris Spark', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberTitan&backgroundColor=FF6B00' },
  { id: 'bot-quantum', name: 'Quantum Core', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum&backgroundColor=00E5FF' },
  { id: 'bot-zenith', name: 'Cosmic Scholar', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zenith&backgroundColor=7928CA' },
  { id: 'bot-spark', name: 'Thunder Unit', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=FFD400' },
  { id: 'bot-shadow', name: 'Stealth Agent', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow&backgroundColor=1A1A24' },
  { id: 'bot-aurora', name: 'Aurora Prime', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aurora&backgroundColor=00C68D' },
];

const RANDOM_SEEDS = [
  'AstroScholar', 'CyberPhoenix', 'BinaryWizard', 'LogicKnight',
  'CodeNinja', 'PixelMaster', 'DataDrake', 'AlgoSage', 'TensorTitan'
];

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || user?.full_name || 'Alex Rivera');
  const [avatar, setAvatar] = useState(
    user?.avatar || user?.avatar_url || PRESET_AVATARS[0].url
  );
  const [customSeed, setCustomSeed] = useState('');
  const [university, setUniversity] = useState(user?.university || 'National Tech University');
  const [department, setDepartment] = useState(user?.department || 'Computer Engineering');
  const [dailyTarget, setDailyTarget] = useState(
    user?.dailyStudyTargetMinutes || user?.daily_study_target_minutes || 45
  );
  const [studyTime, setStudyTime] = useState(
    user?.preferredStudyTime || user?.preferred_study_time || 'Evening (6 PM - 9 PM)'
  );
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial state if user loads after mount
  useEffect(() => {
    if (user) {
      if (user.name || user.full_name) setName(user.name || user.full_name);
      if (user.avatar || user.avatar_url) setAvatar(user.avatar || user.avatar_url);
      if (user.university) setUniversity(user.university);
      if (user.department) setDepartment(user.department);
      if (user.dailyStudyTargetMinutes || user.daily_study_target_minutes) {
        setDailyTarget(user.dailyStudyTargetMinutes || user.daily_study_target_minutes);
      }
      if (user.preferredStudyTime || user.preferred_study_time) {
        setStudyTime(user.preferredStudyTime || user.preferred_study_time);
      }
    }
  }, [user]);

  const handleRollRandom = () => {
    const randomSeed = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)] + Math.floor(Math.random() * 100);
    const bgColors = ['0055DA', '00C68D', 'FF0052', 'FFD400', '76D2DB', '7928CA', 'FF6B00'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const generatedUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(randomSeed)}&backgroundColor=${randomBg}`;
    setAvatar(generatedUrl);
    setCustomSeed(randomSeed);
  };

  const handleCustomSeedChange = (e) => {
    const seed = e.target.value;
    setCustomSeed(seed);
    if (seed.trim()) {
      const generatedUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed.trim())}&backgroundColor=FFD400`;
      setAvatar(generatedUrl);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        full_name: name,
        avatar,
        avatar_url: avatar,
        university,
        department,
        dailyStudyTargetMinutes: Number(dailyTarget),
        daily_study_target_minutes: Number(dailyTarget),
        preferredStudyTime: studyTime,
        preferred_study_time: studyTime,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Error saving profile settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <Settings className="w-4 h-4" /> Account & Preferences
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1">
            Configure your student identity, avatar mascot, study targets, and reminder alerts.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border-3 border-brand-green rounded-2xl flex items-center gap-3 text-sm font-black text-brand-green shadow-brutal animate-bounce-slight">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>Profile, mascot avatar, and preferences updated successfully! Changes are live across your sidebar and leaderboard.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col gap-8">
        
        {/* SECTION 1: Avatar Mascot Selector */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b-2 border-cream-200 mb-6">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-blue" />
              <h3 className="font-black text-lg text-brand-dark">
                Mascot & Profile Avatar
              </h3>
            </div>
            <span className="text-xs font-bold text-brand-dark/60">
              Select preset or generate custom
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 sm:p-6 bg-cream-50 border-2 border-brand-dark rounded-2xl shadow-brutal-sm mb-6">
            {/* Active Avatar Preview */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-3 border-brand-dark bg-brand-gold shadow-brutal overflow-hidden glow-gold">
                <img src={avatar} alt="Active Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-pink text-white border-2 border-brand-dark rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-brutal-sm">
                Active
              </div>
            </div>

            {/* Custom Avatar Generator Controls */}
            <div className="flex-1 w-full flex flex-col gap-3">
              <div>
                <h4 className="font-black text-sm text-brand-dark flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold" />
                  Custom Avatar Generator
                </h4>
                <p className="text-xs font-medium text-brand-dark/70 mt-0.5">
                  Type a nickname or roll a random mascot seed to create a unique avatar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={customSeed}
                    onChange={handleCustomSeedChange}
                    placeholder="Enter custom avatar name/seed..."
                    className="w-full bg-white text-brand-dark font-bold text-xs sm:text-sm border-2 border-brand-dark rounded-xl px-3.5 py-2.5 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue placeholder:text-brand-dark/40"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRollRandom}
                  className="flex items-center gap-2 bg-brand-gold text-brand-dark font-black text-xs uppercase px-4 py-2.5 rounded-xl border-2 border-brand-dark shadow-brutal-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" /> Roll Random 🎲
                </button>
              </div>
            </div>
          </div>

          {/* Preset Avatars Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase text-brand-dark/70 tracking-wider">
              Choose from Preset Mascot Avatars:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {PRESET_AVATARS.map((item) => {
                const isSelected = avatar === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAvatar(item.url);
                      setCustomSeed('');
                    }}
                    className={`relative group rounded-2xl border-2 border-brand-dark p-2 transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-blue/10 border-brand-blue ring-3 ring-brand-blue shadow-brutal scale-105'
                        : 'bg-white hover:bg-cream-100 shadow-brutal-sm hover:scale-102'
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-brand-dark/40 bg-white overflow-hidden">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black text-brand-dark truncate max-w-full">
                      {item.name}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 bg-brand-blue text-white rounded-full w-5 h-5 flex items-center justify-center border border-brand-dark shadow-brutal-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: Student Profile Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b-2 border-cream-200 mb-6">
            <User className="w-5 h-5 text-brand-blue" />
            <h3 className="font-black text-lg text-brand-dark">
              Student Profile Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              placeholder="e.g. Alex Rivera"
              required
            />

            <Input
              label="University / Institution"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              icon={GraduationCap}
              placeholder="e.g. charusat university"
              required
            />

            <Input
              label="Department / Major"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              icon={Building2}
              placeholder="e.g. Data Science & AI"
              required
            />

            <Input
              label="Daily Study Target (Minutes)"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              icon={Target}
              min="5"
              max="600"
              required
            />
          </div>
        </div>

        {/* SECTION 3: Study Rhythm & Revision Reminders */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b-2 border-cream-200 mb-6">
            <Clock className="w-5 h-5 text-brand-blue" />
            <h3 className="font-black text-lg text-brand-dark">
              Study Rhythm & Revision Reminders
            </h3>
          </div>

          <Select
            label="Preferred Study Window"
            value={studyTime}
            onChange={(e) => setStudyTime(e.target.value)}
            options={[
              { value: "Morning (7 AM - 10 AM)", label: "Morning (7 AM - 10 AM)" },
              { value: "Afternoon (1 PM - 4 PM)", label: "Afternoon (1 PM - 4 PM)" },
              { value: "Evening (6 PM - 9 PM)", label: "Evening (6 PM - 9 PM)" },
              { value: "Late Night (10 PM - 1 AM)", label: "Late Night (10 PM - 1 AM)" },
            ]}
          />
        </div>

        {/* Save Action Bar */}
        <div className="pt-4 border-t-2 border-cream-200 flex items-center justify-between">
          <p className="text-xs font-bold text-brand-dark/60">
            Updates will reflect instantly in the sidebar, leaderboard & profile.
          </p>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Save}
            disabled={isSaving}
            className="font-black"
          >
            {isSaving ? 'Saving Changes...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
};
