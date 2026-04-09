import React, { useState } from 'react';
import { Sparkles, History, Layers, Settings2, Download, Share2, Maximize2, AlertCircle } from 'lucide-react';

const Lab = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); // Stores the image URL
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5555/api/v1/sketch', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image. Check backend/API limits.');
      }

      // 1. Receive the response as a Blob (Binary Large Object)
      const imageBlob = await response.blob();
      
      // 2. Create a local URL for the blob so the <img> tag can display it
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to synthesize image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0B0D0F] text-[#E0E0E0] p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 h-full">
        
        {/* LEFT SECTION: INPUT PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl p-6 flex flex-col h-full shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-[#1F2227] pb-4">
              <div className="p-2 bg-[#0078D4]/10 rounded-lg">
                <Settings2 size={20} className="text-[#0078D4]" />
              </div>
              <h2 className="font-semibold tracking-wide uppercase">Composite Parameters</h2>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-mono text-[#555] uppercase tracking-widest">Witness Description</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Male, mid-40s, sharp jawline, deep-set eyes..."
                  className="w-full h-48 bg-black/30 border border-[#1F2227] focus:border-[#0078D4]/50 rounded-xl p-4 text-sm leading-relaxed outline-none transition-all resize-none placeholder:text-[#333]"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>

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
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: OUTPUT PANEL */}
        <div className="lg:col-span-7">
          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl h-full flex flex-col shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1F2227] flex justify-between items-center bg-[#121417]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-xs font-mono text-[#0078D4]">
                  <span className={`w-2 h-2 bg-[#0078D4] rounded-full ${isGenerating ? 'animate-ping' : ''}`} />
                  {isGenerating ? 'GENERATING...' : 'LIVE_RENDER_VIEW'}
                </span>
              </div>
              <div className="flex gap-2">
                {generatedImage && (
                  <a href={generatedImage} download="forensic-sketch.png" className="p-2 hover:bg-[#1F2227] rounded-lg text-[#888] transition-colors">
                    <Download size={18} />
                  </a>
                )}
                <button className="p-2 hover:bg-[#1F2227] rounded-lg text-[#888] transition-colors"><Maximize2 size={18} /></button>
              </div>
            </div>

            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 z-20">
                  <div className="w-64 h-1 bg-[#1F2227] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0078D4] animate-pulse w-full" />
                  </div>
                  <span className="text-[#555] font-mono text-xs animate-pulse">RECONSTRUCTING FACIAL MESH...</span>
                </div>
              ) : generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="AI Generated Sketch"
                  className="max-h-full w-full object-contain animate-in fade-in duration-700"
                />
              ) : (
                <div className="text-[#333] font-mono text-sm">AWAITING INPUT PARAMETERS...</div>
              )}

              {/* Decorative Corner Brackets */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-[#0078D4]/30" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-[#0078D4]/30" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-[#0078D4]/30" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-[#0078D4]/30" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Lab;