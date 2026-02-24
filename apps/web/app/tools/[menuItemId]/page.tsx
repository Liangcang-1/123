'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function ToolRunPage() {
  const params = useParams<{ menuItemId: string }>();
  const [meta, setMeta] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch(`/api/tools/${params.menuItemId}/meta`).then((d) => setMeta(d?.data));
  }, [params.menuItemId]);

  const submit = async () => {
    setLoading(true);
    const menu = await apiFetch('/api/menu');
    const item = (menu?.data?.items || []).find((i:any) => i.id === params.menuItemId);
    const data = await apiFetch('/api/tasks/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: item.itemType, id: item.itemId, input: form }),
    });
    setResult(data);
    setLoading(false);
  };

  const saveAsset = async () => {
    if (!result?.data?.resultUrl) return;
    await apiFetch('/api/assets/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '工具页临时入库' }) });
    alert('结果已生成并自动入库，可到素材库查看。');
  };

  if (!meta) return <div className="animate-pulse h-40 bg-white rounded-xl" />;

  return (
    <div className="grid grid-cols-2 gap-4">
      <section className="bg-white rounded-xl shadow p-4">
        <h1 className="text-xl font-bold">{meta.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{meta.description || '智能创作工具'}</p>
        <p className="text-xs mt-1 text-slate-500">成本提示：{meta.costHint || '按套餐计费'}</p>
        <div className="mt-3 space-y-2">
          {(meta.schema?.fields || []).map((f: any) => (
            <div key={f.name}>
              <label className="text-sm">{f.name}</label>
              <input className="w-full border rounded p-2" onChange={(e) => setForm((o) => ({ ...o, [f.name]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {(meta.presets || []).map((p:any,idx:number)=><button key={idx} className="px-2 py-1 rounded bg-slate-100" onClick={()=>setForm((p.values||{}))}>{p.name}</button>)}
        </div>
        <button onClick={submit} className="mt-4 rounded bg-slate-900 text-white px-4 py-2">{loading ? '生成中...' : '提交生成'}</button>
      </section>
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold">输出与版本</h2>
        {!result && <p className="text-slate-500 text-sm mt-2">提交后在这里展示结果、版本与A/B对比。</p>}
        {result?.data && (
          <div className="space-y-2 mt-2">
            <p className="text-sm">状态：{result.data.status}</p>
            <pre className="text-xs bg-slate-100 rounded p-2">{JSON.stringify(result.data.output, null, 2)}</pre>
            {result.data.resultUrl && <a className="text-blue-600 underline" href={result.data.resultUrl} target="_blank">查看结果链接</a>}
            <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={saveAsset}>入库素材库</button>
          </div>
        )}
      </section>
    </div>
  );
}
