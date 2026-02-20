"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { getTemplates, Template } from "@/lib/templates";

// Animation variants with theme timing (200ms base)
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: "easeOut" }
};

// Transcript for typewriter effect
const transcriptLines = [
  { text: "Recording patient consultation...", type: "info" },
  { text: "Dr. Smith: Tell me about your symptoms.", type: "doctor" },
  { text: "Patient: I've been experiencing chronic sinusitis for the past 3 months...", type: "patient" },
  { text: "[Transcribing...]", type: "info" },
  { text: "Patient: ...nasal congestion, facial pressure, and loss of smell.", type: "patient" },
  { text: "Dr. Smith: How about pain?", type: "doctor" },
  { text: "Patient: Yes, especially around my cheeks and forehead.", type: "patient" },
  { text: "Generating clinical note...", type: "success" },
];

// Features data with theme colors
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Real-time Transcription",
    description: "Live speech-to-text with sub-second latency using Deepgram's nova-3-medical model.",
    color: "from-cyan-500 to-teal-500"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "HIPAA-Ready Security",
    description: "Enterprise-grade encryption with optional self-hosted deployment for full compliance.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "ENT-Specific Templates",
    description: "Pre-built templates for Sinus, Hearing Evaluation, Nasal Endoscopy, and Post-Op visits.",
    color: "from-sky-500 to-cyan-500"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: "EHR Integration",
    description: "Copy formatted notes directly to eClinicalWorks, Epic, Cerner, and more.",
    color: "from-teal-500 to-emerald-500"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI-Powered Notes",
    description: "GPT-4o generates structured clinical notes from transcripts with 95%+ accuracy.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Works Everywhere",
    description: "Browser-based with offline support. Use on desktop, tablet, or mobile.",
    color: "from-violet-500 to-purple-500"
  }
];

// Steps data
const steps = [
  {
    number: "01",
    title: "Select Template",
    description: "Choose from built-in ENT templates or create your own custom template.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    number: "02",
    title: "Start Recording",
    description: "Press record and speak naturally. Audio is transcribed in real-time.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    )
  },
  {
    number: "03",
    title: "Generate Note",
    description: "GPT-4o fills in the template using only what was said.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    number: "04",
    title: "Copy to EHR",
    description: "Review, edit if needed, and paste directly into your EHR.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
    )
  }
];

// Testimonials data
const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "ENT Physician",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    quote: "ENT Scribe has transformed my practice. I spend 70% less time on documentation.",
    rating: 5
  },
  {
    name: "Dr. Michael Torres",
    role: "Otolaryngologist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    quote: "The accuracy is remarkable. It understands medical terminology perfectly.",
    rating: 5
  },
  {
    name: "Dr. Jennifer Park",
    role: "Head & Neck Surgeon",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    quote: "Finally, an AI scribe that truly understands ENT. Saves me hours everyweek.",
    rating: 5
  }
];

// Stats data
const stats = [
  { value: "500+", label: "ENT Physicians" },
  { value: "70%", label: "Time Saved" },
  { value: "95%+", label: "Accuracy" },
  { value: "10K+", label: "Notes Generated" }
];

// ========== COMPONENTS ==========

