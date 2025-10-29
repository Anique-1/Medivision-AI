"use client";

import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, MessageCircle, Plus, Sparkles, Clock } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { ChatMessageDisplay } from "@/components/ChatMessageDisplay";

interface ChatMessage {
  id: number;
  message: string;
  response: string;
  message_type: "text" | "image" | "audio";
  created_at: string;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
  timestamp: Date;
  message_type: "text" | "image" | "audio";
  imageUrl?: string;
}

export default function ChatPage() {
  // === ALL HOOKS AT TOP LEVEL (Fixed Order) ===
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const { toast } = useToast();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ id: number; title: string; date: string }[]>([]);

  // === NO MORE useState INSIDE useEffect ===

  /* ---------- Mouse Trail & Bubbles ---------- */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (mouseRef.current) {
        mouseRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const container = bubbleRef.current;
    if (!container) return;

    const create = () => {
      const b = document.createElement("div");
      const size = Math.random() * 120 + 40;
      const dur = Math.random() * 25 + 20;
      const delay = Math.random() * 10;
      const depth = Math.random() * 0.9 + 0.1;

      b.className = "bubble-effect absolute rounded-full pointer-events-none";
      b.style.width = b.style.height = `${size}px`;
      b.style.left = `${Math.random() * 100}%`;
      b.style.bottom = `-200px`;
      b.style.background = `radial-gradient(circle at 30% 30%,
        rgba(251,146,60,${depth * 0.8}) ${depth * 100}%,
        rgba(245,158,11,${depth * 0.4}) ${depth * 50}%,
        transparent 100%)`;
      b.style.filter = `blur(${Math.max(size / 30, 2)}px) saturate(1.2)`;
      b.style.transform = `translateZ(0) scale(${depth})`;
      b.style.animation = `float3d ${dur}s ease-in-out ${delay}s infinite alternate`;
      b.style.boxShadow = `0 0 ${size / 4}px rgba(251,146,60,${depth * 0.3})`;

      container.appendChild(b);
      setTimeout(() => b.remove(), (dur + delay) * 1000);
    };

    const iv = setInterval(create, 400);
    return () => clearInterval(iv);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------- Load Chat History ---------- */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const history: ChatMessage[] = await fetchWithAuth("/chat/history");
        const formatted: DisplayMessage[] = history.reverse().flatMap((chat) => {
          const userMsg: DisplayMessage = {
            id: `${chat.id}-user`,
            role: "user",
            content: chat.message,
            timestamp: new Date(chat.created_at),
            message_type: chat.message_type,
          };
          const assistantMsg: DisplayMessage = {
            id: `${chat.id}-assistant`,
            role: "assistant",
            content: formatAssistantResponse(chat.response),
            timestamp: new Date(chat.created_at),
            message_type: chat.message_type,
          };
          return [userMsg, assistantMsg];
        });

        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Hello! I'm your AI Medical Assistant. Ask me anything about your health, medicines, or upload an image for analysis.</span>
              </div>
            ),
            timestamp: new Date(),
            message_type: "text",
          },
          ...formatted,
        ]);

        // Mock sidebar history
        setChatHistory([
          { id: 1, title: "Medicine Schedule", date: "Oct 28" },
          { id: 2, title: "Blood Test Results", date: "Oct 25" },
          { id: 3, title: "Allergy Question", date: "Oct 20" },
        ]);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load chat.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  /* ---------- Send Message ---------- */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      message_type: "text",
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetchWithAuth("/chat/message", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });

      const assistantMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatAssistantResponse(res.response),
        timestamp: new Date(),
        message_type: "text",
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to send.", variant: "destructive" });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't respond. Try again.",
        timestamp: new Date(),
        message_type: "text",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Image Upload ---------- */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const userMsg: DisplayMessage = {
        id: Date.now().toString(),
        role: "user",
        content: (
          <div className="space-y-2">
            <img src={reader.result as string} alt="Uploaded" className="max-w-xs rounded-lg shadow-lg" />
            <p className="text-xs text-foreground/60">{file.name}</p>
          </div>
        ),
        timestamp: new Date(),
        message_type: "image",
        imageUrl: reader.result as string,
      };
      setMessages(prev => [...prev, userMsg]);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (input.trim()) formData.append("message", input.trim());

    try {
      const res = await fetchWithAuth("/chat/image", { method: "POST", body: formData });
      const assistantMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatAssistantResponse(res.response),
        timestamp: new Date(),
        message_type: "text",
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      toast({ title: "Error", description: "Image analysis failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>New chat started! How can I help?</span>
          </div>
        ),
        timestamp: new Date(),
        message_type: "text",
      },
    ]);
  };

  /* ---------- Markdown Formatter ---------- */
  const formatAssistantResponse = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeLines: string[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith('```')) {
        if (inCode) {
          elements.push(
            <pre key={i} className="bg-muted/50 p-4 rounded-xl overflow-x-auto text-sm font-mono my-3 border border-white/10">
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          inCode = false;
          codeLines = [];
        } else {
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-5 mb-3">{line.slice(3)}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={i} className="ml-6 list-disc text-sm">{line.slice(2)}</li>);
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(<li key={i} className="ml-6 list-decimal text-sm">{line.replace(/^\d+\.\s/, '')}</li>);
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(<p key={i} className="text-sm leading-relaxed my-1.5">{line}</p>);
      }
    });

    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 dark:from-slate-900 dark:via-violet-950 dark:to-teal-950">
        {/* Mouse Trail */}
        <div
          ref={mouseRef}
          className="fixed w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-teal-400 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-500"
        />

        {/* Bubbles */}
        <div ref={bubbleRef} className="fixed inset-0 -z-10" />

        {/* Wave */}
        <div className="absolute inset-0 -z-10">
          <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="url(#wave-gradient)"
              fillOpacity="0.08"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
              animate={{
                d: [
                  "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z",
                  "M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,149C672,170,768,181,864,170C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L0,320Z",
                ],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <section className="relative py-20">
          <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-gradient-to-t from-orange-100/30 via-amber-50/20 to-teal-50/10" />

          <div className="max-w-7xl mx-auto h-screen flex flex-col px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                  AI Medical Assistant
                </span>
              </h1>
              <p className="mt-3 text-lg text-foreground/70">Ask anything. Upload images. Get instant insights.</p>
            </motion.div>

            <div className="flex-1 glass-enhanced rounded-3xl border border-white/20 backdrop-blur-xl shadow-3xl overflow-hidden flex">
              {/* Sidebar */}
              <div className="hidden lg:block w-80 glass-enhanced border-r border-white/10 p-6 space-y-4">
                <Button
                  onClick={handleNewChat}
                  className="w-full h-14 glass-button bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" /> New Chat
                </Button>
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 glass-enhanced rounded-xl border border-white/10 cursor-pointer hover:border-orange-500/30 transition-all"
                    >
                      <h4 className="font-medium text-foreground">{chat.title}</h4>
                      <p className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {chat.date}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((msg, i) => (
                    <ChatMessageDisplay key={msg.id} msg={msg} index={i} />
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="glass-enhanced p-5 rounded-2xl border border-white/10">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="glass-button hover:bg-white/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="glass-button hover:bg-white/10">
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about medicines, symptoms, or upload an image..."
                      className="flex-1 glass-input bg-white/5 border-white/20 h-14 text-lg"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className="h-14 w-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Mobile New Chat FAB */}
            <Button
              onClick={handleNewChat}
              size="icon"
              className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-2xl lg:hidden"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* CSS */}
      <style jsx>{`
        .bubble-effect { animation: float3d 25s ease-in-out infinite alternate; }
        @keyframes float3d {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(150px) rotate(720deg) scale(0.8); opacity: 0; }
        }
        .glass-enhanced {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
        }
        .glass-input {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .glass-button {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        .glass-button:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .dark .glass-enhanced,
        .dark .glass-button,
        .dark .glass-input {
          background: rgba(15,23,42,0.6);
          border-color: rgba(255,255,255,0.05);
        }
      `}</style>
    </>
  );
}
