'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Wraps page content in the public header/footer, except under /admin where
 * the admin layout supplies its own shell (and ads/consent must not load).
 */
export function SiteChrome({
  top,
  bottom,
  children,
}: {
  top: ReactNode;
  bottom: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;

  return (
    <>
      {top}
      <main id="main" className="animate-fade-in">
        {children}
      </main>
      {bottom}
    </>
  );
}
