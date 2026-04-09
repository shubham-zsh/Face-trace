import React from 'react';
import { Mic, Zap, Search, ScanFace } from 'lucide-react';
import { Link } from 'react-router-dom';
import Lab from './Lab';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] bg-[#121417] overflow-hidden flex items-center">
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0078D4 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column: Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078D4]/10 border border-[#0078D4]/30 text-[#0078D4] text-sm font-medium">
            <Zap size={14} />
            <span>Next-Gen Forensic AI v2.0</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-[#E0E0E0] leading-tight">
            Witness Memory to <br />
            <span className="text-[#0078D4]">Precise Evidence</span>
          </h1>

          <p className="text-lg text-[#888] max-w-lg leading-relaxed">
            FaceTrace bridges the gap between verbal descriptions and high-fidelity facial composites. 
            Empower forensic artists with real-time generative sketching and layered feature control.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to='/lab' element={<Lab/>}>
            <button className="px-8 py-4 bg-[#0078D4] hover:bg-[#0086ED] text-white rounded-xl font-semibold transition-all shadow-[0_10px_20px_-5px_rgba(0,120,212,0.3)] flex items-center justify-center gap-2">
              <ScanFace size={20} />
              Start New Sketch
            </button>
           </Link>
          </div>

          {/* Quick Stats */}
          <div className="pt-8 border-t border-[#1F2227] flex gap-10">
            <div>
              <p className="text-2xl font-bold text-[#E0E0E0]">98%</p>
              <p className="text-sm text-[#555]">Feature Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E0E0E0]">12s</p>
              <p className="text-sm text-[#555]">Generation Time</p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview */}
        <div className="relative">
          {/* Glass Card Interface */}
          <div className="relative z-20 bg-[#1F2227]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs text-[#555] font-mono tracking-tighter italic">PROCESSING_FACIAL_NODES...</span>
            </div>

            {/* Mock Sketch Window */}
            <div className="aspect-square bg-black/40 rounded-lg flex items-center justify-center border border-[#1F2227] relative group overflow-hidden">
                {/* Simulated AI Scan Line */}
                <div className="absolute inset-0 w-full h-1 bg-[#0078D4]/40 shadow-[0_0_15px_#0078D4] animate-scan z-30"></div>
                
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" 
                  alt="Forensic Sketch AI Example"
                  className="w-full h-full object-cover grayscale opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Voice Input Indicator Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-[#0078D4]/50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0078D4] animate-pulse" />
                  <p className="text-xs text-[#E0E0E0] font-mono">"Subject has deep-set eyes and a square jaw..."</p>
                  <Mic size={14} className="text-[#0078D4] ml-auto" />
                </div>
            </div>
          </div>

          {/* Decorative Background Glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0078D4]/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#0078D4]/10 rounded-full blur-[100px]" />
        </div>

      </div>
    </section>
  );
};

export default Hero;