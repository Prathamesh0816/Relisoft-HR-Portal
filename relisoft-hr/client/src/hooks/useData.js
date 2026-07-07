import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useData = (apiFunc, params = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result } = await apiFunc(overrideParams || params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  useEffect(() => {
    if (immediate) fetchData();
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useMutation = (apiFunc) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(data);
      toast.success('Operation successful!');
      return result.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
