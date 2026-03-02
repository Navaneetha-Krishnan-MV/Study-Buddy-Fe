import { useEffect, useState } from 'react';
import { getHomeSummary, getSubjectUnits } from '../../api';
import { BookOpen, Layers } from '../icons/Icons';
import UnitCard from './UnitCard';

export default function HomeTab({ selectedSubject, selectedSemester, onGoToMaterials }) {
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedSubjectId = selectedSubject?.id || null;

  useEffect(() => {
    let isCancelled = false;

    async function loadHomeData() {
      if (!selectedSubjectId) {
        setUnits([]);
        setSummary(null);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [unitsData, summaryData] = await Promise.all([
          getSubjectUnits(selectedSubjectId),
          getHomeSummary(selectedSubjectId),
        ]);

        if (isCancelled) {
          return;
        }

        setUnits(Array.isArray(unitsData) ? unitsData : []);
        setSummary(summaryData || null);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        setUnits([]);
        setSummary(null);
        setError(loadError.message || 'Failed to load subject overview.');
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isCancelled = true;
    };
  }, [selectedSubjectId]);

  if (!selectedSubject) {
    return (
      <section className="animate-[fade-in_220ms_ease-out] py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-300/30 bg-slate-100 text-slate-700">
          <BookOpen size={30} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">Welcome to Hushh Study</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
          Select your semester and subject from the top bar to unlock units, discussions, quiz practice, and leaderboard tracking.
        </p>
      </section>
    );
  }

  const completedCount = summary?.completedCount ?? 0;
  const inProgressCount = summary?.inProgressCount ?? 0;
  const notStartedCount = summary?.notStartedCount ?? 0;
  const totalMaterials = summary?.totalMaterials ?? 0;
  const averageProgress = summary?.averageProgress ?? 0;

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-6">
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-400/40 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Semester {selectedSemester}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {selectedSubject.code}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{selectedSubject.name}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {units.length} units, {totalMaterials} total materials
            </p>
          </div>

          <div className="rounded-xl border border-slate-400/35 bg-slate-100 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-700">Average progress</p>
            <p className="text-2xl font-bold text-slate-900">{averageProgress}%</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Completed" value={completedCount} tone="emerald" />
          <StatCard label="In progress" value={inProgressCount} tone="violet" />
          <StatCard label="Not started" value={notStartedCount} tone="slate" />
          <StatCard label="Materials" value={totalMaterials} tone="blue" />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Course units</h2>
          <button type="button" onClick={onGoToMaterials} className="btn-secondary text-xs">
            <Layers size={14} />
            Open materials
          </button>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl py-12 text-center text-sm text-slate-400">Loading units...</div>
        ) : error ? (
          <div className="glass-card rounded-2xl border border-red-200 bg-red-50 py-12 text-center text-sm text-red-700">
            {error}
          </div>
        ) : units.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-12 text-center text-sm text-slate-400">No units found for this subject.</div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }) {
  const toneMap = {
    emerald: 'border-slate-300/35 bg-slate-100 text-slate-700',
    violet: 'border-slate-300/35 bg-slate-100 text-slate-700',
    slate: 'border-slate-300/20 bg-slate-100 text-slate-700',
    blue: 'border-slate-300/35 bg-slate-100 text-slate-700',
  };

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
