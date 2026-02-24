'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type Tool = {
  id: string;
  key: string;
  name: string;
  status: string;
  workflowRef: string;
  providerKey: string;
};

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    key: '',
    name: '',
    workflowRef: '',
    status: 'draft',
    inputSchema: '{"title":"Tool","fields":[{"key":"prompt","label":"Prompt","type":"textarea","required":true}]}',
  });

  const load = async () => {
    setLoading(true);
    const data = await apiFetch('/api/tools');
    setTools(data?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await apiFetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        inputSchema: JSON.parse(form.inputSchema),
      }),
    });
    setFormOpen(false);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">工具市场</h1>
          <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={() => setFormOpen((v) => !v)}>新建工具</button>
        </div>
        {formOpen && (
          <div className="mt-4 grid gap-2 rounded border p-3">
            <input className="rounded border p-2" placeholder="key" value={form.key} onChange={(e) => setForm((s) => ({ ...s, key: e.target.value }))} />
            <input className="rounded border p-2" placeholder="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            <input className="rounded border p-2" placeholder="workflowRef" value={form.workflowRef} onChange={(e) => setForm((s) => ({ ...s, workflowRef: e.target.value }))} />
            <textarea className="rounded border p-2" rows={4} value={form.inputSchema} onChange={(e) => setForm((s) => ({ ...s, inputSchema: e.target.value }))} />
            <button className="rounded bg-emerald-600 px-3 py-2 text-white" onClick={create}>保存</button>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        {loading && <p className="text-sm text-slate-500">加载中...</p>}
        {!loading && tools.length === 0 && <p className="text-sm text-slate-500">暂无工具。</p>}
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id} className="rounded border p-3 text-sm">
              <div className="font-semibold">{tool.name}</div>
              <div className="text-slate-500">key: {tool.key} · status: {tool.status} · workflowRef: {tool.workflowRef}</div>
              <div className="mt-2 flex gap-3">
                <Link className="text-blue-600 underline" href={`/run/${tool.key}`}>运行</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
