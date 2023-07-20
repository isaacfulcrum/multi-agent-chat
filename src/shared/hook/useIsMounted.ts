import { useCallback, useEffect, useRef } from "react";

// ********************************************************************************
/** Returns true if the component is mounted. Useful to avoid setting state on an unmounted component. */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};
