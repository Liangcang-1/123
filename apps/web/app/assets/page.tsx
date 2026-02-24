'use client';

import { useEffect, useState } from 'react';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/assets', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAssets(d?.data || []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">素材库</h1>
      <div className="grid grid-cols-3 gap-4">
        {assets.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow p-3">
            <p className="text-xs text-slate-500">{a.type}</p>
            <a className="text-blue-600 underline break-all" href={a.contentUrl} target="_blank">{a.contentUrl}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
