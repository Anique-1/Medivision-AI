"use client";

import Link from "next/link";
import { Github, Linkedin, Twitter, Heart, Brain, Stethoscope, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    Product: [
      { href: "/models", label: "AI Models", icon: <Brain className="w-4 h-4" /> },
      { href: "/pricing", label: "Pricing", icon: <Sparkles className="w-4 h-4" /> },
      { href: "/docs", label: "Documentation", icon: <Stethoscope className="w-4 h-4" /> },
    ],
    Company: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
    Legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  };

  const socialLinks = [
    { href: "https://www.linkedin.com/in/muhammad-anique-300828266/", icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
    { href: "https://github.com/Anique-1", icon: <Github className="w-5 h-5" />, label: "GitHub" },
  ];

  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Background Gradient + Glass */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-50/50 via-amber-50/30 to-transparent dark:from-slate-950/80 dark:via-violet-950/50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="relative w-12 h-12 rounded-2xl p-0.5"
              >
                <Image
                  src="/favicon_1.png"
                  alt="MediVision AI Logo"
                  width={48}
                  height={48}
                  className="rounded-2xl"
                />
              </motion.div>
              <span className="font-bold text-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-teal-600 bg-clip-text text-transparent">
                MediVision AI
              </span>
            </Link>

            <p className="text-foreground/70 max-w-xs leading-relaxed">
              Pakistan's first <strong className="text-orange-600">Agentic Health AI</strong> — autonomously managing medicines, doctors, and diagnostics 24/7.
            </p>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links], colIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: colIdx * 0.1 }}
              className="space-y-5"
            >
              <h3 className="font-bold text-lg bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, idx) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-foreground/60 hover:text-foreground transition-all duration-300"
                    >
                      {"icon" in link && link.icon && (
                        <span className="text-orange-500 group-hover:scale-110 transition">
                          {link.icon}
                        </span>
                      )}
                      <span className="relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-teal-500 group-hover:w-full transition-all duration-300" />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-5"
          >
            <h3 className="font-bold text-lg bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
              Connect With Us
            </h3>
            <p className="text-sm text-foreground/60">
              Follow us for AI health updates, tips, and breakthroughs.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group relative w-12 h-12 rounded-2xl glass-footer backdrop-blur-xl flex items-center justify-center text-foreground/60 hover:text-foreground transition-all"
                  aria-label={social.label}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/20 to-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-foreground/60 flex items-center gap-2">
            © {currentYear} <span className="text-orange-600 font-semibold">MediVision AI</span> by TechNova. 
            <span className="hidden sm:inline">All rights reserved.</span>
          </p>

          <div className="flex gap-6 text-sm">
            {footerLinks.Legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/60 hover:text-foreground transition relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-teal-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .glass-footer {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .dark .glass-footer {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Allow bubbles to show through */
        footer {
          position: relative;
          z-index: 10;
        }
      `}</style>
    </footer>
  );
}
