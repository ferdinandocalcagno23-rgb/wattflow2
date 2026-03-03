'use client';
import { useEffect, useState } from 'react';
import { useMetrics, useDeviceActions, useDevice } from '@/store/device-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

export function ErgModeView() {
  const { power } = useMetrics();
  const { targetPower } = useDevice();
  const { setTargetPower } = useDeviceActions();
  const [localTarget, setLocalTarget] = useState(targetPower || 100);

  useEffect(() => {
    // Set initial target power when component mounts
    setTargetPower(localTarget);
  }, []);
  
  useEffect(() => {
    // If targetPower is changed from workout player, update local state
    if (targetPower !== null && targetPower !== localTarget) {
      setLocalTarget(targetPower);
    }
  }, [targetPower, localTarget]);

  const adjustPower = (amount: number) => {
    const newTarget = Math.max(0, localTarget + amount);
    setLocalTarget(newTarget);
    setTargetPower(newTarget);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center justify-center">
      <Card className="text-center bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Current Power</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-headline font-bold text-8xl md:text-9xl text-accent">
            {power}
            <span className="text-4xl md:text-5xl text-muted-foreground ml-2">W</span>
          </div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Target Power</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-headline font-bold text-8xl md:text-9xl text-primary">
            {localTarget}
            <span className="text-4xl md:text-5xl text-muted-foreground ml-2">W</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button size="lg" variant="secondary" onClick={() => adjustPower(-10)}><Minus className="mr-2"/> 10W</Button>
            <Button size="lg" variant="secondary" onClick={() => adjustPower(10)}><Plus className="mr-2"/> 10W</Button>
            <Button size="lg" variant="secondary" onClick={() => adjustPower(-5)}><Minus className="mr-2"/> 5W</Button>
            <Button size="lg" variant="secondary" onClick={() => adjustPower(5)}><Plus className="mr-2"/> 5W</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
