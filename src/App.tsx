/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeftRight, BarChart2, Clock, Settings, ArrowUp, Copy, Share, ChevronLeft, MoreHorizontal, Check, Star } from 'lucide-react';

// Design Tokens matching the spec
const COLORS = {
  primary: '#2B5F3F', // Accent Green
  background: '#F5F2EC', // Warm off-white
  card: '#FFFFFF',
  text: '#1A1A1A', // Off-black
  textSecondary: '#666666',
  textSubdued: '#999999',
  error: '#8B3A3A', // Destructive red
  border: '#E5E0D8', // Soft border
  hover: '#E8E4DB'
};

const DUMMY_MODELS = [
  { id: 'openai', name: 'GPT-4', logo: '#9G8E99', latency: '842ms', text: "To explain quantum entanglement simply, imagine you have two magic dice. Even if you take one die to the moon and keep the other on Earth, when you roll one and get a 6, the other instantly turns into a 6 as well.\n\nThis happens because the particles are linked in such a way that the state of one cannot be described independently of the state of the other, regardless of the distance between them." },
  { id: 'anthropic', name: 'Claude 3.5', logo: '#C8775B', latency: '1.2s', text: "Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated or interact in ways such that the quantum state of each particle cannot be described independently.\n\nEinstein famously called this \"spooky action at a distance.\" When you measure the property of one particle, you immediately know the outcome of measuring the same property on its partner." },
  { id: 'gemini', name: 'Gemini 1.5 Pro', logo: '#6D8A9F', latency: '610ms', text: "Think of it like a pair of shoes. If you find the left shoe in one room, you automatically know the other shoe is a right shoe, no matter where it is.\n\nIn the quantum world, this connection is more active. Changing one particle's status affects the other. It's the cornerstone of quantum computing and future communication." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('compare');
  const [prompt, setPrompt] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  // Store a rating per model (1-5)
  const [ratings, setRatings] = useState<Record<string, number>>({});
  
  const handleRate = (modelId: string, score: number) => {
    setRatings(prev => {
      // Toggle off if same star selected
      if (prev[modelId] === score) {
        const copy = { ...prev };
        delete copy[modelId];
        return copy;
      }
      return { ...prev, [modelId]: score };
    });
  };

  const getBestModel = () => {
    let bestModel: string | null = null;
    let maxScore = 0;
    Object.entries(ratings).forEach(([id, score]) => {
      if (score > maxScore) {
        bestModel = id;
        maxScore = score;
      }
    });
    return maxScore > 0 ? bestModel : null;
  };

  const selectedBest = getBestModel();

  if (activeTab === 'compare' && !isComparing) {
    return (
      <div className="flex flex-col h-screen overflow-hidden font-sans" style={{ backgroundColor: COLORS.background, color: COLORS.text }}>
        {/* Top Bar */}
        <header className="h-[56px] flex items-center justify-between px-6 shrink-0">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-lg rounded" style={{ backgroundColor: COLORS.text, color: COLORS.background }}>
            |||
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('history')} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/5" title="History">
              <Clock className="w-6 h-6" strokeWidth={2} style={{ color: COLORS.text }} />
            </button>
            <button onClick={() => setActiveTab('settings')} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/5" title="Settings">
              <Settings className="w-6 h-6" strokeWidth={2} style={{ color: COLORS.text }} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-6 pb-24 pt-6">
          <div className="flex flex-col h-full justify-center">
            
            <div className="mb-4">
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase" style={{ color: COLORS.text, opacity: 0.4 }}>Ask</span>
            </div>
            
            <div className="py-2 border-y" style={{ borderColor: COLORS.border }}>
              <textarea 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[17px] resize-none min-h-[100px] py-2" 
                style={{ color: COLORS.text }}
                placeholder="What do you want to ask?"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="mt-4 mb-3">
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase" style={{ color: COLORS.text, opacity: 0.4 }}>Comparing</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {['GPT-4', 'Claude 3.5', 'Gemini 1.5 Pro'].map(model => (
                <div key={model} className="h-10 px-3 py-2 rounded-[8px] border bg-white flex items-center gap-2 whitespace-nowrap shrink-0" style={{ borderColor: COLORS.border }}>
                  <span className="text-[13px] font-medium">{model}</span>
                  <Check className="w-[14px] h-[14px]" style={{ color: COLORS.primary }} strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>
        </main>

        <div className="p-6 shrink-0 z-10 w-full max-w-2xl mx-auto pb-safe">
          <button 
            disabled={!prompt.trim()}
            onClick={() => {
              setIsComparing(true);
              setRatings({});
            }}
            className="w-full h-[56px] rounded-[10px] flex items-center justify-center transition-all duration-200 active:scale-98"
            style={{ 
              backgroundColor: prompt.trim() ? COLORS.primary : COLORS.border, 
              color: prompt.trim() ? '#FFF' : COLORS.textSubdued,
              opacity: prompt.trim() ? 1 : 0.4,
              fontSize: '17px',
              fontWeight: 600,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Compare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden" style={{ backgroundColor: COLORS.background, color: COLORS.text }}>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-[56px] flex items-center justify-between px-6 shrink-0 z-10 sticky top-0" style={{ backgroundColor: COLORS.background }}>
          <button onClick={() => { setIsComparing(false); setPrompt(''); }} className="w-11 h-11 flex items-center justify-start" title="Back">
            <ChevronLeft className="w-6 h-6" strokeWidth={2} style={{ color: COLORS.text }} />
          </button>
          <h2 className="text-[17px] font-medium text-center absolute left-0 right-0 pointer-events-none">Comparison</h2>
          <button className="w-11 h-11 flex items-center justify-end" title="More">
            <MoreHorizontal className="w-6 h-6" strokeWidth={2} style={{ color: COLORS.text }} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
          <div className="max-w-5xl mx-auto flex flex-col">
            
            {/* Prompt Card */}
            <div className="rounded-[12px] p-4 mb-6 border bg-white" style={{ borderColor: COLORS.border }}>
              <div className="mb-2">
                <span className="text-[11px] font-medium tracking-[0.08em] uppercase" style={{ color: COLORS.text, opacity: 0.4 }}>Your Question</span>
              </div>
              <p className="text-[17px] leading-[1.4] whitespace-pre-wrap">{prompt || "Explain quantum entanglement in simple terms for a 10 year old."}</p>
              <div className="mt-3">
                <span className="text-[12px] font-mono" style={{ color: COLORS.text, opacity: 0.5 }}>Mar 11, 2026 · 2:14 PM</span>
              </div>
            </div>

            {/* Response Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {DUMMY_MODELS.map((model) => {
                const isSelected = selectedBest === model.id;
                const currentScore = ratings[model.id] || 0;
                
                return (
                  <div key={model.id} 
                    className="flex flex-col bg-white rounded-[12px] overflow-hidden transition-all duration-200"
                    style={{ 
                      boxShadow: isSelected ? `0 0 0 1.5px ${COLORS.primary}` : `0 0 0 1px ${COLORS.border}`
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 h-[56px] border-b" style={{ borderColor: COLORS.border }}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: model.logo }} />
                        <span className="text-[15px] font-medium">{model.name}</span>
                      </div>
                      <span className="text-[12px] font-mono" style={{ color: COLORS.text, opacity: 0.6 }}>{model.latency}</span>
                    </div>
                    
                    {/* Body */}
                    <div className="flex-1 p-4 md:p-5">
                      <p className="text-[17px] leading-[1.45] whitespace-pre-wrap" style={{ opacity: 0.9 }}>
                        {model.text}
                      </p>
                    </div>
                    
                    {/* Footer / Rating */}
                    <div className="h-[64px] px-4 border-t flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                      <div className="flex gap-[8px]">
                        {[1, 2, 3, 4, 5].map((starIdx) => (
                          <button key={starIdx} onClick={() => handleRate(model.id, starIdx)} className="focus:outline-none transition-transform active:scale-95">
                            <Star 
                              className="w-[22px] h-[22px]" 
                              fill={starIdx <= currentScore ? COLORS.primary : "transparent"} 
                              color={starIdx <= currentScore ? COLORS.primary : COLORS.text}
                              style={{ opacity: starIdx <= currentScore ? 1 : 0.4 }}
                              strokeWidth={1.5}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[13px]" style={{ opacity: 0.5 }}>
                        {isSelected ? 'Selected best' : (currentScore > 0 ? `Rated ${currentScore} of 5` : 'Rate this answer')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>

        {/* Bottom Bar Fixed */}
        <div className="h-[60px] border-t bg-white flex items-center px-6 justify-between shrink-0 absolute bottom-0 left-0 right-0 z-20 pb-safe" style={{ borderColor: COLORS.border }}>
          <span className="text-[15px] font-medium" style={{ opacity: 0.6 }}>Saved</span>
          <button 
            onClick={() => { setIsComparing(false); setPrompt(''); }} 
            className="text-[15px] font-medium"
            style={{ color: COLORS.primary }}
          >
            Ask another
          </button>
        </div>

      </main>
    </div>
  );
}
