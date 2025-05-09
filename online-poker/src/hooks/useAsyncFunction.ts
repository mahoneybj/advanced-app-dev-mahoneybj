import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLoading } from "../context/IsLoadingContext";

function useAsyncFunction<T>() {
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    asyncFn: () => Promise<T>,
    options = {
      loadingMessage: 'Processing...',
      successMessage: 'Operation completed successfully',
      errorMessage: 'An error occurred'
    }
  ) => {
    setError(null);
    setIsLoading(true);
    const toastId = toast.loading(options.loadingMessage);
    
    try {
      // Check if offline before operation
      const isOffline = !navigator.onLine;
      
      if (isOffline) {
        // For offline operations, use timeout to prevent hanging
        const operationPromise = asyncFn();
        
        // Set a maximum timeout for offline operations
        setTimeout(() => {
          setIsLoading(false);
          toast.success(`You're offline. Changes saved locally and will sync when back online.`, 
            { id: toastId });
        }, 1500);
        
        // Still try to complete the operation
        const result = await operationPromise;
        setData(result);
        return result;
      } else {
        // Normal online flow
        const result = await asyncFn();
        setData(result);
        toast.success(options.successMessage, { id: toastId });
        return result;
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError(new Error("You're offline. Operation saved locally."));
        toast.error("You're offline. Changes will sync when back online.", { id: toastId });
      } else {
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error(options.errorMessage, { id: toastId });
      }
      throw err;
    } finally {
      // Only set loading to false if we're online or if there was an error
      // For offline operations, the timeout above handles it
      if (navigator.onLine) {
        setIsLoading(false);
      }
    }
  }, [setIsLoading]);

  return { execute, error, data };
}

export default useAsyncFunction;