export type InteractionState = 'FORMED' | 'CHAOS';

export interface HandData {
  state: InteractionState;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
}

export interface AppContextType {
  handData: HandData;
  setHandData: (data: HandData) => void;
  videoReady: boolean;
  setVideoReady: (ready: boolean) => void;
  apiKey: string | null;
}
