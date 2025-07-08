import Papa from 'papaparse';
import { useState, useEffect } from 'react';

export const useCSVData = <T>(csv: string): [T[], boolean] => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse<T>(csv, {
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      header: true,
      skipEmptyLines: true,
    });
  }, [csv]);

  return [data, loading];
};
