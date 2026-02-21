'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export function ThreeColumnTool() {
  const [productName, setProductName] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:3001/api/tools/chat/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: { product_name: productName, style: '种草' } }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setHistory((old) => [JSON.stringify(data.outputs ?? data), ...old]);
    },
  });

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-10rem)]">
      <section className="col-span-3 rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold mb-3">表单输入</h3>
        <input
          className="w-full rounded border p-2"
          placeholder="商品名称"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <button className="mt-3 rounded bg-blue-600 px-4 py-2 text-white" onClick={() => mutation.mutate()}>
          一键生成
        </button>
      </section>
      <section className="col-span-6 rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold mb-3">生成结果</h3>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(mutation.data, null, 2)}</pre>
      </section>
      <section className="col-span-3 rounded-xl bg-white p-4 shadow overflow-y-auto">
        <h3 className="font-semibold mb-3">历史记录</h3>
        <ul className="space-y-2 text-xs">
          {history.map((item, idx) => (
            <li key={idx} className="rounded bg-slate-100 p-2">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
