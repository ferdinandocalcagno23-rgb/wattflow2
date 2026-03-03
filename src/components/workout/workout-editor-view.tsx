'use client';
import { useEffect } from 'react';
import { FtpEditor } from './ftp-editor';
import { ZoneDisplay } from './zone-display';
import { WorkoutBuilder } from './workout-builder';
import { WorkoutChart } from './workout-chart';
import { WorkoutPlayer } from './workout-player';
import { useWorkout, useWorkoutActions } from '@/store/workout-store';
import { useDeviceActions } from '@/store/device-store';
import { Separator } from '@/components/ui/separator';

export function WorkoutEditorView() {
  const { isPlaying, blocks, currentBlockIndex, timeInBlock } = useWorkout();
  const { tick } = useWorkoutActions();
  const { setTargetPower } = useDeviceActions();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const newBlock = tick();
        if (newBlock) {
          setTargetPower(newBlock.targetPower);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, tick, setTargetPower]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-4xl font-bold">Workout Editor</h1>
        <p className="text-muted-foreground">
          Build your custom workout or let our AI coach create one for you.
        </p>
      </div>

      {!isPlaying ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <FtpEditor />
            <ZoneDisplay />
          </div>
          <div className="lg:col-span-2">
            <WorkoutBuilder />
          </div>
        </div>
      ) : (
        <WorkoutPlayer />
      )}

      {blocks.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="font-headline text-3xl font-bold mb-4">Workout Profile</h2>
            <WorkoutChart
              blocks={blocks}
              currentBlockIndex={isPlaying ? currentBlockIndex : undefined}
              timeInBlock={isPlaying ? timeInBlock : undefined}
            />
          </div>
        </>
      )}
    </div>
  );
}
