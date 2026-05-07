"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => {
      dispose: () => void;
      addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

interface VideoCallProps {
  roomName: string;
  displayName: string;
  onCallEnd?: () => void;
}

export default function VideoCall({ roomName, displayName, onCallEnd }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof createApi> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function createApi(domain: string, options: Record<string, unknown>) {
    return new window.JitsiMeetExternalAPI(domain, options);
  }

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        setTimeout(initJitsi, 500);
        return;
      }

      const jitsiApi = createApi("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableSimulcast: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "fullscreen",
            "hangup",
            "chat",
            "tileview",
            "toggle-camera",
            "select-background",
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          DEFAULT_BACKGROUND: "#1a1a2e",
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
          FILM_STRIP_MAX_HEIGHT: 80,
        },
      });

      jitsiApi.addEventListener("readyToClose", () => {
        onCallEnd?.();
      });

      jitsiApi.addEventListener("videoConferenceJoined", () => {
        setIsLoading(false);
      });

      apiRef.current = jitsiApi;
    };

    initJitsi();

    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [roomName, displayName, onCallEnd]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-900">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-400">Memuat video call...</p>
        </div>
      )}
      <div ref={containerRef} className="h-[70vh] w-full" />
    </div>
  );
}
