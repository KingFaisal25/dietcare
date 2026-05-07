import { useCallback, useEffect, useRef, useState } from "react";
import {
  ref,
  push,
  onValue,
  update,
  query,
  orderByChild,
  set,
  onDisconnect,
} from "firebase/database";
import { database } from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "nutritionist";
  content: string;
  type: "text" | "image" | "meal_plan_update";
  timestamp: number;
  isRead: boolean;
}

interface UseChatOptions {
  chatRoomId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "client" | "nutritionist";
}

// ── Helper ───────────────────────────────────────────────

export function getChatRoomId(clientId: number | string, nutritionistId: number | string): string {
  return `client_${clientId}_nutritionist_${nutritionistId}`;
}

// ── Hook ─────────────────────────────────────────────────

export function useChat({ chatRoomId, currentUserId, currentUserName, currentUserRole }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Subscribe to messages ─────────────────────────────
  useEffect(() => {
    if (!chatRoomId) return;

    const messagesRef = query(ref(database, `chats/${chatRoomId}/messages`), orderByChild("timestamp"));

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const parsed: ChatMessage[] = Object.entries(data).map(([key, value]) => ({
        ...(value as Omit<ChatMessage, "id">),
        id: key,
      }));

      parsed.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      setMessages(parsed);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  // ── Subscribe to partner typing ───────────────────────
  useEffect(() => {
    if (!chatRoomId) return;

    const partnerRole = currentUserRole === "client" ? "nutritionist" : "client";
    const typingRef = ref(database, `chats/${chatRoomId}/typing/${partnerRole}`);

    const unsubscribe = onValue(typingRef, (snapshot) => {
      setIsPartnerTyping(snapshot.val() === true);
    });

    return () => unsubscribe();
  }, [chatRoomId, currentUserRole]);

  // ── Connection status ─────────────────────────────────
  useEffect(() => {
    const connectedRef = ref(database, ".info/connected");
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });

    return () => unsubscribe();
  }, []);

  // ── Set presence (online/offline) ─────────────────────
  useEffect(() => {
    if (!chatRoomId || !currentUserRole) return;

    const presenceRef = ref(database, `chats/${chatRoomId}/presence/${currentUserRole}`);
    set(presenceRef, true);
    onDisconnect(presenceRef).set(false);

    return () => {
      set(presenceRef, false);
    };
  }, [chatRoomId, currentUserRole]);

  // ── Send message ──────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, type: ChatMessage["type"] = "text") => {
      if (!chatRoomId || !content.trim()) return;

      const messagesRef = ref(database, `chats/${chatRoomId}/messages`);
      await push(messagesRef, {
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        content: content.trim(),
        type,
        timestamp: Date.now(),
        isRead: false,
      });

      // Stop typing indicator after sending
      const typingRef = ref(database, `chats/${chatRoomId}/typing/${currentUserRole}`);
      set(typingRef, false);
    },
    [chatRoomId, currentUserId, currentUserName, currentUserRole]
  );

  // ── Mark as read ──────────────────────────────────────
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!chatRoomId) return;
      const messageRef = ref(database, `chats/${chatRoomId}/messages/${messageId}`);
      await update(messageRef, { isRead: true });
    },
    [chatRoomId]
  );

  // ── Mark all unread from partner as read ──────────────
  const markAllAsRead = useCallback(() => {
    messages
      .filter((msg) => msg.senderRole !== currentUserRole && !msg.isRead)
      .forEach((msg) => markAsRead(msg.id));
  }, [messages, currentUserRole, markAsRead]);

  // ── Typing indicator ──────────────────────────────────
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!chatRoomId) return;

      const typingRef = ref(database, `chats/${chatRoomId}/typing/${currentUserRole}`);
      set(typingRef, isTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          set(typingRef, false);
        }, 3000);
      }
    },
    [chatRoomId, currentUserRole]
  );

  return {
    messages,
    sendMessage,
    markAsRead,
    markAllAsRead,
    setTyping,
    isPartnerTyping,
    isConnected,
  };
}
