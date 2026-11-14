'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { ROUTE, isRouteAvailable } from '@/lib/nav';

const LINKS = [ROUTE.services, ROUTE.map, ROUTE.incidents, ROUTE.statistics, ROUTE.methodology].filter(isRouteAvailable);

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const button = useRef<HTMLButtonElement>(null);
  return <div className="lg:hidden" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
  }}>
    <button ref={button} type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-controls={menuId} aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-ink">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
    </button>
    <nav id={menuId} hidden={!open} aria-label="Navegación móvil" className="absolute inset-x-0 top-full border-b border-border bg-surface px-4 py-4 shadow-lg">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Explora PulsoVE</p>
      {LINKS.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-between rounded-xl px-3 py-3 text-sm font-medium hover:bg-bg">{link.label}<span aria-hidden="true">→</span></Link>)}
    </nav>
  </div>;
}
