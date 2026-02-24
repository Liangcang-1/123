'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => setTask(d?.data));
  }, [id]);

  if (!task) return <div>加载中...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">任务详情</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <p>状态：{task.status}</p>
        <p>进度：{task.progress}%</p>
        <pre className="text-xs mt-2 bg-slate-100 p-3 rounded">{JSON.stringify(task.input, null, 2)}</pre>
        <pre className="text-xs mt-2 bg-slate-100 p-3 rounded">{JSON.stringify(task.output, null, 2)}</pre>
        {task.resultUrl && <a className="text-blue-600 underline" target="_blank" href={task.resultUrl}>查看产出链接</a>}
      </div>
    </div>
  );
}
