'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

type Field = { key: string; label?: string; type: string; required?: boolean; options?: string[]; default?: any };

export default function RunToolByKeyPage() {
  const params = useParams<{ toolKey: string }>();
  const [tool, setTool] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/tools').then((res) => {
      const t = (res?.data || []).find((x: any) => x.key === params.toolKey);
      setTool(t || null);
      const defaults: Record<string, any> = {};
      ((t?.inputSchema?.fields || []) as Field[]).forEach((f) => {
        if (f.default !== undefined) defaults[f.key] = f.default;
      });
      setInputs(defaults);
    });
  }, [params.toolKey]);

  const fields = useMemo(() => ((tool?.inputSchema?.fields || []) as Field[]), [tool]);

  const run = async () => {
    const data = await apiFetch(`/api/tools/${tool.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
    });
    setResult(data?.data || null);
  };

  if (!tool) return <div className="rounded-xl bg-white p-6 shadow text-sm text-slate-500">工具不存在或加载中...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-white p-6 shadow space-y-3">
        <h1 className="text-xl font-bold">运行工具：{tool.name}</h1>
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm">{f.label || f.key}</label>
            {(f.type === 'text' || f.type === 'asset_ref') && (
              <input className="w-full rounded border p-2" value={inputs[f.key] || ''} onChange={(e) => setInputs((s) => ({ ...s, [f.key]: e.target.value }))} />
            )}
            {f.type === 'textarea' && (
              <textarea className="w-full rounded border p-2" value={inputs[f.key] || ''} onChange={(e) => setInputs((s) => ({ ...s, [f.key]: e.target.value }))} />
            )}
            {f.type === 'number' && (
              <input type="number" className="w-full rounded border p-2" value={inputs[f.key] ?? ''} onChange={(e) => setInputs((s) => ({ ...s, [f.key]: Number(e.target.value) }))} />
            )}
            {f.type === 'boolean' && (
              <input type="checkbox" checked={Boolean(inputs[f.key])} onChange={(e) => setInputs((s) => ({ ...s, [f.key]: e.target.checked }))} />
            )}
            {f.type === 'select' && (
              <select className="w-full rounded border p-2" value={inputs[f.key] || ''} onChange={(e) => setInputs((s) => ({ ...s, [f.key]: e.target.value }))}>
                <option value="">请选择</option>
                {(f.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>
        ))}
        <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={run}>执行</button>
      </div>
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="font-semibold">执行结果</h2>
        {!result && <p className="mt-2 text-sm text-slate-500">提交后展示 status / providerJobId / outputs。</p>}
        {result && <pre className="mt-2 rounded bg-slate-100 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  );
}
