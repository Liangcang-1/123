'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[] | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [name, setName] = useState('');

  const load = () => {
    apiFetch('/api/assets').then((d) => setAssets(d?.data || []));
    apiFetch('/api/assets/folders').then((d) => setFolders(d?.data || []));
  };
  useEffect(() => { load(); }, []);

  const createFolder = async () => {
    if (!name) return;
    await apiFetch('/api/assets/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setName('');
    load();
  };

  if (!assets) return <div className="animate-pulse h-40 bg-white rounded-xl" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">素材库</h1>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">文件夹</h3>
        <div className="flex gap-2 mt-2"><input className="border rounded p-2" value={name} onChange={(e)=>setName(e.target.value)} placeholder="新建文件夹"/><button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={createFolder}>创建</button></div>
        <div className="flex gap-2 mt-2 flex-wrap">{folders.map((f)=> <span key={f.id} className="px-2 py-1 rounded bg-slate-100 text-sm">{f.name}</span>)}</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {assets.length===0 && <div className="col-span-3 text-slate-500">暂无素材，先去工具页生成。</div>}
        {assets.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow p-3 space-y-2">
            <p className="text-xs text-slate-500">{a.type} · {a.title || '未命名素材'}</p>
            <a className="text-blue-600 underline break-all" href={a.contentUrl} target="_blank">预览/下载</a>
          </div>
        ))}
      </div>
    </div>
  );
}
