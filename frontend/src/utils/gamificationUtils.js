/**
 * UniQuest Gamification Utility Functions
 */

export const LEVEL_TITLES = [
  { minLevel: 50, title: "Legend", color: "#FF0052", badge: "👑" },
  { minLevel: 40, title: "Master", color: "#0055DA", badge: "⚡" },
  { minLevel: 30, title: "Scholar", color: "#00C68D", badge: "📜" },
  { minLevel: 20, title: "Explorer", color: "#76D2DB", badge: "🧭" },
  { minLevel: 10, title: "Learner", color: "#FFD400", badge: "🌱" },
  { minLevel: 1,  title: "Beginner", color: "#FFE5BF", badge: "🎒" },
];

export const XP_PER_LEVEL = 200;

export const getLevelData = (xp = 0) => {
  const currentXP = Math.max(0, Number(xp) || 0);
  const level = Math.min(50, Math.floor(currentXP / XP_PER_LEVEL) + 1);
  const xpCurrentLevelStart = (level - 1) * XP_PER_LEVEL;
  const xpNextLevelStart = level * XP_PER_LEVEL;
  const xpInCurrentLevel = currentXP - xpCurrentLevelStart;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100));

  const titleObj = LEVEL_TITLES.find(t => level >= t.minLevel) || LEVEL_TITLES[LEVEL_TITLES.length - 1];

  return {
    level,
    title: titleObj.title,
    badge: titleObj.badge,
    color: titleObj.color,
    totalXP: currentXP,
    xpInCurrentLevel,
    xpRequiredForNext: XP_PER_LEVEL,
    remainingXP: xpNextLevelStart - currentXP,
    progressPercent,
  };
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};
