import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, User, GraduationCap, Target, Clock, Heart } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=0055DA",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Maya&backgroundColor=00C68D",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=FF0052",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Siddharth&backgroundColor=FFD400",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Elena&backgroundColor=76D2DB",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=36064D",
];

const INTEREST_TAGS = [
  "Relational Databases",
  "Operating Systems",
  "Distributed Systems",
  "Machine Learning & AI",
  "Graph Algorithms",
  "Computer Networks",
  "System Design",
  "Web Engineering",
  "Cybersecurity",
];

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { addXP, addCoins, triggerConfetti } = useGamification();

  // Form State
  const [name, setName] = useState(user?.name || "Alex Rivera");
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [university, setUniversity] = useState("National Tech University");
  const [department, setDepartment] = useState("Computer Engineering");
  const [semester, setSemester] = useState("Semester 4");
  const [interests, setInterests] = useState(["Relational Databases", "Operating Systems", "Machine Learning & AI"]);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(45);
  const [targetGrade, setTargetGrade] = useState("A+");
  const [preferredStudyTime, setPreferredStudyTime] = useState("Evening (6 PM - 9 PM)");

  const toggleInterest = (tag) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = async () => {
    let parsedSemester = null;
    if (typeof semester === 'string') {
      const match = semester.match(/\d+/);
      if (match) {
        parsedSemester = parseInt(match[0], 10);
      }
    } else if (typeof semester === 'number') {
      parsedSemester = semester;
    }

    const onboardingPayload = {
      name,
      avatar,
      university,
      department,
      semester: parsedSemester,
      interests: Array.isArray(interests) ? interests.join(',') : interests,
      dailyStudyTargetMinutes: Number(dailyTargetMinutes),
      targetGrade,
      preferredStudyTime,
      onboardingCompleted: true,
    };

    await completeOnboarding(onboardingPayload);
    triggerConfetti();
    addXP(50, "Onboarding Quest Completed");
    addCoins(25, "New Scholar Welcome Bonus");
    navigate('/dashboard');
  };

  const nextStep = () => setStep(s => Math.min(totalSteps, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">🛡️</span>
        <span className="font-black text-2xl text-brand-dark">
          Uni<span className="text-brand-pink">Quest</span> Onboarding
        </span>
      </div>

      {/* Main Wizard Card */}
      <div className="w-full max-w-xl bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal-lg relative">
        {/* Step Indicator Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-black text-brand-dark mb-2">
            <span className="uppercase tracking-wider">Step {step} of {totalSteps}</span>
            <span className="text-brand-blue font-extrabold">{Math.round((step / totalSteps) * 100)}% Ready</span>
          </div>
          <ProgressBar progress={step} max={totalSteps} color="gold" height="sm" />
        </div>

        {/* STEP 1: Personal Info & Avatar */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">Customize Your Avatar</h2>
              <p className="text-xs font-medium text-brand-dark/70 mt-1">
                Choose your character representation on campus leaderboards.
              </p>
            </div>

            <Input
              label="Your Adventurer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              icon={User}
            />

            <div>
              <label className="font-extrabold text-xs uppercase tracking-wider text-brand-dark mb-2 block">
                Select Mascot Avatar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setAvatar(imgUrl)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-brand-dark overflow-hidden cursor-pointer transition-all ${
                      avatar === imgUrl ? 'ring-4 ring-brand-gold scale-105 shadow-brutal bg-cream-100' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Academic Background */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">Academic Information</h2>
              <p className="text-xs font-medium text-brand-dark/70 mt-1">
                Help us align course modules with your university curriculum.
              </p>
            </div>

            <Input
              label="University / College"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. National Tech University"
              icon={GraduationCap}
            />

            <Select
              label="Department / Major"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: "Computer Engineering", label: "Computer Engineering" },
                { value: "Computer Science", label: "Computer Science" },
                { value: "Data Science & AI", label: "Data Science & Artificial Intelligence" },
                { value: "Information Technology", label: "Information Technology" },
                { value: "Electrical & Computer Engineering", label: "Electrical & Computer Engineering" },
              ]}
            />

            <Select
              label="Current Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={[
                { value: "Semester 1", label: "Semester 1 (Freshman)" },
                { value: "Semester 2", label: "Semester 2 (Freshman)" },
                { value: "Semester 3", label: "Semester 3 (Sophomore)" },
                { value: "Semester 4", label: "Semester 4 (Sophomore)" },
                { value: "Semester 5", label: "Semester 5 (Junior)" },
                { value: "Semester 6", label: "Semester 6 (Junior)" },
                { value: "Semester 7", label: "Semester 7 (Senior)" },
                { value: "Semester 8", label: "Semester 8 (Senior)" },
              ]}
            />
          </div>
        )}

        {/* STEP 3: Learning Interests */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">Subjects of Interest</h2>
              <p className="text-xs font-medium text-brand-dark/70 mt-1">
                Select the topics you want to prioritize for daily quests and smart revisions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {INTEREST_TAGS.map((tag) => {
                const selected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 border-brand-dark transition-all cursor-pointer select-none ${
                      selected
                        ? 'bg-brand-pink text-white shadow-brutal scale-105'
                        : 'bg-cream-100 text-brand-dark hover:bg-white'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Goals & Daily Targets */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">Set Your Study Target</h2>
              <p className="text-xs font-medium text-brand-dark/70 mt-1">
                Consistency is key to keeping streaks and topping leaderboards.
              </p>
            </div>

            <div>
              <label className="font-extrabold text-xs uppercase tracking-wider text-brand-dark mb-2 block">
                Daily Study Target
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyTargetMinutes(mins)}
                    className={`p-3 rounded-2xl border-2 border-brand-dark font-black text-sm text-center transition-all cursor-pointer ${
                      dailyTargetMinutes === mins
                        ? 'bg-brand-gold text-brand-dark shadow-brutal scale-105'
                        : 'bg-cream-100 text-brand-dark/70 hover:bg-white'
                    }`}
                  >
                    {mins} mins/day
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Target Semester Grade"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              options={[
                { value: "A+", label: "A+ (GPA 4.0 - Valedictorian)" },
                { value: "A", label: "A (GPA 3.8 - Dean's List)" },
                { value: "B+", label: "B+ (GPA 3.5 - Solid Honor)" },
                { value: "B", label: "B (GPA 3.0)" },
              ]}
            />
          </div>
        )}

        {/* STEP 5: Study Preferences & Finish */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">Preferred Study Time</h2>
              <p className="text-xs font-medium text-brand-dark/70 mt-1">
                When are you most focused? We'll schedule optimal AI revisions for you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Early Bird", time: "Morning (7 AM - 10 AM)", icon: "🌅" },
                { label: "Daytime Focus", time: "Afternoon (1 PM - 4 PM)", icon: "☀️" },
                { label: "Evening Scholar", time: "Evening (6 PM - 9 PM)", icon: "🌆" },
                { label: "Night Owl", time: "Late Night (10 PM - 1 AM)", icon: "🌙" },
              ].map((slot) => (
                <div
                  key={slot.label}
                  onClick={() => setPreferredStudyTime(slot.time)}
                  className={`p-4 rounded-2xl border-2 border-brand-dark cursor-pointer transition-all flex items-center gap-3 ${
                    preferredStudyTime === slot.time
                      ? 'bg-brand-blue text-white shadow-brutal scale-[1.02]'
                      : 'bg-cream-100 text-brand-dark hover:bg-white'
                  }`}
                >
                  <span className="text-2xl">{slot.icon}</span>
                  <div>
                    <h4 className="font-black text-sm">{slot.label}</h4>
                    <p className={`text-xs ${preferredStudyTime === slot.time ? 'text-blue-100' : 'text-brand-dark/60'}`}>
                      {slot.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quest Completion Bonus Banner */}
            <div className="mt-2 p-4 bg-amber-50 border-2 border-brand-gold rounded-2xl flex items-center justify-between shadow-brutal-sm">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎁</span>
                <div>
                  <h4 className="font-black text-xs text-brand-dark uppercase">Onboarding Reward</h4>
                  <p className="text-xs font-bold text-amber-900">+50 XP & +25 Coins on completion!</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-brand-pink animate-spin" />
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-cream-200 mt-6">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={prevStep} icon={ArrowLeft}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button variant="primary" size="md" onClick={nextStep} icon={ArrowRight}>
              Continue
            </Button>
          ) : (
            <Button variant="pink" size="lg" onClick={handleFinish} icon={Sparkles}>
              Finish & Claim +50 XP! 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
