import { useEffect } from 'react';

const BASE_TITLE = 'dan jacquemin . com';

export function useUpdateDocumentTitle(title?: string) {
  useEffect(() => {
    if (title?.trim()) {
      document.title = `${title.trim().toLowerCase()} | ${BASE_TITLE}`;
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
