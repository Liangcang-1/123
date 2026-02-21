import { create } from 'zustand';

type AppState = {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedTool: 'chat',
  setSelectedTool: (tool) => set({ selectedTool: tool }),
}));
