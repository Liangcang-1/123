'use client';

import { useState } from 'react';

const defaultChatConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  timeout: 30000,
  retry: 2,
  endpoint: 'https://api.openai.com/v1/chat/completions',
};

const defaultRunninghubConfig = {
  endpoint: 'https://api.runninghub.com/v1',
  api_key_secret_ref: 'runninghub_api_key',
  queue_limit: 20,
  timeout: 45000,
};

export default function ProviderConfigPage() {
  const [chatJson, setChatJson] = useState(JSON.stringify(defaultChatConfig, null, 2));
  const [runninghubJson, setRunninghubJson] = useState(JSON.stringify(defaultRunninghubConfig, null, 2));
  const [secretValue, setSecretValue] = useState('');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Provider Config 管理</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold mb-2">1) Chat Provider</h2>
          <textarea className="w-full h-56 rounded border p-2 font-mono text-xs" value={chatJson} onChange={(e) => setChatJson(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="rounded bg-blue-600 px-3 py-1 text-white">保存生成版本</button>
            <button className="rounded bg-slate-700 px-3 py-1 text-white">回滚</button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold mb-2">2) RunningHub Provider</h2>
          <textarea className="w-full h-56 rounded border p-2 font-mono text-xs" value={runninghubJson} onChange={(e) => setRunninghubJson(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="rounded bg-blue-600 px-3 py-1 text-white">保存生成版本</button>
            <button className="rounded bg-slate-700 px-3 py-1 text-white">回滚</button>
          </div>
        </section>
      </div>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="font-semibold mb-2">3) Secrets Vault</h2>
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="输入新密钥用于轮换"
          value={secretValue}
          onChange={(e) => setSecretValue(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          <button className="rounded bg-emerald-600 px-3 py-1 text-white">保存密钥</button>
          <button className="rounded bg-amber-600 px-3 py-1 text-white">轮换密钥</button>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="font-semibold mb-2">审计日志</h2>
        <p className="text-sm text-slate-600">所有配置修改、版本创建、回滚、密钥轮换都将写入 admin_logs。</p>
      </section>
    </div>
  );
}
