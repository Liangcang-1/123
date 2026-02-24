'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [assets, setAssets] = useState<any[] | null>(null);
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/tasks').then((d) => setTasks(d?.data || []));
    apiFetch('/api/assets').then((d) => setAssets(d?.data || []));
    apiFetch('/api/menu').then((d) => setMenu((d?.data?.items || []).filter((x:any)=>x.pinned).slice(0,4));
  }, []);

  if (!tasks || !assets) return <div className="animate-pulse space-y-3"><div className="h-24 bg-white rounded-xl" /><div className="h-24 bg-white rounded-xl" /></div>;

  const running = tasks.filter((t) => t.status === 'running').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">工作台概览</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">今日任务</p><p className="text-2xl font-bold">{tasks.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">进行中</p><p className="text-2xl font-bold">{running}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">最近素材</p><p className="text-2xl font-bold">{assets.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">首次引导</p><p className="text-sm">从左侧选择工具开始创作</p></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold">常用工具</h2>
        <div className="flex gap-2 mt-2 flex-wrap">
          {menu.length ? menu.map((m:any)=><Link key={m.id} href={`/tools/${m.id}`} className="px-3 py-1 rounded bg-slate-100">{m.title}</Link>) : <p className="text-sm text-slate-500">暂无常用工具</p>}
        </div>
      </div>
    </div>
  );
}
