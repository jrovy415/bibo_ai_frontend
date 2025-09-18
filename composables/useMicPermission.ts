import { useEffect, useState } from "react";

export function useMicPermission() {
  const [micGranted, setMicGranted] = useState<null | boolean>(null);

  useEffect(() => {
    const requestMic = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicGranted(true);
      } catch (err) {
        console.warn("Microphone access denied:", err);
        setMicGranted(false);
      }
    };

    requestMic();
  }, []);

  return micGranted;
}
