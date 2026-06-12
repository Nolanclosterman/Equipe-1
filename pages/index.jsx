import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import StatsBar from '../components/StatsBar';
import BadgesModal from '../components/BadgesModal';
import Toast from '../components/Toast';
import {
  XP,
  defaultStats,
  loadStats,
  saveStats,
  getLevel,
  touchStreak,
  newlyUnlocked,
} from '../lib/gamification';
import { QUIZ_LENGTH, pickQuizRound } from '../lib/quizBank';

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
  const [stats, setStats] = useState(defaultStats());
  const [toast, setToast] = useState(null);
  const [showBadges, setShowBadges] = useState(false);
  const [quiz, setQuiz] = useState(null); // { roundId, questions, index, correct }
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const statsRef = useRef(stats);
  const quizRoundRef = useRef(0);
  // Round encore vivant : les timers du quiz vérifient ce ref avant d'agir,
  // pour qu'un round arrêté ne pousse plus de question ni de résumé.
  const activeRoundIdRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Chargement des stats au montage (localStorage, côté client uniquement)
  useEffect(() => {
    let s = touchStreak(loadStats());
    const unlocked = newlyUnlocked(s, s.badges);
    if (unlocked.length) {
      s = { ...s, badges: [...s.badges, ...unlocked.map((b) => b.id)] };
    }
    statsRef.current = s;
    setStats(s);
    saveStats(s);
    if (unlocked.length) {
      setToast({ emoji: unlocked[0].emoji, title: `Badge débloqué : ${unlocked[0].name} !`, sub: unlocked[0].desc });
    }
  }, []);

  // Mutation centrale : applique le changement, détecte badges et passage de niveau
  const applyStats = (mutate) => {
    const prev = statsRef.current;
    let next = mutate({ ...prev });
    const unlocked = newlyUnlocked(next, prev.badges);
    if (unlocked.length) {
      next = { ...next, badges: [...next.badges, ...unlocked.map((b) => b.id)] };
    }
    const levelBefore = getLevel(prev.xp);
    const levelAfter = getLevel(next.xp);
    statsRef.current = next;
    setStats(next);
    saveStats(next);
    if (unlocked.length) {
      setToast({ emoji: unlocked[0].emoji, title: `Badge débloqué : ${unlocked[0].name} !`, sub: unlocked[0].desc });
    } else if (levelAfter.index > levelBefore.index) {
      setToast({ emoji: levelAfter.emoji, title: `Niveau supérieur : ${levelAfter.name} !`, sub: 'Continue comme ça, champion !' });
    }
  };

  const sendMessage = async (text, suggestionLabel) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    if (msg.length > 500) {
      setMessages(prev => [...prev, { role: 'bot', text: "Ta question est trop longue ! Essaie en moins de 500 caractères ⚽" }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    applyStats((s) => {
      const next = { ...s, xp: s.xp + XP.CHAT_MESSAGE, totalMessages: s.totalMessages + 1 };
      if (suggestionLabel && !s.suggestionsUsed.includes(suggestionLabel)) {
        next.suggestionsUsed = [...s.suggestionsUsed, suggestionLabel];
      }
      return next;
    });

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

  const pushQuizQuestion = (round, qIdx) => {
    const q = round.questions[qIdx];
    setMessages(prev => [...prev, {
      role: 'bot',
      text: `Question ${qIdx + 1}/${round.questions.length} : ${q.question}`,
      quizQ: {
        roundId: round.roundId,
        qIdx,
        choices: q.choices,
        answerIndex: q.answerIndex,
        answered: false,
        pickedIndex: null,
      },
    }]);
  };

  const startQuiz = () => {
    if (quiz) return;
    quizRoundRef.current += 1;
    const round = { roundId: quizRoundRef.current, questions: pickQuizRound(), index: 0, correct: 0 };
    activeRoundIdRef.current = round.roundId;
    setQuiz(round);
    setMessages(prev => [...prev, {
      role: 'bot',
      text: `C'est parti pour le quiz ! ⚽ ${QUIZ_LENGTH} questions, ${XP.QUIZ_CORRECT} XP par bonne réponse. Clique sur ta réponse !`,
    }]);
    setTimeout(() => {
      if (activeRoundIdRef.current !== round.roundId) return;
      pushQuizQuestion(round, 0);
    }, 600);
  };

  const stopQuiz = () => {
    if (!quiz) return;
    activeRoundIdRef.current = 0;
    setQuiz(null);
    setMessages(prev => [...prev, {
      role: 'bot',
      text: "Pas de souci, on arrête le quiz là ! Tes XP sont gardés, on reprendra quand tu veux ⚽",
    }]);
  };

  const endQuiz = (round, correctCount) => {
    activeRoundIdRef.current = 0;
    const total = round.questions.length;
    const perfect = correctCount === total;
    applyStats((s) => ({
      ...s,
      quizzesCompleted: s.quizzesCompleted + 1,
      perfectRounds: s.perfectRounds + (perfect ? 1 : 0),
      xp: s.xp + (perfect ? XP.QUIZ_PERFECT_BONUS : 0),
    }));
    setMessages(prev => [...prev, {
      role: 'bot',
      text: perfect
        ? `Quiz terminé : ${correctCount}/${total} ! 🎉 Un sans-faute, bravo champion ! +${XP.QUIZ_PERFECT_BONUS} XP bonus 🏆`
        : `Quiz terminé : tu as eu ${correctCount}/${total} bonnes réponses ! 🏆 Rejoue quand tu veux pour battre ton score !`,
    }]);
    setQuiz(null);
  };

  const answerQuiz = (msgIndex, choiceIdx) => {
    const round = quiz;
    if (!round) return;
    const msg = messages[msgIndex];
    if (!msg?.quizQ || msg.quizQ.answered || msg.quizQ.roundId !== round.roundId) return;

    const q = round.questions[msg.quizQ.qIdx];
    const correct = choiceIdx === q.answerIndex;

    const feedback = correct
      ? { role: 'bot', tone: 'correct', text: `Bravo, c'est la bonne réponse ! ✅ +${XP.QUIZ_CORRECT} XP\n\n${q.explanation}` }
      : { role: 'bot', tone: 'incorrect', text: `Pas tout à fait ! La bonne réponse était « ${q.choices[q.answerIndex]} ».\n\n${q.explanation}\n\nTu vas y arriver 💪 +${XP.QUIZ_TRY} XP` };

    setMessages(prev => [
      ...prev.map((m, i) => (i === msgIndex ? { ...m, quizQ: { ...m.quizQ, answered: true, pickedIndex: choiceIdx } } : m)),
      { role: 'user', text: q.choices[choiceIdx] },
      feedback,
    ]);

    applyStats((s) => ({
      ...s,
      xp: s.xp + (correct ? XP.QUIZ_CORRECT : XP.QUIZ_TRY),
      correctAnswers: s.correctAnswers + (correct ? 1 : 0),
    }));

    const nextIndex = round.index + 1;
    const newCorrect = round.correct + (correct ? 1 : 0);
    setQuiz({ ...round, index: nextIndex, correct: newCorrect });

    setTimeout(() => {
      if (activeRoundIdRef.current !== round.roundId) return;
      if (nextIndex < round.questions.length) {
        pushQuizQuestion(round, nextIndex);
      } else {
        endQuiz(round, newCorrect);
      }
    }, 900);
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

        <StatsBar stats={stats} onBadgesClick={() => setShowBadges(true)} />

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-avatar">{m.role === 'bot' ? '⚽' : 'Toi'}</div>
              <div className={`bubble${m.tone ? ` ${m.tone}` : ''}`}>
                {m.text.split('\n').map((line, j) => (
                  <span key={j}>{j > 0 && <br />}{line}</span>
                ))}
                {m.quizQ && (
                  <div className="quiz-choices">
                    {m.quizQ.choices.map((choice, ci) => {
                      const { answered, pickedIndex, answerIndex, roundId } = m.quizQ;
                      const cls = ['choice-btn'];
                      if (answered && pickedIndex === ci && ci === answerIndex) cls.push('picked-correct');
                      if (answered && pickedIndex === ci && ci !== answerIndex) cls.push('picked-wrong');
                      if (answered && pickedIndex !== ci && ci === answerIndex) cls.push('reveal-correct');
                      const active = quiz && !answered && roundId === quiz.roundId;
                      return (
                        <button
                          key={ci}
                          className={cls.join(' ')}
                          disabled={!active}
                          onClick={() => answerQuiz(i, ci)}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                )}
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
          {quiz ? (
            <button className="sug-btn quiz" onClick={stopQuiz}>
              Arrêter le quiz ✋
            </button>
          ) : (
            <button className="sug-btn quiz" onClick={startQuiz}>
              🎯 Mode Quiz !
            </button>
          )}
          {SUGGESTIONS.map((s) => (
            <button key={s.label} className="sug-btn" onClick={() => sendMessage(s.q, s.label)}>
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

        {toast && (
          <Toast
            key={`${toast.title}`}
            emoji={toast.emoji}
            title={toast.title}
            sub={toast.sub}
            onDone={() => setToast(null)}
          />
        )}
        {showBadges && <BadgesModal stats={stats} onClose={() => setShowBadges(false)} />}
      </div>
    </>
  );
}
