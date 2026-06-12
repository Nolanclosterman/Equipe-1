import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const SUGGESTIONS = [
  { label: "Combien d'équipes ? 🌍", q: "Combien d'équipes participent à la CdM 2026 ?" },
  { label: "Le hors-jeu 🚩",          q: "C'est quoi le hors-jeu ?" },
  { label: "Tirs au but ⚡",           q: "Comment se passe une séance de tirs au but ?" },
  { label: "Carton rouge 🟥",          q: "Qu'est-ce qu'un carton rouge ?" },
  { label: "Les trophées 🏅",          q: "Quels sont les prix remis à la fin de la CdM 2026 ?" },
];

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Salut ! Je suis Kiki, ton assistant pour la Coupe du Monde 2026 ! 🏆\n\nTu peux me poser des questions sur les règles du football, le format du tournoi, les équipes, les arbitres... Je suis là pour tout expliquer simplement !\n\nQu'est-ce que tu veux savoir ? 😊",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    if (msg.length > 500) {
      setMessages(prev => [...prev, { role: 'bot', text: "Ta question est trop longue ! Essaie en moins de 500 caractères ⚽" }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    const historyToSend = history.slice(-20);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: historyToSend }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply || "Désolé, je n'ai pas pu répondre. Réessaie !";

      setHistory(prev => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: reply }]);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Oops, une erreur s'est produite. Vérifie ta connexion et réessaie ⚽" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Head>
        <title>Kiki — Assistant Coupe du Monde 2026</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div id="app">
        <div className="chat-header">
          <div className="header-avatar">⚽</div>
          <div className="header-info">
            <h1>Kiki — Assistant Coupe du Monde 2026</h1>
            <p>Je réponds à tes questions sur la CdM 2026 et les règles du foot !</p>
          </div>
          <div className="header-status">
            <div className="status-dot" />
            En ligne
          </div>
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-avatar">{m.role === 'bot' ? '⚽' : 'Toi'}</div>
              <div className="bubble">
                {m.text.split('\n').map((line, j) => (
                  <span key={j}>{j > 0 && <br />}{line}</span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg bot typing">
              <div className="msg-avatar">⚽</div>
              <div className="bubble">
                <div className="dot-anim">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s.label} className="sug-btn" onClick={() => sendMessage(s.q)}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="input-area">
          <textarea
            ref={inputRef}
            className="user-input"
            placeholder="Pose ta question sur le foot ou la CdM 2026..."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="send-btn" onClick={() => sendMessage()} aria-label="Envoyer">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
