// Banque de questions du quiz. Chaque fait est vérifié dans data/dataset.json
// (FIFA World Cup 26 Regulations + Laws of the Game 2025/26) pour que le quiz
// ne contredise jamais les réponses de Kiki en chat.

export const QUIZ_LENGTH = 5;

export const QUIZ_QUESTIONS = [
  {
    id: 'teams48',
    topic: 'fwc26_competition_format',
    question: "Combien d'équipes participent à la Coupe du Monde 2026 ? 🌍",
    choices: ['24', '32', '48', '64'],
    answerIndex: 2,
    explanation: "La CdM 2026 réunit 48 équipes pour la première fois de l'histoire, réparties en 12 groupes de 4 !",
  },
  {
    id: 'hosts',
    topic: 'fwc26_competition_format',
    question: 'Quels pays organisent la Coupe du Monde 2026 ? 🏟️',
    choices: ['La France et l’Espagne', 'Le Canada, le Mexique et les États-Unis', 'Le Brésil et l’Argentine', 'Le Maroc et le Portugal'],
    answerIndex: 1,
    explanation: 'Trois pays accueillent la CdM 2026 en même temps : le Canada, le Mexique et les États-Unis. Une grande première à trois !',
  },
  {
    id: 'groups12',
    topic: 'fwc26_competition_format',
    question: 'Comment les 48 équipes sont-elles réparties au premier tour ?',
    choices: ['8 groupes de 6', '16 groupes de 3', '6 groupes de 8', '12 groupes de 4'],
    answerIndex: 3,
    explanation: '12 groupes de 4 équipes ! Les 2 premiers de chaque groupe et les 8 meilleurs troisièmes filent en seizièmes de finale.',
  },
  {
    id: 'points_win',
    topic: 'fwc26_competition_format',
    question: 'Combien de points rapporte une victoire en phase de groupes ? 🥅',
    choices: ['1 point', '2 points', '3 points', '5 points'],
    answerIndex: 2,
    explanation: 'Une victoire vaut 3 points, un match nul 1 point, et une défaite 0 point.',
  },
  {
    id: 'duration',
    topic: 'law7_duration',
    question: 'Combien de temps dure un match de foot (temps réglementaire) ? ⏱️',
    choices: ['2 mi-temps de 30 minutes', '2 mi-temps de 45 minutes', '4 quarts-temps de 20 minutes', '1 heure sans pause'],
    answerIndex: 1,
    explanation: "Un match, c'est deux mi-temps de 45 minutes, avec une pause de 15 minutes maximum entre les deux.",
  },
  {
    id: 'extra_time',
    topic: 'fwc26_competition_format',
    question: 'En phase à élimination directe, que se passe-t-il si le score est nul à la fin du match ?',
    choices: ['Le match est rejoué un autre jour', 'On tire à pile ou face', 'Prolongation de 2 × 15 minutes', 'Les deux équipes sont éliminées'],
    answerIndex: 2,
    explanation: "On joue une prolongation de deux périodes de 15 minutes. Et si c'est toujours égalité… séance de tirs au but ! ⚡",
  },
  {
    id: 'offside_corner',
    topic: 'law11_offside',
    question: 'Sur quelle action ne peut-on PAS être hors-jeu ? 🚩',
    choices: ['Un corner', 'Une passe en profondeur', 'Un coup franc', 'Un centre'],
    answerIndex: 0,
    explanation: "Pas de hors-jeu quand on reçoit le ballon directement d'un corner, d'une touche ou d'un coup de pied de but !",
  },
  {
    id: 'two_yellows',
    topic: 'law12_fouls_cards',
    question: 'Que se passe-t-il si un joueur reçoit 2 cartons jaunes dans le même match ? 🟨🟨',
    choices: ['Rien de spécial', 'Il est expulsé (carton rouge)', 'Il paie une amende', 'Il doit changer de poste'],
    answerIndex: 1,
    explanation: 'Deux jaunes dans le même match = carton rouge ! Le joueur est expulsé et suspendu pour le match suivant.',
  },
  {
    id: 'min_players',
    topic: 'law3_substitutions',
    question: 'Avec combien de joueurs minimum une équipe peut-elle jouer un match ?',
    choices: ['5', '9', '11', '7'],
    answerIndex: 3,
    explanation: "Une équipe joue à 11, dont le gardien. Mais en dessous de 7 joueurs, le match ne peut pas commencer ni continuer.",
  },
  {
    id: 'gk_8s',
    topic: 'law12_fouls_cards',
    question: 'Combien de temps le gardien peut-il garder le ballon dans ses mains ? 🧤',
    choices: ['8 secondes', '20 secondes', '1 minute', "Autant qu'il veut"],
    answerIndex: 0,
    explanation: "8 secondes maximum, sinon corner pour l'adversaire ! L'arbitre compte même les 5 dernières secondes avec la main.",
  },
  {
    id: 'penalty_gk',
    topic: 'law14_penalty',
    question: "Sur un penalty, où doit rester le gardien jusqu'au tir ? 🥅",
    choices: ['Au point de penalty', "N'importe où dans la surface", 'Sur sa ligne de but, face au tireur', 'À côté du poteau'],
    answerIndex: 2,
    explanation: 'Le gardien doit rester sur sa ligne de but, face au tireur, jusqu’au tir. Au moment du tir, il lui faut au moins une partie d’un pied sur la ligne, au niveau de la ligne ou derrière elle.',
  },
  {
    id: 'subs5',
    topic: 'law3_substitutions',
    question: 'Combien de remplacements une équipe peut-elle faire pendant un match officiel (hors prolongation) ?',
    choices: ['3', '5', '7', 'Autant qu’elle veut'],
    answerIndex: 1,
    explanation: '5 remplacements maximum, en 3 occasions pendant le match. En prolongation, on peut en faire un de plus !',
  },
];

export function pickQuizRound() {
  const pool = [...QUIZ_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUIZ_LENGTH);
}
