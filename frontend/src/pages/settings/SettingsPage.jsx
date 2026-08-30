import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, User, Bell, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [university, setUniversity] = useState(user?.university || 'National Tech University');
  const [department, setDepartment] = useState(user?.department || 'Computer Engineering');
  const [dailyTarget, setDailyTarget] = useState(user?.dailyStudyTargetMinutes || 45);
  const [studyTime, setStudyTime] = useState(user?.preferredStudyTime || 'Evening (6 PM - 9 PM)');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      name,
      university,
      department,
      dailyStudyTargetMinutes: dailyTarget,
      preferredStudyTime: studyTime,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto">
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
            Configure your student identity, study targets, and reminder alerts.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border-2 border-brand-green rounded-2xl flex items-center gap-2 text-xs font-black text-brand-green shadow-brutal-sm">
          <CheckCircle2 className="w-5 h-5" /> Settings updated successfully!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col gap-6">
        <h3 className="font-black text-lg text-brand-dark pb-3 border-b-2 border-cream-200">
          Student Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
          />

          <Input
            label="University"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          />

          <Input
            label="Department / Major"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <Input
            label="Daily Study Target (Minutes)"
            type="number"
            value={dailyTarget}
            onChange={(e) => setDailyTarget(e.target.value)}
          />
        </div>

        <h3 className="font-black text-lg text-brand-dark pt-4 pb-3 border-b-2 border-cream-200">
          Study Rhythm & Revision Reminders
        </h3>

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

        <div className="pt-4 border-t-2 border-cream-200 flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} className="font-black">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
