'use client';
import { useWorkout } from '@/store/workout-store';
import { calculateZones } from '@/lib/zones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ZoneDisplay() {
  const { ftp } = useWorkout();
  const zones = calculateZones(ftp);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Power Zones</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {Object.entries(zones).map(([key, zone]) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-medium">{zone.label.split(' ')[0]}</span>
              </div>
              <Badge variant="secondary" className="font-mono">
                {zone.watts[0]} - {zone.watts[1]} W
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
