'use client';

import { startTransition, useActionState } from 'react';
import type { ActionState } from '@/app/admin/actions';

export function DeleteButton({
  action,
  slug,
  name,
  label = 'Delete',
  compact = false,
}: {
  action: (prev: ActionState | null, form: FormData) => Promise<ActionState>;
  slug: string;
  name: string;
  label?: string;
  compact?: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const ok = window.confirm(
          `Delete "${name}"?\n\nIt disappears from the site and cannot be restored from the admin.`,
        );
        if (!ok) return;
        const form = new FormData(e.currentTarget);
        startTransition(() => dispatch(form));
      }}
      className={compact ? 'inline' : ''}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className={
          compact
            ? 'text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400'
            : 'rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40'
        }
      >
        {pending ? 'Deleting…' : label}
      </button>
      {state && !state.ok && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.message}</p>}
    </form>
  );
}
