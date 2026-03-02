import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createThread as createThreadApi,
  getSubjectUnits,
  getThreads,
} from '../../api';
import { Filter, MessageSquare, Plus, Search } from '../icons/Icons';
import NewQueryModal from './NewQueryModal';
import ThreadCard from './ThreadCard';
import ThreadDetail from './ThreadDetail';

const ALL_UNITS_VALUE = 'all';

function normalizeThread(thread) {
  return {
    ...thread,
    tags: Array.isArray(thread?.tags) ? thread.tags : [],
    author: thread?.author || { name: 'Unknown', avatar: 'NA' },
    upvotes: Number(thread?.upvotes || 0),
    downvotes: Number(thread?.downvotes || 0),
    commentCount: Number(thread?.commentCount || 0),
    myVote: Number(thread?.myVote || 0),
  };
}

export default function DiscussionTab({ selectedSubject }) {
  const [threads, setThreads] = useState([]);
  const [units, setUnits] = useState([]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState(ALL_UNITS_VALUE);

  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [error, setError] = useState('');

  const [showNewModal, setShowNewModal] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    setSelectedThreadId(null);
    setQuery('');
    setDebouncedQuery('');
    setUnitFilter(ALL_UNITS_VALUE);
  }, [selectedSubject?.id]);

  useEffect(() => {
    let isCancelled = false;

    async function loadUnits() {
      if (!selectedSubject) {
        setUnits([]);
        return;
      }

      setLoadingUnits(true);

      try {
        const data = await getSubjectUnits(selectedSubject.id);

        if (isCancelled) {
          return;
        }

        setUnits(Array.isArray(data) ? data : []);
      } catch {
        if (isCancelled) {
          return;
        }
        setUnits([]);
      } finally {
        if (!isCancelled) {
          setLoadingUnits(false);
        }
      }
    }

    loadUnits();

    return () => {
      isCancelled = true;
    };
  }, [selectedSubject]);

  const loadThreads = useCallback(async () => {
    if (!selectedSubject) {
      setThreads([]);
      setError('');
      return;
    }

    setLoadingThreads(true);
    setError('');

    try {
      const data = await getThreads(selectedSubject.id, {
        q: debouncedQuery || undefined,
        unitId: unitFilter !== ALL_UNITS_VALUE ? unitFilter : undefined,
      });

      setThreads((Array.isArray(data) ? data : []).map(normalizeThread));
    } catch (loadError) {
      setThreads([]);
      setError(loadError.message || 'Failed to load discussions.');
    } finally {
      setLoadingThreads(false);
    }
  }, [selectedSubject, debouncedQuery, unitFilter]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const handleCreateThread = async ({ title, description, tags, unitId }) => {
    if (!selectedSubject) {
      return;
    }

    setCreatingThread(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        tags,
      };

      if (unitId && unitId !== ALL_UNITS_VALUE) {
        payload.unitId = unitId;
      }

      const created = await createThreadApi(selectedSubject.id, payload);

      setShowNewModal(false);
      await loadThreads();

      if (created?.id) {
        setSelectedThreadId(created.id);
      }
    } catch (createError) {
      setError(createError.message || 'Failed to create thread.');
    } finally {
      setCreatingThread(false);
    }
  };

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || null,
    [threads, selectedThreadId],
  );

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <MessageSquare size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to open the discussion forum.</p>
      </section>
    );
  }

  if (selectedThreadId) {
    return (
      <ThreadDetail
        threadId={selectedThreadId}
        fallbackThread={selectedThread}
        onBack={() => setSelectedThreadId(null)}
        onUpdated={loadThreads}
      />
    );
  }

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discussion Forum</h1>
            <p className="mt-1 text-sm text-slate-400">
              {selectedSubject.name} - ask doubts, share resources, and help peers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="btn-primary text-sm"
            disabled={loadingUnits}
          >
            <Plus size={14} />
            New query
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center">
          <div className="relative">
            {!query ? (
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            ) : null}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="     Search threads by title, tag, or author"
              className="input-field pl-9"
            />
          </div>

          <div className="relative">
            <Filter
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={unitFilter}
              onChange={(event) => setUnitFilter(event.target.value)}
              className="input-field w-full pl-9 text-sm"
            >
              <option value={ALL_UNITS_VALUE}>All units</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.number} - {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {threads.length} threads
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {loadingThreads ? (
          <div className="glass-card rounded-2xl py-14 text-center text-slate-400">Loading discussions...</div>
        ) : threads.length ? (
          threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onOpen={() => setSelectedThreadId(thread.id)}
            />
          ))
        ) : (
          <div className="glass-card rounded-2xl py-14 text-center text-slate-400">
            No discussions matched your search.
          </div>
        )}
      </div>

      {showNewModal ? (
        <NewQueryModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateThread}
          units={units}
          creating={creatingThread}
        />
      ) : null}
    </section>
  );
}
