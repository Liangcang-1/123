'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

type MenuItem = { id: string; title: string; itemType: string; pagePath?: string | null; isDisabled?: boolean; disabledReason?: string; pinned?: boolean };
type MenuGroup = { id: string; name: string; items: MenuItem[] };

const baseLinks = [
  { href: '/dashboard', label: '工作台' },
  { href: '/tasks', label: '任务中心' },
  { href: '/assets', label: '素材库' },
  { href: '/billing', label: '账单用量' },
  { href: '/settings', label: '设置' },
  { href: '/admin', label: '平台后台' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [disabledMsg, setDisabledMsg] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    apiFetch('/api/menu').then((d) => setGroups(d?.data?.groups || [])).catch(() => setGroups([]));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid grid-cols-12 min-h-screen">
        <aside className="col-span-2 border-r bg-white p-4 space-y-4">
          <h1 className="font-bold text-lg">商家 AI 工作台</h1>
          <nav className="space-y-2 text-sm">
            {baseLinks.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded px-2 py-1 hover:bg-slate-100">{l.label}</Link>
            ))}
            {groups.map((g) => (
              <div key={g.id}>
                <p className="mt-3 mb-1 text-xs text-slate-500">{g.name}</p>
                {g.items?.map((i) =>
                  i.isDisabled ? (
                    <button key={i.id} onClick={() => setDisabledMsg(i.disabledReason || '当前套餐未开通该能力，可升级后使用')} className="block w-full text-left rounded px-2 py-1 text-slate-400 bg-slate-100">
                      {i.title}
                    </button>
                  ) : (
                    <Link key={i.id} href={i.itemType === 'page' ? i.pagePath || '/dashboard' : `/tools/${i.id}`} className="block rounded px-2 py-1 hover:bg-slate-100">
                      {i.pinned ? '📌 ' : ''}{i.title}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>
        </aside>
        <main className="col-span-10 p-6">{children}</main>
      </div>
      {disabledMsg && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center" onClick={() => setDisabledMsg('')}>
          <div className="bg-white p-6 rounded-xl shadow max-w-md">
            <h3 className="font-bold">功能未开通</h3>
            <p className="text-sm mt-2">{disabledMsg}</p>
            <a className="mt-3 inline-block text-blue-600 underline" href="/billing">去升级套餐</a>
          </div>
        </div>
      )}
    </div>
  );
}
