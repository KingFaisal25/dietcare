"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  MessageCircle,
  Phone,
  Send,
  Smile,
  WifiOff,
} from "lucide-react";
import { useChat, type ChatMessage } from "@/lib/hooks/useChat";
import { getWaLink } from "@/lib/wa";
import { gsap } from "gsap";

const EMOJI_LIST = ["😊", "👍", "🙏", "💪", "🥗", "🍎", "🏃", "❤️", "🔥", "✅", "⭐", "😄", "🎉", "👏", "💧", "🥦"];

interface ChatWindowProps {
  chatRoomId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "client" | "nutritionist";
  partnerName: string;
  partnerAvatarUrl: string;
  partnerPhone?: string;
  isPartnerOnline?: boolean;
}

export default function ChatWindow({
  chatRoomId,
  currentUserId,
  currentUserName,
  currentUserRole,
  partnerName,
  partnerAvatarUrl,
  partnerPhone,
  isPartnerOnline = false,
}: ChatWindowProps) {
  const {
    messages,
    sendMessage,
    markAllAsRead,
    setTyping,
    isPartnerTyping,
    isConnected,
  } = useChat({ chatRoomId, currentUserId, currentUserName, currentUserRole });

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, []);

  useEffect(() => {
    if (lastMessageRef.current && messages.length > 0) {
      gsap.from(lastMessageRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    markAllAsRead();
  }, [messages, markAllAsRead]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    setShowEmoji(false);
    inputRef.current?.focus();
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateSeparator = (ts: number) => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hari ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const groupedMessages: Array<{ date: string; messages: ChatMessage[] }> = [];
  let currentDateKey = "";

  messages.forEach((msg) => {
    const dateKey = new Date(msg.timestamp).toDateString();
    if (dateKey !== currentDateKey) {
      currentDateKey = dateKey;
      groupedMessages.push({ date: formatDateSeparator(msg.timestamp), messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div
      ref={containerRef}
      className="flex h-[600px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={partnerAvatarUrl}
              alt={partnerName}
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl object-cover ring-2 ring-primary-100"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                isPartnerOnline ? "bg-primary-500" : "bg-gray-300"
              }`}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{partnerName}</p>
            <p className="text-xs text-gray-500">
              {isPartnerOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          )}
          {partnerPhone && (
            <a
              href={getWaLink("Halo kak, saya lanjut konsultasi via WhatsApp ya.", partnerPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/30 px-5 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <MessageCircle className="h-12 w-12 opacity-30" />
            <p className="text-sm">Belum ada pesan. Mulai percakapan!</p>
          </div>
        )}

        {groupedMessages.map((group, groupIdx) => (
          <div key={group.date} className="space-y-3">
            <div className="flex justify-center">
              <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-500">
                {group.date}
              </span>
            </div>

            {group.messages.map((msg, msgIdx) => {
              const isOwn = msg.senderId === currentUserId;
              const isLastInGroup = msgIdx === group.messages.length - 1;
              const isLastMessage =
                groupIdx === groupedMessages.length - 1 && isLastInGroup;

              return (
                <div
                  key={msg.id}
                  ref={isLastMessage ? lastMessageRef : null}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isOwn
                        ? "rounded-br-md bg-primary-600 text-white"
                        : "rounded-bl-md bg-white text-gray-900 shadow-sm border border-gray-100"
                    }`}
                  >
                    {!isOwn && (
                      <p className="mb-1 text-xs font-semibold text-primary-600">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>
                    <div
                      className={`mt-2 flex items-center justify-end gap-1.5 text-[10px] ${
                        isOwn ? "text-primary-200" : "text-gray-400"
                      }`}
                    >
                      <span>{formatTime(msg.timestamp)}</span>
                      {isOwn && (
                        msg.isRead ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {isPartnerTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400" />
                <span className="ml-2 text-xs text-gray-500">sedang mengetik...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        {showEmoji && (
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-2xl bg-gray-50 p-3">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInput((prev) => prev + emoji);
                  inputRef.current?.focus();
                }}
                className="rounded-xl p-2 text-xl transition hover:bg-gray-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`rounded-2xl p-3 transition ${
              showEmoji
                ? "bg-primary-50 text-primary-600"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            }`}
          >
            <Smile className="h-5 w-5" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tulis pesan..."
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
