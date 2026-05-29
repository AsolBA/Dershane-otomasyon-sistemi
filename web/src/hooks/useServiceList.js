import { useCallback, useEffect, useState } from "react";

export function useServiceList(listFn, filters) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFn(filters);
      setRows(data);
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [listFn, filters]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, reload, setRows };
}
