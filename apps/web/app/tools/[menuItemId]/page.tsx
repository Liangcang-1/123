'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Field = { name: string; type: string; required?: boolean; options?: string[] };

export default function ToolRunPage() {
  const params = useParams<{ menuItemId: string }>();
  const router = useRouter();
  const [menuItem, setMenuItem] = useState<any>(null);
  const [schema, setSchema] = useState<Field[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/menu', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(async (d) => {
        const item = (d?.data || []).flatMap((g: any) => g.items || []).find((i: any) => i.id === params.menuItemId);
        setMenuItem(item);
        if (!item) return;
        const endpoint = item.itemType === 'template' ? '/api/catalog/templates' : '/api/catalog/tools';
        const list = await fetch(endpoint).then((x) => x.json());
        const entity = (list?.data || []).find((x: any) => x.id === item.itemId);
        const fields = entity?.inputSchema?.fields || [];
        setSchema(fields);
      });
  }, [params.menuItemId]);

  const submit = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/tasks/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: menuItem.itemType, id: menuItem.itemId, input: form }),
    });
    const data = await res.json();
    if (data?.ok) router.push(`/tasks/${data.data.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h1 className="text-xl font-bold mb-4">{menuItem?.title || '创作工具'}</h1>
      <div className="space-y-3">
        {schema.map((f) => (
          <div key={f.name}>
            <label className="text-sm text-slate-600">{f.name}</label>
            {f.type === 'select' ? (
              <select className="w-full border rounded p-2" onChange={(e) => setForm((old) => ({ ...old, [f.name]: e.target.value }))}>
                {(f.options || []).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input className="w-full border rounded p-2" onChange={(e) => setForm((old) => ({ ...old, [f.name]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>
      <button className="mt-4 rounded bg-slate-900 text-white px-4 py-2" onClick={submit}>提交生成</button>
    </div>
  );
}
