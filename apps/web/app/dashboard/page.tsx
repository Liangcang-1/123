'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => setTasks(d?.data || []));
    fetch('/api/assets', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => setAssets(d?.data || []));
  }, []);

  const failed = tasks.filter((t) => t.status === 'failed').length;
  const failRate = tasks.length ? `${Math.round((failed / tasks.length) * 100)}%` : '0%';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">工作台概览</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">今日生成次数</p><p className="text-2xl font-bold">{tasks.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">失败率</p><p className="text-2xl font-bold">{failRate}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">资产总量</p><p className="text-2xl font-bold">{assets.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm text-slate-500">最近任务</p><p className="text-sm">{tasks[0]?.status || '-'}</p></div>
      </div>
    </div>
  );
}
