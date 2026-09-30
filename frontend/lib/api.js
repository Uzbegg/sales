export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

export const backendConfigured = Boolean(API_BASE)

export async function api(path, options = {}) {
  if (!backendConfigured) {
    throw new Error('Backend ещё не подключён. После запуска VPS укажем NEXT_PUBLIC_API_URL.')
  }
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Ошибка API')
  return data
}
