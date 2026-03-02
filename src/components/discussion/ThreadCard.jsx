import { MessageSquare, ThumbsDown, ThumbsUp } from '../icons/Icons';

export default function ThreadCard({ thread, onOpen }) {
  const score = Number(thread.upvotes || 0) - Number(thread.downvotes || 0);

  return (
    <article
      className="glass-card glass-card-hover cursor-pointer rounded-2xl p-4"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2 text-slate-500">
          <ThumbsUp size={14} />
          <span className="text-sm font-bold text-slate-900">{score}</span>
          <ThumbsDown size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {thread.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{thread.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{thread.description}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 font-semibold text-slate-900">
                {thread.author.avatar}
              </span>
              <span>{thread.author.name}</span>
              <span className="text-slate-500">{thread.timeAgo}</span>
            </div>

            <span className="inline-flex items-center gap-1 text-slate-600">
              <MessageSquare size={13} className="text-slate-400" />
              {thread.commentCount} replies
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
