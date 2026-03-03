import Dexie, { type Table } from 'dexie';
import type { IntervalStep, RawDataPoint } from '@/types';

export interface WorkoutRecording {
  id?: number;
  name: string;
  date: Date;
  duration: number; // total seconds
  avgPower: number;
  status: 'pending' | 'synced';
  stravaId?: string;
  steps: IntervalStep[];
  rawData: RawDataPoint[];
}

export class CyclingDB extends Dexie {
  workouts!: Table<WorkoutRecording>;

  constructor() {
    super('CyclingDB');
    this.version(1).stores({
      workouts: '++id, date, status', // stravaId does not need to be indexed
    });
  }
}

export const db = new CyclingDB();

// --- Database Helper Functions ---

export async function addWorkout(workoutData: Omit<WorkoutRecording, 'id' | 'status' | 'stravaId'>) {
  try {
    await db.workouts.add({
      ...workoutData,
      status: 'pending',
    });
    console.log('Workout saved to IndexedDB');
  } catch (error) {
    console.error('Failed to save workout to IndexedDB:', error);
  }
}

export async function getPendingWorkouts() {
    return await db.workouts.where('status').equals('pending').toArray();
}

export async function updateWorkoutStatus(id: number, status: 'synced', stravaId: string): Promise<void>;
export async function updateWorkoutStatus(id: number, status: 'pending'): Promise<void>;
export async function updateWorkoutStatus(id: number, status: 'pending' | 'synced', stravaId?: string) {
    const updates: { status: 'pending' | 'synced'; stravaId?: string } = { status };
    if (status === 'synced' && stravaId) {
        updates.stravaId = stravaId;
    }
    await db.workouts.update(id, updates);
}
