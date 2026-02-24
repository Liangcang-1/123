'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);

  const load = async () => {
    const token = localStorage.getItem('token');
    const data = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
    setTasks(data?.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">任务中心</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">ID</th><th>状态</th><th>类型</th><th></th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t"><td className="p-3">{t.id.slice(0, 8)}</td><td>{t.status}</td><td>{t.type}</td><td><Link className="text-blue-600" href={`/tasks/${t.id}`}>详情</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
