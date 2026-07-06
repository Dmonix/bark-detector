const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Fetch paginated bark events.
 * @param {{ device?: string, page?: number, limit?: number }} params
 */
export const fetchBarkEvents = async ({ device, page = 1, limit = 50 } = {}) => {
  const qs = new URLSearchParams({ page, limit });
  if (device) qs.set('device', device);

  const res = await fetch(`${BASE}/api/bark?${qs}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};
