import Link from 'next/link';

const modules = ['仪表盘', '用户管理', '套餐管理', 'Chat工具管理', 'RunningHub封装管理', '任务中心', '批量生成管理', '审计日志'];

export default function AdminPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Admin 后台</h1>
      <div className="rounded-xl bg-white p-4 shadow">
        JSON 编辑模式 + 版本回滚（MVP）
        <div className="mt-2">
          <Link href="/admin/provider-config" className="text-blue-600 underline">
            进入 Provider Config 管理
          </Link>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {modules.map((item) => (
          <li key={item} className="rounded-xl bg-white p-4 shadow">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
