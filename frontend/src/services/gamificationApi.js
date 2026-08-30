import { apiClient } from './api';
import { MOCK_QUESTS } from '../data/mockQuests';
import { MOCK_ACHIEVEMENTS } from '../data/mockAchievements';
import { MOCK_LEADERBOARD } from '../data/mockLeaderboard';
import { storage } from '../utils/storage';

export const gamificationApi = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/gamification/stats');
      return response.data;
    } catch (e) {
      // Offline fallback — use cached values
      return {
        xp: storage.get('user_xp', 0),
        coins: storage.get('user_coins', 0),
        streak: storage.get('user_streak', 0),
        level: storage.get('user_level', 1),
        rank: storage.get('user_rank', 0),
      };
    }
  },

  getQuests: async () => {
    try {
      const response = await apiClient.get('/gamification/quests');
      return response.data;
    } catch (e) {
      return storage.get('quests_data', MOCK_QUESTS);
    }
  },

  claimQuestReward: async (questId) => {
    try {
      const response = await apiClient.post(`/gamification/quests/${questId}/claim`);
      return response.data;
    } catch (e) {
      // Offline fallback
      const quests = storage.get('quests_data', MOCK_QUESTS);
      const quest = quests.find(q => q.id === questId);
      const updated = quests.map(q => q.id === questId ? { ...q, claimed: true } : q);
      storage.set('quests_data', updated);
      return {
        success: true,
        xp: quest?.xp_reward || quest?.xpReward || 40,
        coins: quest?.coin_reward || quest?.coinReward || 15,
        message: 'Quest reward claimed!',
      };
    }
  },

  getAchievements: async () => {
    try {
      const response = await apiClient.get('/gamification/achievements');
      return response.data;
    } catch (e) {
      return storage.get('achievements_data', MOCK_ACHIEVEMENTS);
    }
  },

  getLeaderboard: async (scope = 'weekly') => {
    try {
      // Backend supports both ?scope= and ?period_type= — use scope
      const response = await apiClient.get(`/gamification/leaderboard?scope=${scope}`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.entries || []);
      return list.map((item, idx) => ({
        ...item,
        rank: item.rank || idx + 1,
        name: item.name || item.full_name || 'Scholar',
        avatar: item.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.name || item.full_name || String(idx))}&backgroundColor=FFD400`,
      }));
    } catch (e) {
      const fallback = MOCK_LEADERBOARD[scope] || MOCK_LEADERBOARD.weekly || [];
      const list = Array.isArray(fallback) ? fallback : (fallback.entries || []);
      return list.map((item, idx) => ({
        ...item,
        rank: item.rank || idx + 1,
        name: item.name || item.full_name || 'Scholar',
        avatar: item.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.name || item.full_name || String(idx))}&backgroundColor=FFD400`,
      }));
    }
  },

  getRewards: async () => {
    try {
      const response = await apiClient.get('/gamification/rewards');
      return response.data;
    } catch (e) {
      return [];
    }
  },

  redeemReward: async (rewardId) => {
    const response = await apiClient.post('/gamification/coins/redeem', { reward_id: rewardId });
    return response.data;
  },

  getStreak: async () => {
    try {
      const response = await apiClient.get('/gamification/streak');
      return response.data;
    } catch (e) {
      return { current_streak: 0, longest_streak: 0 };
    }
  },
};
