'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

const hints: Record<string, string> = {
  INPUT_INVALID: '请检查必填项与格式。',
  ASSET_TOO_LARGE: '请压缩素材。',
  ENGINE_TIMEOUT: '稍后重试或减少输入复杂度。',
  NOT_ENTITLED: '升级套餐后可继续。',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const load = async () => {
    const q = status ? `?status=${status}` : '';
    const data = await apiFetch(`/api/tasks${q}`);
    setTasks(data?.data || []);
  };

  useEffect(() => { load(); }, [status]);

  const batchRetry = async () => {
    for (const id of selected) await apiFetch(`/api/tasks/${id}/retry`, { method: 'POST' });
    setSelected([]);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">任务中心</h1>
      <div className="bg-white rounded-xl shadow p-3 flex gap-2 items-center">
        <select className="border rounded p-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">全部</option><option value="running">进行中</option><option value="succeeded">成功</option><option value="failed">失败</option><option value="canceled">取消</option>
        </select>
        <button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={batchRetry}>批量重试</button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3"></th><th className="text-left">ID</th><th>状态</th><th>类型</th><th>建议</th><th></th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3"><input type="checkbox" checked={selected.includes(t.id)} onChange={(e)=>setSelected((old)=>e.target.checked?[...old,t.id]:old.filter(x=>x!==t.id))}/></td>
                <td className="p-3">{t.id.slice(0, 8)}</td>
                <td>{t.status}</td>
                <td>{t.type}</td>
                <td className="text-xs text-slate-500">{hints[t.errorCode || ''] || '-'}</td>
                <td><Link className="text-blue-600" href={`/tasks/${t.id}`}>详情</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
