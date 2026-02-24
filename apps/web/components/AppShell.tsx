'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type MenuGroup = { id: string; name: string; items: Array<{ id: string; title: string; itemType: string; pagePath?: string | null }> };

const baseLinks = [
  { href: '/dashboard', label: '工作台' },
  { href: '/tasks', label: '任务中心' },
  { href: '/assets', label: '素材库' },
  { href: '/settings', label: '设置' },
  { href: '/admin', label: '平台后台' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<MenuGroup[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/menu', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setGroups(d?.data || []))
      .catch(() => setGroups([]));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid grid-cols-12 min-h-screen">
        <aside className="col-span-2 border-r bg-white p-4 space-y-4">
          <h1 className="font-bold text-lg">商家 AI 平台</h1>
          <nav className="space-y-2 text-sm">
            {baseLinks.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded px-2 py-1 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
            {groups.map((g) => (
              <div key={g.id}>
                <p className="mt-3 mb-1 text-xs text-slate-500">{g.name}</p>
                {g.items?.map((i) => (
                  <Link
                    key={i.id}
                    href={i.itemType === 'page' ? i.pagePath || '/dashboard' : `/tools/${i.id}`}
                    className="block rounded px-2 py-1 hover:bg-slate-100"
                  >
                    {i.title}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <main className="col-span-10 p-6">{children}</main>
      </div>
    </div>
  );
}
