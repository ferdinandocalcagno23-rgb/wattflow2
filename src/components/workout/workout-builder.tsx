'use client';
import { useState } from 'react';
import { useWorkout, useWorkoutActions } from '@/store/workout-store';
import { POWER_ZONES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ArrowUp, ArrowDown, Play } from 'lucide-react';

export function WorkoutBuilder() {
  const { blocks, ftp } = useWorkout();
  const { addBlock, removeBlock, updateBlock, moveBlock, startWorkout, clearWorkout } = useWorkoutActions();
  const [duration, setDuration] = useState(5); // Default duration in minutes

  const handleAddBlock = (zone: keyof typeof POWER_ZONES) => {
    if (duration > 0) {
      addBlock(zone, duration * 60);
    }
  };

  const totalDuration = blocks.reduce((sum: number, block: any) => sum + block.duration, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">Workout Builder</CardTitle>
            <CardDescription>
              Click zone buttons to add blocks. Current FTP: {ftp}W
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {blocks.length > 0 && (
              <Button onClick={startWorkout}><Play className="mr-2 h-4 w-4" /> Start</Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="duration" className="text-sm">Add Block Duration (minutes)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="w-24"
              min="1"
            />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-1">
              {Object.entries(POWER_ZONES).map(([key, zone]: [string, any]) => (
                <Button
                  key={key}
                  onClick={() => handleAddBlock(key as keyof typeof POWER_ZONES)}
                  style={{ backgroundColor: zone.color, color: '#000' }}
                  className="font-bold"
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {blocks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Your workout is empty. Add some blocks to begin.</p>
          ) : (
            blocks.map((block: any, index: number) => (
              <div key={block.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <div className="font-bold w-10" style={{ color: POWER_ZONES[block.zone].color }}>
                  {block.zone}
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={block.duration / 60}
                    onChange={(e) => updateBlock(block.id, parseInt(e.target.value, 10) * 60)}
                    className="h-8 w-24"
                    min="1"
                  />
                  <span className="text-sm ml-2">min @ {block.targetPower}W</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => moveBlock(block.id, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => moveBlock(block.id, 'down')} disabled={index === blocks.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeBlock(block.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          )}
        </div>

        {blocks.length > 0 && (
          <div className="flex justify-between items-center mt-2 border-t pt-4">
            <p className="text-sm font-medium">
              Total Duration: {Math.floor(totalDuration / 60)} min {totalDuration % 60} sec
            </p>
            <Button variant="destructive" size="sm" onClick={clearWorkout}>Clear Workout</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
