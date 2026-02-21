export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-semibold mb-4">登录</h1>
      <div className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="邮箱" />
        <input className="w-full rounded border p-2" placeholder="密码" type="password" />
        <button className="w-full rounded bg-blue-600 p-2 text-white">登录</button>
      </div>
    </div>
  );
}
