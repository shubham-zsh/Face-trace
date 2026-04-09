import React, { useState } from 'react';
import { Sparkles, History, Layers, Settings2, Download, Share2, Maximize2 } from 'lucide-react';

const Lab = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0B0D0F] text-[#E0E0E0] p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 h-full">
        
        {/* LEFT SECTION: INPUT PANEL (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl p-6 flex flex-col h-full shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-[#1F2227] pb-4">
              <div className="p-2 bg-[#0078D4]/10 rounded-lg">
                <Settings2 size={20} className="text-[#0078D4]" />
              </div>
              <h2 className="font-semibold tracking-wide">COMPOSITE PARAMETERS</h2>
            </div>

            <div className="flex-1 space-y-6">
              {/* Description Input */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-[#555] uppercase tracking-widest">Witness Description</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Male, mid-40s, sharp jawline, deep-set eyes, receding hairline with slight stubble..."
                  className="w-full h-48 bg-black/30 border border-[#1F2227] focus:border-[#0078D4]/50 rounded-xl p-4 text-sm leading-relaxed outline-none transition-all resize-none placeholder:text-[#333]"
                />
              </div>

              {/* Quick Tags/Presets */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-[#555] uppercase tracking-widest">Enhancement Layers</label>
                <div className="flex flex-wrap gap-2">
                  {['High Contrast', 'Pencil Sketch', 'Photorealistic', 'Aging Filter'].map((tag) => (
                    <button key={tag} className="px-3 py-1.5 rounded-md bg-[#1F2227] text-xs text-[#888] hover:text-[#0078D4] border border-transparent hover:border-[#0078D4]/30 transition-all">
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                  isGenerating 
                  ? 'bg-[#1F2227] text-[#555] cursor-not-allowed' 
                  : 'bg-[#0078D4] hover:bg-[#0086ED] text-white shadow-[0_10px_20px_-5px_rgba(0,120,212,0.3)]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Synthesizing Nodes...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Forensic Sketch
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-[#444] mt-4 font-mono uppercase tracking-tighter">
                Hardware Acceleration: <span className="text-green-900">Active</span> | Neural Engine: v2.0.4
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: OUTPUT PANEL (7 Columns) */}
        <div className="lg:col-span-7">
          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl h-full flex flex-col shadow-xl overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-[#1F2227] flex justify-between items-center bg-[#121417]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-xs font-mono text-[#0078D4]">
                  <span className="w-2 h-2 bg-[#0078D4] rounded-full animate-pulse" />
                  LIVE_RENDER_VIEW
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#1F2227] rounded-lg text-[#888] transition-colors"><Download size={18} /></button>
                <button className="p-2 hover:bg-[#1F2227] rounded-lg text-[#888] transition-colors"><Share2 size={18} /></button>
                <button className="p-2 hover:bg-[#1F2227] rounded-lg text-[#888] transition-colors"><Maximize2 size={18} /></button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-black flex items-center justify-center group">
              {/* UI Overlay on Image */}
              <div className="absolute top-4 left-4 z-10 space-y-1 pointer-events-none">
                <div className="text-[10px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded">X: 104.22 Y: 882.19</div>
                <div className="text-[10px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded">MATCH_PROBABILITY: 0.00%</div>
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-64 h-1 bg-[#1F2227] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0078D4] animate-[scan_2s_infinite]" style={{ width: '40%' }} />
                  </div>
                  <span className="text-[#555] font-mono text-xs animate-pulse">RECONSTRUCTING FACIAL MESH...</span>
                </div>
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200" 
                  alt="AI Generated Sketch"
                  className="max-h-full w-full object-contain grayscale opacity-80"
                />
              )}

              {/* Decorative Corner Brackets */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-[#0078D4]/30" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-[#0078D4]/30" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-[#0078D4]/30" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-[#0078D4]/30" />
            </div>

            {/* History Bar */}
            <div className="p-4 border-t border-[#1F2227] bg-[#0B0D0F]/50 flex gap-4 overflow-x-auto">
              <div className="min-w-[60px] h-16 bg-[#1F2227] rounded-lg border border-[#0078D4]/50 flex items-center justify-center text-[#0078D4]">
                <History size={20} />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[60px] h-16 bg-[#1F2227] rounded-lg border border-transparent hover:border-[#888] transition-all cursor-pointer overflow-hidden grayscale opacity-40 hover:opacity-100">
                   <img src={`https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&index=${i}`} alt="history" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Lab;