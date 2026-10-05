'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './ui';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Overview', icon: 'overview' },
  { href: '/admin/posts', label: 'Posts', icon: 'posts' },
  { href: '/admin/categories', label: 'Categories', icon: 'categories' },
  { href: '/admin/images', label: 'Images', icon: 'images' },
];

function isActive(pathname: string, href: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return href === '/admin' ? p === '/admin' : p === href || p.startsWith(`${href}/`);
}

export function AdminNav({ variant }: { variant: 'sidebar' | 'bar' }) {
  const pathname = usePathname() ?? '';

  if (variant === 'bar') {
    return (
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                active
                  ? 'bg-ember-50 text-ember-600 dark:bg-char-400 dark:text-ember-200'
                  : 'text-char-300 hover:bg-bone-100 dark:text-bone-100 dark:hover:bg-char-400'
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-ember-50 text-ember-600 dark:bg-char-400 dark:text-ember-200'
                : 'text-char-300 hover:bg-bone-100 hover:text-char-500 dark:text-bone-100 dark:hover:bg-char-400'
            }`}
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
