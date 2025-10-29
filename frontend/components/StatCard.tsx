"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string; // Allow value to be string or number
  Icon: React.ElementType;
  index: number;
}

export function StatCard({ label, value, Icon, index }: StatCardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, rotate: 1 }}
      className="group"
    >
      <Card className="glass-enhanced p-6 h-full border border-white/10 hover:border-orange-500/30 transition-all duration-300 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
            <Icon className="w-7 h-7" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="mt-4 text-sm text-foreground/60">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </Card>
    </motion.div>
  );
}
