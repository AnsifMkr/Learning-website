/**
 * Calculates progressive level data based on a user's total XP.
 * Formula: Each level N requires an increasing amount of XP.
 * Level 1: 0 - 99
 * Level 2: 100 - 249 (+150)
 * Level 3: 250 - 449 (+200)
 * Level 4: 450 - 699 (+250)
 * Level 5: 700 - 999 (+300)
 */

export interface LevelData {
  currentLevel: number;
  xpInCurrentLevel: number; // XP earned towards the next level
  totalXpNeededForNextLevel: number; // How large the XP gap is for this level
  progressPercentage: number; // 0 to 100
}

export function getLevelData(totalXp: number): LevelData {
  let level = 1;
  let threshold = 0;
  let nextThreshold = 100;
  
  let step = 100;

  while (totalXp >= nextThreshold) {
    level++;
    threshold = nextThreshold;
    step += 50; // Each level requires 50 more XP than the last
    nextThreshold += step;
  }

  const xpInCurrentLevel = totalXp - threshold;
  const totalXpNeededForNextLevel = step;
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / totalXpNeededForNextLevel) * 100));

  return {
    currentLevel: level,
    xpInCurrentLevel,
    totalXpNeededForNextLevel,
    progressPercentage
  };
}
