"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  times: string[];
  instructions: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface MedicineCardProps {
  medicine: Medicine;
  index: number;
  openEditModal: (med: Medicine) => void;
  handleDeleteMedicine: (id: number) => void;
}

export function MedicineCard({ medicine: med, index: i, openEditModal, handleDeleteMedicine }: MedicineCardProps) {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      key={med.id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1 }}
      whileHover={{ scale: 1.03, rotate: 1 }}
      className="group"
    >
      <div className="glass-enhanced p-8 rounded-3xl border border-white/10 hover:border-orange-500/30 transition-all duration-300 backdrop-blur-xl relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{med.name}</h3>
              <p className="text-lg font-semibold text-orange-600">{med.dosage}</p>
            </div>
            <span
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                med.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-500/20 text-gray-400"
              )}
            >
              {med.status}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-sm text-foreground/60 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Reminder Times
            </p>
            <div className="flex flex-wrap gap-2">
              {med.times.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-orange-500/10 text-orange-400 text-sm rounded-full font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {med.instructions && (
            <p className="text-sm text-foreground/70 italic mb-6">"{med.instructions}"</p>
          )}

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 glass-button bg-white/5 hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" /> View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 glass-button bg-white/5 hover:bg-white/10"
              onClick={() => openEditModal(med)}
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 glass-button bg-white/5 hover:bg-red-500/20 text-red-400"
              onClick={() => handleDeleteMedicine(med.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
