'use client';
import { useMetrics, useDevice } from '@/store/device-store';
import { useWorkout, useWorkoutActions } from '@/store/workout-store';
import { POWER_ZONES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Pause, StopCircle } from 'lucide-react';

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

export function WorkoutPlayer() {
  const { power } = useMetrics();
  const { targetPower } = useDevice();
  const { blocks, currentBlockIndex, timeInBlock, totalTime } = useWorkout();
  const { pauseWorkout, stopWorkout } = useWorkoutActions();

  const currentBlock = blocks[currentBlockIndex];
  const nextBlock = blocks[currentBlockIndex + 1];

  const totalWorkoutDuration = blocks.reduce((acc: number, b: any) => acc + b.duration, 0);
  const blockProgress = (timeInBlock / currentBlock.duration) * 100;
  const totalProgress = (totalTime / totalWorkoutDuration) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundColor: POWER_ZONES[currentBlock.zone].color }}
          ></div>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Current Block: {currentBlock.zone}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline font-bold text-7xl text-primary">
              {formatTime(currentBlock.duration - timeInBlock)}
            </div>
            <p className="text-muted-foreground mt-2">Remaining</p>
            <Progress value={blockProgress} className="mt-4 h-2" />
          </CardContent>
        </Card>
        <Card className="text-center bg-muted/30">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              {nextBlock ? `Next: ${nextBlock.zone}` : 'Final Block'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline font-bold text-7xl text-muted-foreground">
              {nextBlock ? formatTime(nextBlock.duration) : '--:--'}
            </div>
            <p className="text-muted-foreground mt-2">
              {nextBlock ? `@ ${nextBlock.targetPower} W` : 'Workout complete soon!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl">Current Power</CardTitle></CardHeader>
          <CardContent><p className="font-headline font-bold text-6xl text-accent">{power}<span className="text-2xl text-muted-foreground ml-2">W</span></p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl">Target Power</CardTitle></CardHeader>
          <CardContent><p className="font-headline font-bold text-6xl">{targetPower}<span className="text-2xl text-muted-foreground ml-2">W</span></p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-headline text-2xl">Total Time</CardTitle></CardHeader>
          <CardContent><p className="font-headline font-bold text-6xl">{formatTime(totalTime)}</p></CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <p className="text-sm">Total Workout Progress</p>
          <p className="text-sm font-medium">{formatTime(totalWorkoutDuration - totalTime)} remaining</p>
        </div>
        <Progress value={totalProgress} className="h-4" />
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <Button size="lg" variant="secondary" onClick={pauseWorkout}><Pause className="mr-2" /> Pause</Button>
        <Button size="lg" variant="destructive" onClick={stopWorkout}><StopCircle className="mr-2" /> Stop Workout</Button>
      </div>
    </div>
  );
}
