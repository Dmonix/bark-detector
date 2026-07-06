import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBarkEvents } from '../../frontend/services/barkApi';

describe('barkApi.fetchBarkEvents', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls the correct endpoint', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ total: 0, events: [] }),
    });

    await fetchBarkEvents();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/bark'));
  });

  it('passes device filter as a query param', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ total: 0, events: [] }) });
    await fetchBarkEvents({ device: 'garden' });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('device=garden');
  });

  it('throws on non-ok responses', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchBarkEvents()).rejects.toThrow('API error 500');
  });
});
