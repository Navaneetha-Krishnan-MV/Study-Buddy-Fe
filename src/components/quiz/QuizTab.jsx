import { useState } from 'react';
import { Search, Zap } from '../icons/Icons';
import { QUIZZES_BY_SUBJECT } from '../../data/mockData';
import QuizCard from './QuizCard';
import QuizModal from './QuizModal';

const DIFFICULTY_FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

function formatAttemptDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function QuizTab({ selectedSubject }) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [attempts, setAttempts] = useState({});

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <Zap size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to start quiz practice.</p>
      </section>
    );
  }

  const quizzes = QUIZZES_BY_SUBJECT[selectedSubject.id] || [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredQuizzes = quizzes.filter((quiz) => {
    const difficultyMatches = difficulty === 'All' || quiz.difficulty === difficulty;
    const searchMatches =
      !normalizedSearch ||
      quiz.name.toLowerCase().includes(normalizedSearch) ||
      quiz.unitName.toLowerCase().includes(normalizedSearch);

    return difficultyMatches && searchMatches;
  });

  const attemptList = Object.values(attempts);
  const average = attemptList.length
    ? Math.round(attemptList.reduce((total, item) => total + item.scorePercent, 0) / attemptList.length)
    : 0;

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quiz Practice</h1>
            <p className="mt-1 text-sm text-slate-400">{selectedSubject.name} - timed quizzes for focused revision.</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SummaryCell label="Quizzes" value={quizzes.length} />
            <SummaryCell label="Attempted" value={attemptList.length} />
            <SummaryCell label="Avg score" value={`${average}%`} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            {search == ''&&
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            }<input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="    Search quiz by name or unit"
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {DIFFICULTY_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDifficulty(item)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  difficulty === item
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {filteredQuizzes.length ? (
          filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStart={setActiveQuiz}
              lastAttempt={attempts[quiz.id]}
            />
          ))
        ) : (
          <div className="glass-card rounded-2xl py-14 text-center text-slate-400">No quizzes matched your filter.</div>
        )}
      </div>

      {activeQuiz ? (
        <QuizModal
          key={activeQuiz.id}
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={(result) => {
            setAttempts((current) => ({
              ...current,
              [result.quizId]: {
                ...result,
                completedAt: formatAttemptDate(),
              },
            }));
          }}
        />
      ) : null}
    </section>
  );
}

function SummaryCell({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
