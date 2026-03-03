'use client';

import { useDeviceActions, useDeviceConnection } from '@/store/device-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bluetooth, Heart, XCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const { trainerConnected, hrConnected, trainerName, hrName, isMock } = useDeviceConnection();
  const { connectTrainer, disconnectTrainer, connectHR, disconnectHR } = useDeviceActions();

  const handleTrainerClick = () => {
    trainerConnected ? disconnectTrainer() : connectTrainer();
  };

  const handleHrClick = () => {
    hrConnected ? disconnectHR() : connectHR();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Bluetooth
            className={cn(
              'w-4 h-4 mr-2',
              trainerConnected ? 'text-accent' : 'text-muted-foreground'
            )}
          />
          <Heart
            className={cn(
              'w-4 h-4',
              hrConnected ? 'text-red-500' : 'text-muted-foreground'
            )}
            fill={hrConnected ? 'currentColor' : 'none'}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Device Connections {isMock && '(Mock)'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleTrainerClick(); }}>
          {trainerConnected ? (
            <CheckCircle className="w-4 h-4 mr-2 text-accent" />
          ) : (
            <XCircle className="w-4 h-4 mr-2 text-muted-foreground" />
          )}
          <div className="flex-1">
            <p>Smart Trainer</p>
            {trainerName && <p className="text-xs text-muted-foreground">{trainerName}</p>}
          </div>
          <span className="text-xs">{trainerConnected ? 'Disconnect' : 'Connect'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleHrClick(); }}>
           {hrConnected ? (
            <CheckCircle className="w-4 h-4 mr-2 text-red-500" />
          ) : (
            <XCircle className="w-4 h-4 mr-2 text-muted-foreground" />
          )}
           <div className="flex-1">
            <p>Heart Rate Monitor</p>
            {hrName && <p className="text-xs text-muted-foreground">{hrName}</p>}
          </div>
          <span className="text-xs">{hrConnected ? 'Disconnect' : 'Connect'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center">
            <HelpCircle className="w-3 h-3 mr-2" />
            <span>Connect devices to start training.</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
