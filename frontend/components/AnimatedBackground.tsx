import React from 'react';
import { Sparkles } from 'lucide-react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary-400/20 dark:bg-primary-900/20 rounded-full blur-[100px] animate-wander-1 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-5%] w-[45vw] h-[45vw] bg-accent-400/20 dark:bg-accent-900/20 rounded-full blur-[90px] animate-wander-2 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] animate-wander-3 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-white rounded-full blur-[4px] shadow-[0_0_30px_15px_rgba(255,255,255,0.4)] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-accent-300 rounded-full blur-[2px] shadow-[0_0_20px_10px_rgba(236,72,153,0.6)] animate-float delay-75"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-primary-300 rounded-full blur-[2px] shadow-[0_0_25px_8px_rgba(139,92,246,0.5)] animate-pulse delay-150"></div>
        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-blue-300 rounded-full blur-[3px] shadow-[0_0_20px_10px_rgba(59,130,246,0.5)] animate-float delay-300"></div>
        <div className="absolute top-[15%] right-[20%] opacity-60 animate-pulse-glow delay-200"><Sparkles size={24} className="text-yellow-200" /></div>
        <div className="absolute top-[60%] left-[10%] opacity-40 animate-pulse-glow delay-500"><Sparkles size={18} className="text-primary-200" /></div>
        <div className="absolute bottom-[20%] right-[15%] opacity-50 animate-pulse-glow delay-1000"><Sparkles size={30} className="text-accent-200" /></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0zMCAzMEwzMSAzMEwzMSAzMUwzMCAzMUwzMCAzMHoiIGZpbGw9InJnYmEoMjAwLDIwMCwyNTUsMC4wNSkiLz4KPC9zdmc+')] opacity-30"></div>
    </div>
  );
};