import { useState, useRef, useCallback } from 'react';
import { addWorkout } from '@/services/dbService';
import type { RawDataPoint, IntervalStep } from '@/types';
import { syncService } from '@/services/syncService';

export const useWorkoutRecorder = (workoutName: string, steps: IntervalStep[], profileId: number | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const rawDataRef = useRef<RawDataPoint[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const lastDatapointTimeRef = useRef<number | null>(null);
  const activeDurationRef = useRef<number>(0);

  const startRecording = useCallback(() => {
    rawDataRef.current = [];
    startTimeRef.current = Date.now();
    lastDatapointTimeRef.current = null;
    activeDurationRef.current = 0;
    setIsRecording(true);
    console.log('Workout recording started.');
  }, []);

  const addDatapoint = useCallback((power: number, cadence: number, heartRate: number, speed: number) => {
    if (!isRecording || startTimeRef.current === null) return;

    const now = Date.now();
    if (lastDatapointTimeRef.current !== null) {
      const delta = (now - lastDatapointTimeRef.current) / 1000;
      // Only count reasonable deltas (< 3s) to avoid counting pause gaps
      if (delta < 3) {
        activeDurationRef.current += delta;
      }
    }
    lastDatapointTimeRef.current = now;
    const time = activeDurationRef.current;
    rawDataRef.current.push({ time, power, cadence, heartRate, speed });
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || startTimeRef.current === null) return;

    // Use tracked active duration instead of wall-clock time
    const duration = activeDurationRef.current;

    const totalPower = rawDataRef.current.reduce((sum, point) => sum + point.power, 0);
    const avgPower = rawDataRef.current.length > 0 ? Math.round(totalPower / rawDataRef.current.length) : 0;

    const workoutData = {
      profileId: profileId || 0, // Fallback to 0 if no profile selected (shouldn't happen)
      name: workoutName,
      date: new Date(startTimeRef.current),
      duration,
      avgPower,
      steps,
      rawData: rawDataRef.current,
    };

    await addWorkout(workoutData);

    // Trigger an immediate background sync after saving a new workout
    syncService.syncPendingWorkouts().catch(err => console.error("Auto-sync failed:", err));

    // Reset state
    setIsRecording(false);
    startTimeRef.current = null;
    lastDatapointTimeRef.current = null;
    activeDurationRef.current = 0;
    rawDataRef.current = [];
    console.log('Workout recording stopped and saved.');
  }, [isRecording, workoutName, steps, profileId]);

  return { isRecording, startRecording, stopRecording, addDatapoint };
};
