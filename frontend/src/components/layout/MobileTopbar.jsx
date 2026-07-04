import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import FeedbackModal from '../feedback/FeedbackModal';
import NotificationBell from '../notifications/NotificationBell';

function getInitials(name) {
  if (!name) return 'FA';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function MobileTopbar() {
  const { user } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <header className="flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white/85 px-4 py-2 shadow-soft backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-800/80">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {user?.avatar_url ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${user.avatar_url}`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {user?.name || 'Finance AI'}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
          aria-label="Enviar feedback"
        >
          <MessageSquareText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </button>
        <NotificationBell />
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </header>
  );
}

export default MobileTopbar;
