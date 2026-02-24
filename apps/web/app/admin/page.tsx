'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [msg, setMsg] = useState('');

  const syncCatalog = async () => {
    const data = await fetch('/api/admin/catalog/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'platform-admin' }),
    }).then((r) => r.json());
    setMsg(`同步完成: 模板 ${data?.data?.templates || 0}, 工具 ${data?.data?.tools || 0}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">平台后台</h1>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <h2 className="font-semibold">Catalog 同步</h2>
        <button className="rounded bg-slate-900 text-white px-3 py-2" onClick={syncCatalog}>同步外部 Provider 目录</button>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
      </div>
      <p className="text-sm text-slate-500">可在 /admin/provider-config 维护 Provider 配置与密钥。</p>
    </div>
  );
}
