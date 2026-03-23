import { create } from 'zustand';

interface StreamInfoState {
  streamPath: string;
  streamInputOutputFile: string;
  setStreamPath: (path: string) => void;
  setStreamInputOutputFile: (content: string) => void;
  reset: () => void;
}

export const useStreamInfoStore = create<StreamInfoState>((set) => ({
  streamPath: '',
  streamInputOutputFile: '',
  setStreamPath: (streamPath) => set({ streamPath }),
  setStreamInputOutputFile: (streamInputOutputFile) => set({ streamInputOutputFile }),
  reset: () => set({ streamPath: '', streamInputOutputFile: '' }),
}));
