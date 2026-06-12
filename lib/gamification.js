// Logique de gamification : XP, niveaux, badges, série quotidienne.
// Tout est stocké en local (localStorage) — aucune donnée personnelle.

export const STORAGE_KEY = 'kiki.gamification.v1';

export const XP = {
  CHAT_MESSAGE: 5,
  QUIZ_CORRECT: 20,
  QUIZ_TRY: 5,
  QUIZ_PERFECT_BONUS: 15,
};

export const LEVELS = [
  { name: 'Débutant', emoji: '🐣', minXp: 0 },
  { name: 'Espoir', emoji: '🌱', minXp: 50 },
  { name: 'Titulaire', emoji: '🎽', minXp: 150 },
  { name: 'Capitaine', emoji: '⭐', minXp: 300 },
  { name: "Buteur d'or", emoji: '👟', minXp: 550 },
  { name: 'Légende', emoji: '🏆', minXp: 900 },
];

export const BADGES = [
  { id: 'first_msg', emoji: '🎉', name: 'Premier pas', desc: 'Envoyer ton premier message', test: (s) => s.totalMessages >= 1 },
  { id: 'curious_10', emoji: '💬', name: 'Grand curieux', desc: 'Poser 10 questions à Kiki', test: (s) => s.totalMessages >= 10 },
  { id: 'first_quiz', emoji: '🧠', name: 'Quiz rookie', desc: 'Terminer ton premier quiz', test: (s) => s.quizzesCompleted >= 1 },
  { id: 'correct_5', emoji: '✅', name: 'Fin stratège', desc: '5 bonnes réponses au quiz', test: (s) => s.correctAnswers >= 5 },
  { id: 'perfect_round', emoji: '🥇', name: 'Coup du chapeau', desc: 'Un quiz parfait (5/5)', test: (s) => s.perfectRounds >= 1 },
  { id: 'streak_3', emoji: '🔥', name: 'Supporter fidèle', desc: 'Venir 3 jours de suite', test: (s) => s.streak.count >= 3 },
  { id: 'explorer', emoji: '🗺️', name: 'Explorateur', desc: 'Essayer les 5 suggestions', test: (s) => s.suggestionsUsed.length >= 5 },
  { id: 'captain', emoji: '🧢', name: 'Brassard de capitaine', desc: 'Atteindre le niveau Capitaine', test: (s) => s.xp >= 300 },
];

export function defaultStats() {
  return {
    v: 1,
    xp: 0,
    totalMessages: 0,
    quizzesCompleted: 0,
    correctAnswers: 0,
    perfectRounds: 0,
    suggestionsUsed: [],
    badges: [],
    streak: { count: 0, lastDate: null },
  };
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1) return defaultStats();
    // Chaque champ est validé un par un : une valeur corrompue (ex. xp: "abc")
    // casserait définitivement les calculs d'XP et serait re-sauvegardée telle quelle.
    const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);
    const strArr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
    return {
      v: 1,
      xp: num(parsed.xp),
      totalMessages: num(parsed.totalMessages),
      quizzesCompleted: num(parsed.quizzesCompleted),
      correctAnswers: num(parsed.correctAnswers),
      perfectRounds: num(parsed.perfectRounds),
      suggestionsUsed: strArr(parsed.suggestionsUsed),
      badges: strArr(parsed.badges),
      streak: {
        count: num(parsed.streak && parsed.streak.count),
        lastDate: parsed.streak && typeof parsed.streak.lastDate === 'string' ? parsed.streak.lastDate : null,
      },
    };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // stockage indisponible (mode privé, quota plein) : on continue en mémoire
  }
}

export function getLevel(xp) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  const level = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progressPct = next
    ? Math.min(100, Math.round(((xp - level.minXp) / (next.minXp - level.minXp)) * 100))
    : 100;
  return { index, name: level.name, emoji: level.emoji, nextMin: next ? next.minXp : null, progressPct };
}

// Date locale (pas toISOString : en UTC la journée bascule à la mauvaise heure)
export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function touchStreak(stats) {
  const today = todayStr();
  if (stats.streak.lastDate === today) return stats;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const count = stats.streak.lastDate === todayStr(yesterday) ? stats.streak.count + 1 : 1;
  return { ...stats, streak: { count, lastDate: today } };
}

export function newlyUnlocked(stats, ownedIds) {
  return BADGES.filter((b) => !ownedIds.includes(b.id) && b.test(stats));
}
