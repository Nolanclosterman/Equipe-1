import { useEffect } from 'react';

export default function Toast({ emoji, title, sub, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="toast" onClick={onDone} role="status">
      <span className="toast-emoji">{emoji}</span>
      <div>
        <div className="toast-title">{title}</div>
        {sub && <div className="toast-sub">{sub}</div>}
      </div>
    </div>
  );
}
