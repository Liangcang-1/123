'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type MenuItem = {
  toolId: string;
  enabled: boolean;
  sortOrder: number;
  nameOverride?: string | null;
  tool?: { name: string; key: string };
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);

  const load = async () => {
    const data = await apiFetch('/api/tool-menu');
    setItems(data?.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const move = (idx: number, delta: number) => {
    const next = [...items];
    const to = idx + delta;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    setItems(next.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const save = async () => {
    await apiFetch('/api/tool-menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((x, idx) => ({ toolId: x.toolId, enabled: x.enabled, sortOrder: idx, nameOverride: x.nameOverride || undefined })),
      }),
    });
    await load();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow space-y-4">
      <h1 className="text-2xl font-bold">菜单配置</h1>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.toolId} className="flex items-center gap-3 rounded border p-2 text-sm">
            <input type="checkbox" checked={item.enabled} onChange={(e) => setItems((arr) => arr.map((x, i) => (i === idx ? { ...x, enabled: e.target.checked } : x)))} />
            <span className="min-w-0 flex-1">{item.tool?.name || item.toolId}</span>
            <button onClick={() => move(idx, -1)} className="rounded border px-2">上移</button>
            <button onClick={() => move(idx, 1)} className="rounded border px-2">下移</button>
          </div>
        ))}
      </div>
      <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={save}>保存菜单</button>
    </div>
  );
}
