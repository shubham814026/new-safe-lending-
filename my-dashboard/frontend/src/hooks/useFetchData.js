import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching data with optional auto-refresh.
 * @param {string} url - API endpoint URL
 * @param {number} refreshInterval - ms between refreshes (0 = disabled)
 */
export default function useFetchData(url, refreshInterval = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();

    if (refreshInterval > 0) {
      const id = setInterval(refetch, refreshInterval);
      return () => clearInterval(id);
    }
  }, [refetch, refreshInterval]);

  return { data, loading, error, refetch };
}
