import React, { createContext, useState, useEffect } from 'react';
import { AppContextType, HandData } from './types';
import { Experience } from './components/Experience';
import { VisionController } from './components/VisionController';
import { UI } from './components/UI';

// Initialize context
export const AppContext = createContext<AppContextType>({
  handData: { state: 'FORMED', x: 0.5, y: 0.5 },
  setHandData: () => {},
  videoReady: false,
  setVideoReady: () => {},
  apiKey: null
});

const App: React.FC = () => {
  const [handData, setHandData] = useState<HandData>({ state: 'FORMED', x: 0.5, y: 0.5 });
  const [videoReady, setVideoReady] = useState(false);
  
  // Per instructions, use process.env.API_KEY
  const apiKey = process.env.API_KEY || ''; 

  return (
    <AppContext.Provider value={{ handData, setHandData, videoReady, setVideoReady, apiKey }}>
      <div className="w-full h-screen bg-slate-950 overflow-hidden select-none cursor-crosshair">
        
        {/* Background Gradient for that cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black pointer-events-none" />
        
        <Experience />
        <UI />
        
        {/* Logic Controller */}
        <VisionController />

        {!apiKey && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
                <div className="text-red-500 font-mono p-4 border border-red-500">
                    ERROR: API_KEY is missing from environment.
                </div>
            </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
