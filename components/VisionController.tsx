import React, { useEffect, useRef, useContext, useState } from 'react';
import { AppContext } from '../App';
import { initGemini, analyzeFrame } from '../services/geminiService';

export const VisionController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setHandData, setVideoReady, apiKey } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    initGemini(apiKey);
    
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 320, height: 240, frameRate: 15 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setVideoReady(true);
          };
        }
      } catch (err) {
        console.error("Camera access denied or failed", err);
      }
    };
    startCamera();
  }, [apiKey, setVideoReady]);

  // Processing Loop
  useEffect(() => {
    if (!apiKey) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) return;

      setIsProcessing(true);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        const result = await analyzeFrame(base64);
        
        if (result) {
            setHandData(result);
        }
      }
      setIsProcessing(false);
    }, 200); // 5 FPS check is enough for state toggling, smooth lerp handles the rest

    return () => clearInterval(interval);
  }, [isProcessing, apiKey, setHandData]);

  return (
    <div className="fixed bottom-4 left-4 z-50 opacity-80 pointer-events-none">
      <video ref={videoRef} className="w-32 h-24 rounded-lg border-2 border-yellow-500 transform scale-x-[-1]" playsInline muted />
      <canvas ref={canvasRef} width="320" height="240" className="hidden" />
      <div className="text-[10px] text-yellow-400 mt-1 font-mono uppercase bg-black/50 p-1 rounded">
        System: {isProcessing ? 'Thinking...' : 'Ready'}
      </div>
    </div>
  );
};
