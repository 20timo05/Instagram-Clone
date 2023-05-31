import { useState, useEffect } from "react";

// don't call callback (for example computational expensive api request) on every change in dependencies,
// just when it has not changed for delay amount of time
export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
