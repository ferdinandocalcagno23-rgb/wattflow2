'use client';
import { useWorkout, useWorkoutActions } from '@/store/workout-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FtpEditor() {
  const { ftp } = useWorkout();
  const { setFtp } = useWorkoutActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">FTP Setting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <Input
            type="number"
            id="ftp"
            value={ftp}
            onChange={(e) => setFtp(parseInt(e.target.value, 10) || 0)}
            className="text-2xl font-bold"
          />
          <Label htmlFor="ftp" className="text-lg text-muted-foreground">
            Watts
          </Label>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your FTP is used to calculate power zones for workouts.
        </p>
      </CardContent>
    </Card>
  );
}
