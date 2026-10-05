import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/admin-nav';
import { Icon } from '@/components/admin/ui';

export const metadata: Metadata = {
  title: 'Admin — Menu Moments',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone-100 text-char-500 dark:bg-char-600 dark:text-bone-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-bone-200 bg-bone-50 px-4 py-5 dark:border-char-400 dark:bg-char-500 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember-500 text-sm font-semibold text-white">
            MM
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Menu Moments</span>
            <span className="block text-xs text-char-200">Admin console</span>
          </span>
        </Link>

        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-char-200">
          Manage
        </p>
        <AdminNav variant="sidebar" />

        <div className="mt-auto border-t border-bone-200 pt-4 dark:border-char-400">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-char-300 hover:bg-bone-100 dark:text-bone-100 dark:hover:bg-char-400"
          >
            <Icon name="external" className="h-[18px] w-[18px]" />
            View live site
          </Link>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-bone-200 bg-bone-50/90 backdrop-blur dark:border-char-400 dark:bg-char-500/90">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember-500 text-xs font-semibold text-white">
                MM
              </span>
              <span className="text-sm font-semibold">Admin</span>
            </Link>
            <span className="hidden text-sm text-char-200 lg:inline">menumoments.com</span>
            <Link
              href="/"
              target="_blank"
              className="ml-auto flex items-center gap-2 rounded-lg border border-bone-200 px-3 py-1.5 text-xs font-medium text-char-300 hover:border-ember-500 hover:text-ember-500 dark:border-char-400 dark:text-bone-100 lg:hidden"
            >
              View site
              <Icon name="external" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <AdminNav variant="bar" />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
