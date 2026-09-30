import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Menu Moments',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/images', label: 'Images' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone-50 text-char-500 dark:bg-char-600 dark:text-bone-50">
      <header className="border-b border-bone-200 bg-bone-100/80 backdrop-blur dark:border-char-500 dark:bg-char-500/80">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link href="/admin" className="font-display text-lg font-semibold">
            Menu Moments · Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-char-300 hover:bg-bone-100 hover:text-ember-500 dark:text-bone-100 dark:hover:bg-char-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-char-200">
            <Link href="/" className="hover:text-ember-500">
              View site →
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
