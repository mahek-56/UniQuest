import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { getLevelData } from '../utils/gamificationUtils';
import { gamificationApi } from '../services/gamificationApi';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [xp, setXp] = useState(() => storage.get('user_xp', 1240));
  const [coins, setCoins] = useState(() => storage.get('user_coins', 480));
  const [streak, setStreak] = useState(() => storage.get('user_streak', 7));
  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [floatingToasts, setFloatingToasts] = useState([]);
  const [levelUpModal, setLevelUpModal] = useState(null);

  const levelData = getLevelData(xp);

  const refreshStats = useCallback(async () => {
    if (!token) return;
    try {
      const stats = await gamificationApi.getStats();
      if (stats.xp !== undefined) {
        setXp(stats.xp);
        storage.set('user_xp', stats.xp);
      }
      if (stats.coins !== undefined) {
        setCoins(stats.coins);
        storage.set('user_coins', stats.coins);
      }
      if (stats.streak !== undefined) {
        setStreak(stats.streak);
        storage.set('user_streak', stats.streak);
      }

      const qData = await gamificationApi.getQuests();
      setQuests(qData);

      const aData = await gamificationApi.getAchievements();
      setAchievements(aData);
    } catch (e) {
      console.error("Failed to refresh gamification stats:", e);
    }
  }, [token]);

  // Sync with backend stats only when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshStats();
    }
  }, [isAuthenticated, token, refreshStats]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF0052', '#FFD400', '#00C68D', '#0055DA', '#76D2DB']
      });
    } catch (e) {
      // ignore in environments without canvas
    }
  };

  const addXP = (amount, reason = "Learning Activity") => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    setXp((prevXp) => {
      const prevLevel = getLevelData(prevXp).level;
      const nextXp = prevXp + numAmount;
      const nextLevelData = getLevelData(nextXp);

      storage.set('user_xp', nextXp);

      // Check Level Up
      if (nextLevelData.level > prevLevel) {
        triggerConfetti();
        setLevelUpModal({
          newLevel: nextLevelData.level,
          title: nextLevelData.title,
          badge: nextLevelData.badge,
          bonusCoins: 50,
        });
        addCoins(50);
      }

      return nextXp;
    });

    // Add floating toast
    const toastId = Date.now() + Math.random();
    setFloatingToasts((prev) => [
      ...prev,
      { id: toastId, amount: numAmount, reason, type: 'xp' }
    ]);

    // auto dismiss toast after 3.5s
    setTimeout(() => {
      setFloatingToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3500);
  };

  const addCoins = (amount, reason = "") => {
    const numAmount = Number(amount) || 0;
    if (numAmount === 0) return;

    setCoins((prev) => {
      const nextCoins = prev + numAmount;
      storage.set('user_coins', nextCoins);
      return nextCoins;
    });

    if (numAmount > 0 && reason) {
      const toastId = Date.now() + Math.random();
      setFloatingToasts((prev) => [
        ...prev,
        { id: toastId, amount: numAmount, reason, type: 'coin' }
      ]);
      setTimeout(() => {
        setFloatingToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 3500);
    }
  };

  const claimQuest = async (questId) => {
    const result = await gamificationApi.claimQuestReward(questId);
    if (result.success) {
      triggerConfetti();
      addXP(result.xp, "Quest Completed");
      addCoins(result.coins, "Quest Reward");
      await refreshStats();
    }
  };

  const closeLevelUpModal = () => {
    setLevelUpModal(null);
  };

  const dismissToast = (id) => {
    setFloatingToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <GamificationContext.Provider
      value={{
        xp,
        coins,
        streak,
        levelData,
        quests,
        achievements,
        floatingToasts,
        levelUpModal,
        addXP,
        addCoins,
        claimQuest,
        triggerConfetti,
        closeLevelUpModal,
        dismissToast,
        refreshStats,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
