export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } as Record<string, string>;
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    alert('登录已过期，请重新登录');
    window.location.href = '/auth/login';
    throw new Error('UNAUTHORIZED');
  }
  return res.json();
}
