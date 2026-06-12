import { BADGES } from '../lib/gamification';

export default function BadgesModal({ stats, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="badges-modal" onClick={(e) => e.stopPropagation()}>
        <div className="badges-modal-header">
          <h2>Tes badges 🏅</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div className="badges-grid">
          {BADGES.map((b) => {
            const owned = stats.badges.includes(b.id);
            return (
              <div key={b.id} className={`badge-card${owned ? '' : ' locked'}`}>
                <span className="badge-emoji">{b.emoji}</span>
                <span className="badge-name">{b.name}</span>
                <span className="badge-desc">{b.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
