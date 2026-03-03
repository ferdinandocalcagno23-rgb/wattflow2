'use client';
import { useEffect, useState } from 'react';
import { useMetrics, useDeviceActions, useDevice } from '@/store/device-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export function ResistanceModeView() {
  const { power, cadence, heartRate } = useMetrics();
  const { resistance } = useDevice();
  const { setResistance } = useDeviceActions();
  const [localResistance, setLocalResistance] = useState(resistance || 25);

  useEffect(() => {
    setResistance(localResistance);
  }, []);

  const handleResistanceChange = (value: number[]) => {
    setLocalResistance(value[0]);
    setResistance(value[0]);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid md:grid-cols-3 gap-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Power</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-headline font-bold text-7xl">
              {power}
              <span className="text-3xl text-muted-foreground ml-2">W</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Cadence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-headline font-bold text-7xl">
              {cadence}
              <span className="text-3xl text-muted-foreground ml-2">RPM</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Heart Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-headline font-bold text-7xl">
              {heartRate || '--'}
              <span className="text-3xl text-muted-foreground ml-2">BPM</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Resistance Control</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
            <div className='flex items-center gap-4'>
                <Slider
                    value={[localResistance]}
                    onValueChange={handleResistanceChange}
                    max={100}
                    step={1}
                />
                <div className='font-headline text-3xl font-bold w-24 text-center'>
                    {localResistance}%
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
