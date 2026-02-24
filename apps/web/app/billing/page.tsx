'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function BillingPage() {
  const [summary, setSummary] = useState<any>(null);
  const [rank, setRank] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/billing/summary').then((d) => setSummary(d?.data));
    apiFetch('/api/billing/by-tool').then((d) => setRank(d?.data || []));
  }, []);

  if (!summary) return <div className="animate-pulse h-32 bg-white rounded-xl" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">用量与账单</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm">本月消耗</p><p className="text-2xl font-bold">{summary.monthUsed}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm">套餐额度</p><p className="text-2xl font-bold">{summary.quota}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm">剩余额度</p><p className="text-2xl font-bold">{summary.remaining}</p></div>
        <div className="bg-white rounded-xl p-4 shadow"><p className="text-sm">当前套餐</p><p className="text-2xl font-bold">{summary.plan}</p></div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold">按工具排行</h2>
        {rank.map((r) => <div key={r.tool} className="text-sm mt-1">{r.tool}: {r.amount}</div>)}
        <button className="mt-3 px-3 py-2 rounded bg-slate-900 text-white">升级套餐</button>
      </div>
    </div>
  );
}