// Julia Holographic AI Avatar
function JuliaAvatar() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto"
      style={{
        transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`,
      }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-teal-400/20 blur-3xl" />
      
      {/* Holographic rings */}
      <div className="holographic-ring w-64 h-64 -top-8 left-1/2 -translate-x-1/2" style={{ animationDuration: '15s' }}>
        <div className="absolute inset-2 rounded-full border border-cyan-400/20" />
      </div>
      <div className="holographic-ring-reverse w-72 h-72 -top-12 left-1/2 -translate-x-1/2" style={{ animationDuration: '12s' }}>
        <div className="absolute inset-4 rounded-full border border-teal-400/10" />
      </div>
      
      {/* Main avatar container */}
      <div className="holographic-avatar relative z-10">
        {/* Head */}
        <div className="relative mx-auto w-32 h-40">
          {/* Face glow */}
          <div className="absolute inset-0 rounded-[60%] bg-gradient-to-b from-cyan-400/10 to-transparent blur-xl" />
          
          {/* Face silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              {/* Head outline */}
              <defs>
                <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0891B2" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Hair/Head */}
              <ellipse cx="50" cy="35" rx="30" ry="32" fill="url(#faceGradient)" filter="url(#glow)" opacity="0.9" />
              
              {/* Face */}
              <ellipse cx="50" cy="45" rx="25" ry="28" fill="none" stroke="url(#faceGradient)" strokeWidth="1.5" opacity="0.7" />
              
              {/* Eyes */}
              <ellipse cx="40" cy="42" rx="5" ry="3" fill="#22D3EE" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="60" cy="42" rx="5" ry="3" fill="#22D3EE" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
              </ellipse>
              
              {/* Eye shine */}
              <circle cx="38" cy="41" r="1.5" fill="white" opacity="0.8" />
              <circle cx="58" cy="41" r="1.5" fill="white" opacity="0.8" />
              
              {/* Nose */}
              <path d="M50 48 L48 55 L52 55 Z" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.5" />
              
              {/* Mouth */}
              <path d="M43 62 Q50 68 57 62" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="d" values="M43 62 Q50 68 57 62;M43 62 Q50 65 57 62;M43 62 Q50 68 57 62" dur="4s" repeatCount="indefinite" />
              </path>
              
              {/* Data streams on face */}
              <line x1="25" y1="30" x2="25" y2="60" stroke="#22D3EE" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 4">
                <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2s" repeatCount="indefinite" />
              </line>
              <line x1="75" y1="30" x2="75" y2="60" stroke="#22D3EE" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 4">
                <animate attributeName="stroke-dashoffset" values="6;0;6" dur="2s" repeatCount="indefinite" />
              </line>
            </svg>
          </div>
          
          {/* Holographic scan line */}
          <div className="absolute inset-0 overflow-hidden rounded-[60%]">
            <div className="scan-line" style={{ animationDelay: '0s' }} />
          </div>
        </div>
        
        {/* Body/Shoulders */}
        <div className="relative -mt-4">
          <svg viewBox="0 0 120 60" className="w-40 h-auto mx-auto">
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path d="M20 60 Q30 30 60 25 Q90 30 100 60" fill="url(#bodyGradient)" opacity="0.5" />
            <path d="M25 60 Q35 35 60 30 Q85 35 95 60" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        
        {/* Data particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${20 + Math.random() * 60}%`,
              animation: `particle-float ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      
      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-400/30"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-cyan-400 font-mono">AI ACTIVE</span>
      </motion.div>
    </motion.div>
  );
}

// Live Transcript Terminal
function LiveTerminal() {
  const [displayedLines, setDisplayedLines] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    // Start showing lines sequentially
    const interval = setInterval(() => {
      setCurrentLine(prev => {
        if (prev < transcriptLines.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentLine >= 0) {
      const line = transcriptLines[currentLine];
      if (charIndex < line.text.length) {
        const timeout = setTimeout(() => {
          setCharIndex(prev => prev + 1);
        }, 30);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentLine, charIndex]);

  const getLineColor = (type: string) => {
    switch (type) {
      case 'doctor': return 'text-blue-400';
      case 'patient': return 'text-emerald-400';
      case 'success': return 'text-amber-400';
      case 'info': return 'text-cyan-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="terminal-window w-full max-w-lg mx-auto overflow-hidden"
    >
      {/* Terminal header */}
      <div className="terminal-header flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
        </div>
        <div className="text-xs text-slate-400 font-mono">Julia - Live Transcription</div>
        <div className="w-14" />
      </div>
      
      {/* Terminal body */}
      <div className="p-4 font-mono text-sm h-80 overflow-y-auto">
        {/* Status bar */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">LIVE</span>
          <span className="text-xs text-slate-500 ml-auto">00:02:34</span>
        </div>
        
        {/* Transcript lines */}
        <div className="space-y-2">
          {transcriptLines.map((line, index) => {
            if (index > currentLine) return null;
            
            const isCurrentLine = index === currentLine;
            const displayText = isCurrentLine 
              ? line.text.slice(0, charIndex) 
              : line.text;
            
            return (
              <div key={index} className={`${getLineColor(line.type)}`}>
                <span className="text-slate-500 mr-2">
                  {line.type === 'doctor' && '👨‍⚕️'}
                  {line.type === 'patient' && '🧑'}
                  {line.type === 'success' && '✓'}
                  {line.type === 'info' && '●'}
                </span>
                {displayText}
                {isCurrentLine && charIndex < line.text.length && (
                  <span className="typewriter-cursor" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Audio visualizer */}
        <div className="flex items-center justify-center gap-[2px] h-8 mt-4">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-cyan-400 rounded-full"
              animate={{
                height: ["8px", "20px", "12px", "24px", "8px"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Dark Mode Toggle
function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-14 h-8 rounded-full bg-neutral-200 dark:bg-slate-700 transition-colors duration-300"
    >
      <motion.div
        animate={{ x: isDark ? 26 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
      >
        {isDark ? (
          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}

// Navigation component
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll',handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'glass-card !py-3 !rounded-none !top-0 !rounded-b-xl' 
          : 'bg-transparent !py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-neutral-800 dark:text-white" style={{ fontFamily: 'Playfair Display, serif' }}>ENT Scribe</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <DarkModeToggle />
          <a href="#features" className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">How it Works</a>
          <a href="#testimonials" className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">Testimonials</a>
          <a 
            href="/record" 
            className="btn-shine px-5 py-2.5 gradient-primary text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Start Recording
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6 text-neutral-700 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-card-teal dark:bg-slate-800/90 mx-4 mt-2 rounded-2xl overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-neutral-600 dark:text-slate-300">Dark Mode</span>
                <DarkModeToggle />
              </div>
              <a href="#features" className="text-sm font-medium text-neutral-600 dark:text-slate-300 py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-neutral-600 dark:text-slate-300 py-2" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
              <a href="#testimonials" className="text-sm font-medium text-neutral-600 dark:text-slate-300 py-2" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
              <a href="/record" className="px-5 py-2.5 gradient-primary text-white text-sm font-semibold rounded-full text-center">
                Start Recording
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// Hero Section with Julia
function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background - Dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:block hidden" />
      {/* Light mode background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:hidden" />
      
      {/* Background blobs */}
      <motion.div 
        style={{ y: y1 }}
        className="blob w-[600px] h-[600px] bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full -top-40 -left-40 hidden dark:block"
      />
      <motion.div 
        style={{ y: y2 }}
        className="blob-slow w-[500px] h-[500px] bg-teal-300/20 dark:bg-teal-600/10 rounded-full -bottom-20 -right-20 hidden dark:block"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Top badge */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trusted by 500+ ENT Physicians
            </span>
          </motion.div>

          {/* Main content - Two columns */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Julia Avatar */}
            <motion.div
              variants={fadeInUp}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                {/* Label */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center">
                  <span className="text-cyan-400 font-mono text-sm">Meet Julia</span>
                  <div className="text-white/60 text-xs">Your AI Medical Scribe</div>
                </div>
                <JuliaAvatar />
              </div>
            </motion.div>

            {/* Right - Content & Terminal */}
            <div className="order-1 lg:order-2 space-y-8">
              <motion.div variants={fadeInUp}>
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 dark:text-white mb-6 text-balance leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Focus on Patients,<br />
                  <span className="gradient-text dark:gradient-cyan">Not Paperwork</span>
                </h1>

                <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-xl">
                  The AI-powered medical scribe that listens, transcribes, and generates 
                  clinical notes in real-time. Meet Julia — your intelligent documentation assistant.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <a 
                  href="/record?new=1"
                  className="group btn-shine px-8 py-4 gradient-primary text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-1 flex items-center gap-3"
                >
                  <span>Start Free Recording</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <button className="px-8 py-4 bg-white/10 dark:bg-slate-800/50 text-neutral-700 dark:text-white font-semibold rounded-full border border-neutral-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 flex items-center gap-3 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Demo</span>
                </button>
              </motion.div>

              {/* Live Terminal */}
              <LiveTerminal />
            </div>
          </div>

          {/* Stats */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-neutral-300 dark:border-slate-600 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-neutral-400 dark:bg-slate-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Features Section
function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-transparent dark:from-slate-900/50 dark:to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Everything You Need
          </h2>
          <p className="text-lg text-neutral-500 dark:text-slate-400 max-w-2xl mx-auto">
            Purpose-built for ENT practices with specialized features that streamline your workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card-teal dark:bg-slate-800/50 p-8 rounded-2xl group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-200`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-neutral-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-neutral-50/50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-50/30 to-transparent dark:via-slate-800/30" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Four Simple Steps
          </h2>
          <p className="text-lg text-neutral-500 dark:text-slate-400 max-w-2xl mx-auto">
            From recording to ready-to-use notes in minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cyan-200 to-teal-200 dark:from-cyan-800 dark:to-teal-800 -z-10" />
              )}
              
              <div className="glass-card dark:bg-slate-800/50 p-6 rounded-2xl h-full text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
                  {step.icon}
                </div>
                <div className="text-4xl font-bold text-cyan-200 dark:text-cyan-700 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{step.number}</div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-3">{step.title}</h3>
                <p className="text-neutral-500 dark:text-slate-400 leading-relaxed text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Loved by Physicians
          </h2>
          <p className="text-lg text-neutral-500 dark:text-slate-400 max-w-2xl mx-auto">
            See what ENT doctors are saying about ENT Scribe.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="glass-card-teal dark:bg-slate-800/50 p-10 rounded-3xl text-center"
            >
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-neutral-700 dark:text-slate-200 font-medium mb-8 leading-relaxed">
                "{testimonials[activeIndex].quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <img 
                  src={testimonials[activeIndex].image} 
                  alt={testimonials[activeIndex].name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-bold text-neutral-800 dark:text-white">{testimonials[activeIndex].name}</div>
                  <div className="text-sm text-neutral-500 dark:text-slate-400">{testimonials[activeIndex].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === activeIndex 
                    ? 'bg-cyan-500 w-8' 
                    : 'bg-neutral-300 dark:bg-slate-600 hover:bg-neutral-400 dark:hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="blob w-[600px] h-[600px] bg-gradient-to-r from-cyan-200/40 to-teal-200/40 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-full -top-40 left-1/2 -translate-x-1/2 hidden dark:block" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="glass-card-teal dark:bg-slate-800/50 p-12 md:p-16 rounded-3xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Transform Your Practice?
          </h2>
          <p className="text-lg text-neutral-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
            Join hundreds of ENT physicians who have reduced documentation time by 70%. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/record?new=1"
              className="btn-shine px-8 py-4 gradient-primary text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-1 flex items-center gap-3"
            >
              <span>Start Free Recording</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <span className="text-sm text-neutral-400 dark:text-slate-500">No credit card required</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Integrations", "Security"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Resources: ["Documentation", "API Reference", "Support", "Privacy"],
    Legal: ["Terms of Service", "Privacy Policy", "HIPAA Compliance", "Cookie Policy"]
  };

  return (
    <footer className="bg-neutral-900 dark:bg-slate-950 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>ENT Scribe</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The AI-powered medical scribe built specifically for ENT physicians. 
              Record, transcribe, and generate clinical notes in real-time.
            </p>
            <div className="flex gap-4">
              {["twitter", "linkedin", "github"].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors duration-200"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-cyan-400 transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2024 ENT Scribe. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SOC 2 Type II
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App Content
function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showNew = searchParams.get("new") === "1";

  const [templates] = useState<Template[]>(() => getTemplates());
  const [selectedId, setSelectedId] = useState<string>(() => getTemplates()[0]?.id ?? "");
  const [patientName, setPatientName] = useState("");
  const [patientDob, setPatientDob] = useState("");

  const handleStart = () => {
    if (!selectedId) return;
    const params = new URLSearchParams({ templateId: selectedId });
    if (patientName.trim()) params.set("name", patientName.trim());
    if (patientDob) params.set("dob", patientDob);
    router.push(`/record?${params.toString()}`);
  };

  if (showNew) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen py-20">
        <div className="w-full max-w-sm px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-white text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              New Interview
            </h1>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1.5">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name (optional)"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  className="w-full border border-neutral-200 dark:border-slate-600 rounded-xl px-4 py-3 text-neutral-900 dark:text-white bg-white dark:bg-slate-800 placeholder-neutral-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  className="w-full border border-neutral-200 dark:border-slate-600 rounded-xl px-4 py-3 text-neutral-900 dark:text-white bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1.5">
                  Note Type
                </label>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-600 rounded-xl px-4 py-3 pr-10 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer transition-all duration-200"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}{!t.isDefault ? " ★" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-5 pt-1">
                <button
                  onClick={() => router.push("/")}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={!selectedId}
                  className="flex items-center gap-2 gradient-primary hover:shadow-lg hover:shadow-cyan-500/25 disabled:bg-neutral-200 dark:disabled:bg-slate-700 disabled:text-neutral-400 dark:disabled:text-slate-500 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
                    <path
                      d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Start Recording
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
