'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateWorkoutStatus } from '@/services/dbService';
import { useState, useEffect } from 'react';
import { UploadCloud, Link } from 'lucide-react';
import { stravaService } from '@/services/stravaService';
import { createTcxBlob } from '@/lib/strava/fitEncoder';
import type { WorkoutRecording } from '@/services/dbService';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const base = "relative overflow-hidden rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const styles = {
    primary: "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:brightness-110 shadow-neon-blue/25 hover:shadow-neon-blue/50 border border-white/20",
    secondary: "bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}>
      {children}
    </button>
  );
};


export function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // This hook will re-run when the component mounts or db changes.
  useEffect(() => {
    setIsAuthenticated(stravaService.isAuthenticated());
  }, []);
  
  const pendingWorkouts = useLiveQuery(() => db.workouts.where('status').equals('pending').toArray(), []);

  const handleAuth = () => {
    window.location.href = stravaService.getAuthUrl();
  };

  const handleSync = async () => {
    if (!pendingWorkouts || pendingWorkouts.length === 0) return;
    
    setIsSyncing(true);

    for (const workout of pendingWorkouts) {
      if (workout.id) {
        try {
          console.log(`Uploading workout ${workout.id} to Strava...`);
          const tcxBlob = createTcxBlob(workout as WorkoutRecording);
          const uploadResult = await stravaService.uploadActivity(tcxBlob, workout.name, 'tcx');
          
          // NOTE: The Strava upload API is asynchronous. The result here confirms the upload
          // was received. A more robust implementation would poll the upload status endpoint
          // to get the final activity ID. For now, we'll use the upload ID.
          console.log('Upload initiated:', uploadResult);

          await updateWorkoutStatus(workout.id, 'synced', uploadResult.id_str);
          console.log(`Workout ${workout.id} synced with Strava Upload ID ${uploadResult.id_str}.`);

        } catch (error: any) {
          console.error(`Failed to sync workout ${workout.id}:`, error);
          if (error.response?.status === 401) {
            console.log("Strava authentication error. Disconnecting.");
            stravaService.disconnect();
            setIsAuthenticated(false);
          }
          // Stop syncing on first error to prevent repeated failures
          break; 
        }
      }
    }
    
    setIsSyncing(false);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <Button onClick={handleAuth} className="px-6 py-4" variant="primary">
          <Link size={20} />
          Connect to Strava
        </Button>
      </div>
    );
  }

  if (!pendingWorkouts || pendingWorkouts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <Button 
        onClick={handleSync} 
        disabled={isSyncing}
        className="px-6 py-4"
        variant="primary"
      >
        <UploadCloud size={20} />
        {isSyncing ? 'Syncing...' : `Sync to Strava (${pendingWorkouts.length})`}
      </Button>
    </div>
  );
}
