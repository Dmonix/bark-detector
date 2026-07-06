import { useState, useEffect, useCallback } from 'react';
import { fetchBarkEvents } from '../services/barkApi';

/**
 * React hook that loads bark events and supports manual refresh.
 */
export const useBarkEvents = (params = {}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBarkEvents(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
};
