/**
 * backend/utils/gamification.js
 * Centralized utility for evaluating and awarding gamification badges.
 */

const BADGES = {
  EARLY_BIRD: 'Early Bird',
  FIRST_FIVE: 'First Five Lessons',
  QUIZ_ROOKIE: 'Quiz Rookie',
  QUIZ_MASTER: 'Quiz Master',
  XP_50: '50 XP Achiever',
  XP_100: '100 XP Vanguard',
  STREAK_3: 'Streak Starter',
  STREAK_7: 'Consistency Scholar'
};

/**
 * Checks a user document's properties and awards any missing badges.
 * @param {Object} user - The mongoose user document
 * @returns {Array} newBadges - A list of badges granted in this check
 */
const checkAndAwardBadges = (user) => {
  const newBadges = [];
  const currentBadges = new Set(user.badges || []);

  const award = (badgeName) => {
    if (!currentBadges.has(badgeName)) {
      user.badges.push(badgeName);
      currentBadges.add(badgeName);
      newBadges.push(badgeName);
    }
  };

  // 1. Lesson Milestones
  if (user.completedLessons && user.completedLessons.length >= 1) {
    award(BADGES.EARLY_BIRD);
  }
  if (user.completedLessons && user.completedLessons.length >= 5) {
    award(BADGES.FIRST_FIVE);
  }

  // 2. Quiz Milestones
  if (user.completedQuizzes && user.completedQuizzes.length >= 1) {
    award(BADGES.QUIZ_ROOKIE);
  }
  if (user.completedQuizzes && user.completedQuizzes.length >= 5) {
    award(BADGES.QUIZ_MASTER);
  }

  // 3. XP Milestones
  if (user.xp >= 50) {
    award(BADGES.XP_50);
  }
  if (user.xp >= 100) {
    award(BADGES.XP_100);
  }

  // 4. Streak Milestones
  if (user.currentYearStreak >= 3) {
    award(BADGES.STREAK_3);
  }
  if (user.currentYearStreak >= 7) {
    award(BADGES.STREAK_7);
  }

  return newBadges;
};

module.exports = {
  BADGES,
  checkAndAwardBadges
};
