"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MessageCircle, X, Send, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { sanctumFetch, resolveApiUrl } from "@/lib/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Saya Nadia ✨ Asisten Gizi AI Anda. Ada yang bisa saya bantu hari ini?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await sanctumFetch(resolveApiUrl("/chatbot/message"), {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("Failed to connect");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.text;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            } catch (e) {
              console.error("Error parsing stream", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan. Coba lagi nanti ya." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    "🍽️ Saran makan siang",
    "📊 Cek progres saya",
    "💧 Tips minum air"
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-xl flex items-center justify-center p-0 group"
        >
          <MessageCircle className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            className="fixed bottom-24 right-6 z-50 w-[450px] min-w-[320px] max-w-[95vw] h-[700px] min-h-[400px] max-h-[85vh] resize overflow-hidden rounded-xl bg-white"
          >
            <Card className="flex flex-col h-full shadow-2xl overflow-hidden border-0">
              {/* Header */}
              <div 
                className="p-4 bg-green-600 text-white flex items-center justify-between cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
                style={{ touchAction: "none" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Hallo Panggil Saja aku Nadia ✨</h3>
                    <p className="text-[10px] opacity-80">Asisten Gizi Diet Care• Online 24/7</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-green-600 text-white rounded-tr-none" 
                        : "bg-white text-gray-800 shadow-sm border rounded-tl-none"
                    }`}>
                      {msg.content}
                      {msg.role === "assistant" && msg.content && (
                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 justify-end">
                          <button className="text-gray-400 hover:text-green-600"><Copy className="w-3 h-3" /></button>
                          <button className="text-gray-400 hover:text-green-600"><ThumbsUp className="w-3 h-3" /></button>
                          <button className="text-gray-400 hover:text-red-600"><ThumbsDown className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Replies */}
              <div className="p-2 bg-gray-50 border-t flex gap-2 overflow-x-auto scrollbar-hide">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(reply)}
                    className="shrink-0 text-xs bg-white border border-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tanya Nadia..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 text-gray-900 bg-white focus-visible:ring-green-600"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={isTyping}
                    className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 p-0 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Nadia adalah AI. Untuk konsultasi medis mendalam, chat dengan ahli gizi Anda.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
