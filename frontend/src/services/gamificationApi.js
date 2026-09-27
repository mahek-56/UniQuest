import { apiClient } from './api';
import { MOCK_QUESTS } from '../data/mockQuests';
import { MOCK_ACHIEVEMENTS } from '../data/mockAchievements';
import { MOCK_LEADERBOARD } from '../data/mockLeaderboard';
import { storage } from '../utils/storage';

const normalizeQuest = (item) => {
  const current = item.current !== undefined ? item.current : (item.progress || 0);
  const target = item.target !== undefined ? item.target : (item.target_value || 1);
  const completed = item.completed !== undefined ? item.completed : (current >= target);
  const claimed = item.claimed !== undefined ? item.claimed : false;

  return {
    id: item.id,
    quest_id: item.quest_id || item.id,
    title: item.title || 'Daily Quest',
    description: item.description || '',
    type: item.type || 'daily',
    category: item.category || (item.quest_type ? item.quest_type.replace(/_/g, ' ').toUpperCase() : 'DAILY'),
    icon: item.icon || '🎯',
    current,
    target,
    progress: current,
    target_value: target,
    xpReward: item.xpReward !== undefined ? item.xpReward : (item.xp_reward || 20),
    coinReward: item.coinReward !== undefined ? item.coinReward : (item.coin_reward || 5),
    xp_reward: item.xpReward !== undefined ? item.xpReward : (item.xp_reward || 20),
    coin_reward: item.coinReward !== undefined ? item.coinReward : (item.coin_reward || 5),
    completed,
    claimed,
    expiresIn: item.expiresIn || 'Today',
  };
};

const normalizeAchievement = (item) => {
  const isUnlocked = item.unlocked !== undefined ? item.unlocked : !!item.unlocked_at;
  const xpReward = item.xpReward !== undefined ? item.xpReward : (item.xp_reward || 50);
  const coinReward = item.coinReward !== undefined ? item.coinReward : (item.coin_reward || 10);

  let rarity = item.rarity;
  if (!rarity) {
    if (xpReward >= 300) rarity = 'Legendary';
    else if (xpReward >= 150) rarity = 'Epic';
    else if (xpReward >= 100) rarity = 'Rare';
    else rarity = 'Common';
  }

  return {
    id: item.id,
    key: item.key || item.id,
    title: item.title || item.name || 'Achievement',
    name: item.name || item.title || 'Achievement',
    description: item.description || '',
    icon: item.icon || '🏆',
    category: item.category || 'Milestone',
    rarity,
    xpReward,
    xp_reward: xpReward,
    coinReward,
    coin_reward: coinReward,
    unlocked: isUnlocked,
    unlockedAt: item.unlockedAt || (item.unlocked_at ? new Date(item.unlocked_at).toLocaleDateString() : null),
    progress: item.progress !== undefined ? item.progress : (isUnlocked ? 1 : 0),
    target: item.target || 1,
  };
};

export const gamificationApi = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/gamification/stats');
      return response.data;
    } catch (e) {
      return {
        xp: storage.get('user_xp', 1240),
        coins: storage.get('user_coins', 480),
        streak: storage.get('user_streak', 7),
        level: storage.get('user_level', 12),
        rank: storage.get('user_rank', 4),
      };
    }
  },

  getQuests: async () => {
    try {
      const response = await apiClient.get('/gamification/quests');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(normalizeQuest);
      }
      return (storage.get('quests_data', MOCK_QUESTS) || []).map(normalizeQuest);
    } catch (e) {
      return (storage.get('quests_data', MOCK_QUESTS) || []).map(normalizeQuest);
    }
  },

  claimQuestReward: async (questId) => {
    try {
      const response = await apiClient.post(`/gamification/quests/${questId}/claim`);
      return response.data;
    } catch (e) {
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
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(normalizeAchievement);
      }
      return (storage.get('achievements_data', MOCK_ACHIEVEMENTS) || []).map(normalizeAchievement);
    } catch (e) {
      return (storage.get('achievements_data', MOCK_ACHIEVEMENTS) || []).map(normalizeAchievement);
    }
  },

  getLeaderboard: async (scope = 'weekly') => {
    try {
      const response = await apiClient.get(`/gamification/leaderboard?scope=${scope}`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.entries || []);
      const currentUser = storage.get('user_profile');
      const currentUserId = currentUser?.id;

      return list.map((item, idx) => {
        const isUser = Boolean(currentUserId && (item.user_id === currentUserId || item.id === currentUserId));
        const name = (isUser && currentUser?.name) || item.name || item.full_name || 'Scholar';
        const avatar = item.avatar || item.avatar_url || (isUser && currentUser?.avatar) || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || String(idx))}&backgroundColor=FFD400`;

        return {
          ...item,
          rank: item.rank || idx + 1,
          name,
          full_name: name,
          xp: item.xp || 0,
          level: item.level || 1,
          avatar,
          avatar_url: avatar,
          isCurrentUser: isUser,
        };
      });
    } catch (e) {
      const fallback = MOCK_LEADERBOARD[scope] || MOCK_LEADERBOARD.weekly || [];
      const list = Array.isArray(fallback) ? fallback : (fallback.entries || []);
      const currentUser = storage.get('user_profile');
      const currentUserId = currentUser?.id;

      return list.map((item, idx) => {
        const isUser = Boolean(currentUserId && (item.user_id === currentUserId || item.id === currentUserId));
        const name = (isUser && currentUser?.name) || item.name || item.full_name || 'Scholar';
        const avatar = item.avatar || item.avatar_url || (isUser && currentUser?.avatar) || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || String(idx))}&backgroundColor=FFD400`;

        return {
          ...item,
          rank: item.rank || idx + 1,
          name,
          full_name: name,
          xp: item.xp || 0,
          level: item.level || 1,
          avatar,
          avatar_url: avatar,
          isCurrentUser: isUser,
        };
      });
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
