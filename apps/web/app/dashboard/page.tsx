export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">工作台</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 shadow">标题生成</div>
        <div className="rounded-xl bg-white p-4 shadow">投放文案</div>
        <div className="rounded-xl bg-white p-4 shadow">视频脚本</div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow">剩余额度：70%</div>
      <div className="rounded-xl bg-white p-4 shadow">最近生成记录：3条</div>
    </div>
  );
}
