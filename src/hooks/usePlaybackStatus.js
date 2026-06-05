import { useCallback, useState } from "react";

export function usePlaybackStatus() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const setStatus = useCallback((text, error = false) => {
    setMessage(text ?? "");
    setIsError(Boolean(error));
  }, []);

  const clearStatus = useCallback(() => {
    setMessage("");
    setIsError(false);
  }, []);

  return { message, isError, setStatus, clearStatus };
}
