import { useCallback } from 'react';
import { toast } from 'sonner';

export function useToast() {
  const showToast = useCallback((message: string, type: 'default' | 'error' = 'default') => {
    if (type === 'error') {
      toast.error(message, {
        duration: 5000,
      });
    } else {
      toast(message, {
        duration: 3000,
      });
    }
  }, []);

  return { showToast };
}
