'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('password123');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const submit = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data?.ok && data?.data?.accessToken) {
      localStorage.setItem('token', data.data.accessToken);
      const tenantRes = await fetch('/api/me/tenants', { headers: { Authorization: `Bearer ${data.data.accessToken}` } });
      const tenantData = await tenantRes.json();
      const tenantId = tenantData?.data?.[0]?.tenantId;
      if (tenantId) localStorage.setItem('tenantId', tenantId);
      router.push('/dashboard');
    } else {
      setMsg(data?.error?.message || '登录失败');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white rounded-xl shadow p-6 space-y-4">
      <h1 className="text-xl font-bold">商家登录</h1>
      <input className="w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={submit} className="w-full rounded bg-slate-900 text-white py-2">登录</button>
      {msg && <p className="text-red-600 text-sm">{msg}</p>}
    </div>
  );
}
