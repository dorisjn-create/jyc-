import React, { useContext, useState } from 'react';
import { AppContext } from '../App';

export const UI: React.FC = () => {
  const { handData, videoReady, apiKey } = useContext(AppContext);
  
  if (!apiKey) {
      return <ApiKeySelection />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-serif text-yellow-400 tracking-wider uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] border-b-2 border-yellow-600 pb-2 mb-2">
            The Grand Tree
        </h1>
        <p className="text-emerald-200 font-light tracking-[0.3em] text-sm md:text-base">
            LUXURY • INTERACTIVE • GOLD
        </p>
      </header>

      {/* Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        {!videoReady && (
            <div className="text-yellow-200 animate-pulse">Initializing Camera & AI...</div>
        )}
        {videoReady && (
             <div className={`transition-opacity duration-500 ${handData.state === 'CHAOS' ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-8xl font-serif text-red-500 font-bold mix-blend-overlay">UNLEASHED</h2>
             </div>
        )}
      </div>

      {/* Instructions */}
      <footer className="text-center space-y-2">
        <div className="bg-black/40 backdrop-blur-md border border-yellow-500/30 p-4 inline-block rounded-lg shadow-xl">
             <div className="flex gap-8 text-yellow-100 font-serif">
                 <div className="flex flex-col items-center">
                     <span className="text-2xl mb-1">✊</span>
                     <span className="text-xs uppercase tracking-widest text-yellow-500">Form Tree</span>
                 </div>
                 <div className="flex flex-col items-center">
                     <span className="text-2xl mb-1">🖐️</span>
                     <span className="text-xs uppercase tracking-widest text-yellow-500">Unleash Chaos</span>
                 </div>
                 <div className="flex flex-col items-center">
                     <span className="text-2xl mb-1">👋</span>
                     <span className="text-xs uppercase tracking-widest text-yellow-500">Move to Pan</span>
                 </div>
             </div>
        </div>
      </footer>
    </div>
  );
};

const ApiKeySelection = () => {
    // Helper to select API key as per requirements
    // Since prompt says users must select key for *Veo*, but this is just custom vision, we follow the pattern
    // of checking window.aistudio or providing a simplified entry for this demo.
    // However, strict instruction says: "If the user provides a full model name... use it".
    // It also says regarding "API Key": "Must be obtained exclusively from process.env.API_KEY".
    // BUT the "API Key Selection" section for Veo says "Users must select their own paid API key".
    // Given this is a custom Vision app, I will adhere to the "process.env.API_KEY" rule for simplicity unless standard "window.aistudio" is available.
    // Wait, the runtime environment might not have .env in a generated web preview. 
    // To make this functional in a copy-paste scenario, I will assume the user has the key or uses the window.aistudio flow if available, 
    // otherwise I will just render a dummy screen if env is missing, but better to follow strict rule:
    // "The API key must be obtained exclusively from the environment variable process.env.API_KEY"
    // So I will assume it is there.
    // However, to be helpful, I'll check if it exists in context.
    
    return null; // The logic handles this in App.tsx via Context initialization from env.
};
