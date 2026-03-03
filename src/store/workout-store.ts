'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkoutBlock } from '@/types';
import { POWER_ZONES } from '@/lib/constants';

interface WorkoutState {
  ftp: number;
  blocks: WorkoutBlock[];
  isPlaying: boolean;
  currentBlockIndex: number;
  timeInBlock: number; // elapsed time in seconds for the current block
  totalTime: number; // elapsed time for the whole workout
  actions: {
    setFtp: (ftp: number) => void;
    addBlock: (zone: WorkoutBlock['zone'], duration: number) => void;
    removeBlock: (id: string) => void;
    updateBlock: (id: string, newDuration: number) => void;
    moveBlock: (id: string, direction: 'up' | 'down') => void;
    startWorkout: () => void;
    pauseWorkout: () => void;
    stopWorkout: () => void;
    tick: () => WorkoutBlock | null;
    clearWorkout: () => void;
  };
}

const getTargetPowerForZone = (zoneKey: WorkoutBlock['zone'], ftp: number): number => {
  const zone = POWER_ZONES[zoneKey];
  if (!zone) return ftp;
  const avgPercentage = (zone.percentage[0] + zone.percentage[1]) / 2;
  return Math.round((avgPercentage / 100) * ftp);
};

const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      ftp: 200,
      blocks: [],
      isPlaying: false,
      currentBlockIndex: 0,
      timeInBlock: 0,
      totalTime: 0,
      actions: {
        setFtp: (ftp) => set({ ftp }),
        addBlock: (zone, duration) => {
          const ftp = get().ftp;
          const newBlock: WorkoutBlock = {
            id: crypto.randomUUID(),
            zone,
            duration,
            targetPower: getTargetPowerForZone(zone, ftp),
          };
          set((state) => ({ blocks: [...state.blocks, newBlock] }));
        },
        removeBlock: (id) => set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),
        updateBlock: (id, newDuration) => {
          set((state) => ({
            blocks: state.blocks.map((b) => (b.id === id ? { ...b, duration: newDuration } : b)),
          }));
        },
        moveBlock(id, direction) {
          const blocks = [...get().blocks];
          const index = blocks.findIndex((b) => b.id === id);
          if (index === -1) return;

          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= blocks.length) return;

          [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
          set({ blocks });
        },
        startWorkout: () => {
          if (get().blocks.length > 0) {
            set({ isPlaying: true });
          }
        },
        pauseWorkout: () => set({ isPlaying: false }),
        stopWorkout: () => set({ isPlaying: false, currentBlockIndex: 0, timeInBlock: 0, totalTime: 0 }),
        clearWorkout: () => set({ blocks: [], isPlaying: false, currentBlockIndex: 0, timeInBlock: 0, totalTime: 0 }),
        tick: () => {
          if (!get().isPlaying) return null;

          const state = get();
          const currentBlock = state.blocks[state.currentBlockIndex];
          if (!currentBlock) {
            state.actions.stopWorkout();
            return null;
          }

          const newTimeInBlock = state.timeInBlock + 1;
          const newTotalTime = state.totalTime + 1;

          if (newTimeInBlock >= currentBlock.duration) {
            const nextBlockIndex = state.currentBlockIndex + 1;
            if (nextBlockIndex >= state.blocks.length) {
              state.actions.stopWorkout();
              return null;
            }
            set({
              currentBlockIndex: nextBlockIndex,
              timeInBlock: 0,
              totalTime: newTotalTime
            });
            return state.blocks[nextBlockIndex];
          }

          set({ timeInBlock: newTimeInBlock, totalTime: newTotalTime });
          return currentBlock;
        },
      },
    }),
    {
      name: 'wattflow-workout-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ ftp: state.ftp, blocks: state.blocks }), // Only persist FTP and blocks
    }
  )
);

export const useWorkout = () => useWorkoutStore((state) => state);
export const useWorkoutActions = () => useWorkoutStore((state) => state.actions);
