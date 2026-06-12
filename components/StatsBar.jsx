import { getLevel, BADGES } from '../lib/gamification';

export default function StatsBar({ stats, onBadgesClick }) {
  const level = getLevel(stats.xp);

  return (
    <div className="stats-bar">
      <span className="stat-chip level-chip">{level.emoji} {level.name}</span>
      <div
        className="xp-bar"
        title={level.nextMin ? `Prochain niveau à ${level.nextMin} XP` : 'Niveau maximum !'}
      >
        <div className="xp-bar-fill" style={{ width: `${level.progressPct}%` }} />
      </div>
      <span className="xp-label">{stats.xp} XP</span>
      {stats.streak.count >= 1 && (
        <span className="stat-chip streak-chip" title={`${stats.streak.count} jour(s) de suite`}>
          🔥 {stats.streak.count}
        </span>
      )}
      <button className="badges-btn" onClick={onBadgesClick} aria-label="Voir tes badges">
        🏅 {stats.badges.length}/{BADGES.length}
      </button>
    </div>
  );
}
