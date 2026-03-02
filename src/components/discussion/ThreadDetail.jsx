import { useCallback, useEffect, useMemo, useState } from 'react';
import { addComment, getThread, voteThread } from '../../api';
import { ChevronLeft, Send, ThumbsDown, ThumbsUp } from '../icons/Icons';

function normalizeComment(comment) {
  return {
    ...comment,
    author: comment?.author || { name: 'Unknown', avatar: 'NA' },
    upvotes: Number(comment?.upvotes || 0),
  };
}

function normalizeThread(thread) {
  if (!thread) {
    return null;
  }

  return {
    ...thread,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    author: thread.author || { name: 'Unknown', avatar: 'NA' },
    upvotes: Number(thread.upvotes || 0),
    downvotes: Number(thread.downvotes || 0),
    commentCount: Number(thread.commentCount || 0),
    myVote: Number(thread.myVote || 0),
    comments: Array.isArray(thread.comments)
      ? thread.comments.map(normalizeComment)
      : [],
  };
}

function CommentRow({ comment }) {
  return (
    <article className="flex gap-3 border-t border-slate-200 py-3 first:border-t-0 first:pt-0">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-900">
        {comment.author.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{comment.author.name}</p>
          <p className="text-xs text-slate-500">{comment.timeAgo}</p>
        </div>
        <p className="mt-1 text-sm text-slate-600">{comment.text}</p>
      </div>
    </article>
  );
}

export default function ThreadDetail({ threadId, fallbackThread, onBack, onUpdated }) {
  const [thread, setThread] = useState(() => normalizeThread(fallbackThread));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [voteLoading, setVoteLoading] = useState('');
  const [reply, setReply] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadThread = useCallback(
    async ({ silent = false } = {}) => {
      if (!threadId) {
        setThread(null);
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      setError('');

      try {
        const data = await getThread(threadId);
        setThread(normalizeThread(data));
      } catch (loadError) {
        setError(loadError.message || 'Failed to load thread details.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [threadId],
  );

  useEffect(() => {
    setThread(normalizeThread(fallbackThread));
    setReply('');
    setActionError('');
    loadThread();
  }, [fallbackThread, loadThread]);

  const commentCount = useMemo(() => {
    if (!thread) {
      return 0;
    }

    if (thread.comments.length) {
      return thread.comments.length;
    }

    return thread.commentCount;
  }, [thread]);

  const handleVote = async (targetVote) => {
    if (!threadId || !thread) {
      return;
    }

    const nextVote = thread.myVote === targetVote ? 0 : targetVote;
    const loadingKey = targetVote === 1 ? 'up' : 'down';

    setVoteLoading(loadingKey);
    setActionError('');

    try {
      const result = await voteThread(threadId, nextVote);
      setThread((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          upvotes: Number(result?.upvotes ?? current.upvotes),
          downvotes: Number(result?.downvotes ?? current.downvotes),
          myVote: Number(result?.myVote ?? nextVote),
        };
      });

      if (onUpdated) {
        onUpdated();
      }
    } catch (voteError) {
      setActionError(voteError.message || 'Failed to update vote.');
    } finally {
      setVoteLoading('');
    }
  };

  const submitReply = async () => {
    const text = reply.trim();

    if (!text || !threadId || commentLoading) {
      return;
    }

    setCommentLoading(true);
    setActionError('');

    try {
      await addComment(threadId, { text });
      setReply('');
      await loadThread({ silent: true });

      if (onUpdated) {
        onUpdated();
      }
    } catch (commentError) {
      setActionError(commentError.message || 'Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading && !thread) {
    return (
      <section className="animate-[fade-in_220ms_ease-out] space-y-4">
        <button type="button" onClick={onBack} className="btn-ghost text-sm">
          <ChevronLeft size={14} />
          Back to discussions
        </button>

        <div className="glass-card rounded-2xl py-14 text-center text-slate-400">Loading thread...</div>
      </section>
    );
  }

  if (!thread) {
    return (
      <section className="animate-[fade-in_220ms_ease-out] space-y-4">
        <button type="button" onClick={onBack} className="btn-ghost text-sm">
          <ChevronLeft size={14} />
          Back to discussions
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Thread not found.'}
        </div>
      </section>
    );
  }

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-4">
      <button type="button" onClick={onBack} className="btn-ghost text-sm">
        <ChevronLeft size={14} />
        Back to discussions
      </button>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <article className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {thread.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl font-bold text-slate-900">{thread.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{thread.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 font-semibold text-slate-900">
              {thread.author.avatar}
            </span>
            {thread.author.name}
          </span>
          <span>{thread.timeAgo}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`btn-ghost text-xs ${thread.myVote === 1 ? 'border-slate-300/45 bg-slate-100 text-slate-900' : ''}`}
            onClick={() => handleVote(1)}
            disabled={Boolean(voteLoading)}
          >
            <ThumbsUp size={13} />
            Helpful ({thread.upvotes})
          </button>

          <button
            type="button"
            className={`btn-ghost text-xs ${thread.myVote === -1 ? 'border-slate-300/45 bg-slate-100 text-slate-900' : ''}`}
            onClick={() => handleVote(-1)}
            disabled={Boolean(voteLoading)}
          >
            <ThumbsDown size={13} />
            Not helpful ({thread.downvotes})
          </button>
        </div>
      </article>

      <article className="glass-card rounded-2xl p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Replies ({commentCount})</h3>
        <div className="mt-3 space-y-1">
          {thread.comments.length ? (
            thread.comments.map((comment) => <CommentRow key={comment.id} comment={comment} />)
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
              No replies yet. Add the first answer.
            </p>
          )}
        </div>
      </article>

      <article className="glass-card rounded-2xl p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Post an answer</h3>
        <textarea
          rows={4}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write your explanation, suggestion, or resource link"
          className="input-field mt-3 resize-none"
          disabled={commentLoading}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">Keep answers short and clear for faster peer review.</p>
          <button
            type="button"
            onClick={submitReply}
            className="btn-primary text-sm"
            disabled={!reply.trim() || commentLoading}
          >
            <Send size={13} />
            {commentLoading ? 'Posting...' : 'Post answer'}
          </button>
        </div>

        {actionError ? <p className="mt-3 text-xs text-red-600">{actionError}</p> : null}
      </article>
    </section>
  );
}
