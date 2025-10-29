"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
  timestamp: Date;
  message_type: "text" | "image" | "audio";
  imageUrl?: string;
}

interface ChatMessageDisplayProps {
  msg: DisplayMessage;
  index: number;
}

export function ChatMessageDisplay({ msg, index: i }: ChatMessageDisplayProps) {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      key={msg.id}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.05 }}
      className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-2xl p-5 rounded-2xl shadow-lg",
          msg.role === "user"
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none"
            : "glass-enhanced border border-white/10 rounded-bl-none"
        )}
      >
        {msg.role === "assistant" && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">AI Assistant</span>
          </div>
        )}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {msg.content}
        </div>
        <p className={cn("text-xs mt-3", msg.role === "user" ? "text-white/70" : "text-foreground/50")}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}
