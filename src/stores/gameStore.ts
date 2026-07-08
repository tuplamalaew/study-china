import { create } from 'zustand';


interface GameStoreState {
  currentExp: number;
  sectPoints: number;
  raidKeys: number;
  playerHearts: number;
  
  setExp: (exp: number) => void;
  setSectPoints: (points: number) => void;
  setRaidKeys: (keys: number) => void;
  setPlayerHearts: (hearts: number) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  currentExp: 0,
  sectPoints: 0,
  raidKeys: 0,
  playerHearts: 5,
  
  setExp: (exp) => set({ currentExp: exp }),
  setSectPoints: (points) => set({ sectPoints: points }),
  setRaidKeys: (keys) => set({ raidKeys: keys }),
  setPlayerHearts: (hearts) => set({ playerHearts: hearts }),
}));
