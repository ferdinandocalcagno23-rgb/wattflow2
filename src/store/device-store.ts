'use client';

import { create, StateCreator } from 'zustand';
import { toast } from '@/hooks/use-toast';
import {
  FTMS_CONTROL_POINT_CHARACTERISTIC_UUID,
  FTMS_SERVICE_UUID,
  HR_MEASUREMENT_CHARACTERISTIC_UUID,
  HR_SERVICE_UUID,
  INDOOR_BIKE_DATA_CHARACTERISTIC_UUID,
} from '@/lib/constants';
import type { Metrics } from '@/types';

interface DeviceState {
  isMock: boolean;
  trainerName: string | null;
  hrName: string | null;
  trainerConnected: boolean;
  hrConnected: boolean;
  metrics: Metrics;
  targetPower: number | null;
  resistance: number | null;
  actions: {
    connectTrainer: () => Promise<void>;
    disconnectTrainer: () => void;
    connectHR: () => Promise<void>;
    disconnectHR: () => void;
    setTargetPower: (power: number) => void;
    setResistance: (resistance: number) => void;
  };
}

let trainerDevice: BluetoothDevice | null = null;
let hrDevice: BluetoothDevice | null = null;
let ftmsControlPoint: BluetoothRemoteGATTCharacteristic | null = null;
let mockInterval: NodeJS.Timeout | null = null;

const stateCreator: StateCreator<DeviceState> = (set, get) => ({
  isMock: false,
  trainerName: null,
  hrName: null,
  trainerConnected: false,
  hrConnected: false,
  metrics: { power: 0, cadence: 0, heartRate: 0 },
  targetPower: null,
  resistance: null,
  actions: {
    connectTrainer: async () => {
      if (typeof window === 'undefined' || !navigator.bluetooth) {
        set({ isMock: true, trainerConnected: true, trainerName: 'Mock Trainer' });
        if (mockInterval) clearInterval(mockInterval);
        mockInterval = setInterval(() => {
          set((state) => ({
            metrics: {
              ...state.metrics,
              power: state.targetPower ? Math.round(state.targetPower + (Math.random() - 0.5) * 10) : Math.round(100 + Math.sin(Date.now() / 2000) * 20 + (Math.random() - 0.5) * 5),
              cadence: Math.round(85 + Math.sin(Date.now() / 1500) * 10 + (Math.random() - 0.5) * 5),
            },
          }));
        }, 1000);
        toast({ title: 'Mock Trainer Connected', description: 'Using simulated data for development.' });
        return;
      }

      try {
        trainerDevice = await navigator.bluetooth.requestDevice({
          filters: [{ services: [FTMS_SERVICE_UUID] }],
          optionalServices: [FTMS_SERVICE_UUID],
        });

        if (!trainerDevice || !trainerDevice.gatt) throw new Error('No device selected or GATT server not available.');

        trainerDevice.addEventListener('gattserverdisconnected', get().actions.disconnectTrainer);
        const server = await trainerDevice.gatt.connect();
        const service = await server.getPrimaryService(FTMS_SERVICE_UUID);

        // Get Control Point
        ftmsControlPoint = await service.getCharacteristic(FTMS_CONTROL_POINT_CHARACTERISTIC_UUID);

        // Subscribe to Indoor Bike Data
        const indoorBikeData = await service.getCharacteristic(INDOOR_BIKE_DATA_CHARACTERISTIC_UUID);
        await indoorBikeData.startNotifications();
        indoorBikeData.addEventListener('characteristicvaluechanged', (event) => {
          const view = (event.target as BluetoothRemoteGATTCharacteristic).value!;
          const flags = view.getUint16(0, true);
          let index = 2;
          // Instantaneous Power is at byte 4 (if present)
          if (flags & 0x0040) {
            const power = view.getInt16(index, true);
            index += 2;
            set((state) => ({ metrics: { ...state.metrics, power } }));
          } else {
            index += 2; // Skip Instantaneous Speed
          }
          // Instantaneous Cadence is at byte 6 (if present)
          if (flags & 0x0100) {
            const cadence = view.getUint16(index, true) * 0.5;
            index += 2;
            set((state) => ({ metrics: { ...state.metrics, cadence: Math.round(cadence) } }));
          }
        });

        set({ trainerConnected: true, trainerName: trainerDevice.name || 'Smart Trainer' });
        toast({ title: 'Trainer Connected', description: `${trainerDevice.name || 'Smart Trainer'} is ready.` });
      } catch (error) {
        console.error('Error connecting to trainer:', error);
        toast({
          title: 'Connection Failed',
          description: (error as Error).message,
          variant: 'destructive',
        });
        get().actions.disconnectTrainer();
      }
    },
    disconnectTrainer: () => {
      if (trainerDevice?.gatt?.connected) {
        trainerDevice.gatt.disconnect();
      }
      trainerDevice = null;
      ftmsControlPoint = null;
      if (mockInterval) clearInterval(mockInterval);
      mockInterval = null;
      set({ trainerConnected: false, trainerName: null, isMock: false, metrics: { ...get().metrics, power: 0, cadence: 0 } });
    },
    connectHR: async () => {
      if (typeof window === 'undefined' || !navigator.bluetooth) {
        set({ isMock: true, hrConnected: true, hrName: 'Mock HR' });
        if (!mockInterval) { // if trainer is not providing mock data
          mockInterval = setInterval(() => {
            set((state) => ({
              metrics: { ...state.metrics, heartRate: Math.round(120 + Math.sin(Date.now() / 5000) * 20) },
            }));
          }, 1000);
        }
        toast({ title: 'Mock HR Connected' });
        return;
      }
      try {
        hrDevice = await navigator.bluetooth.requestDevice({
          filters: [{ services: [HR_SERVICE_UUID] }],
          optionalServices: [HR_SERVICE_UUID],
        });
        if (!hrDevice || !hrDevice.gatt) throw new Error('No device selected.');

        hrDevice.addEventListener('gattserverdisconnected', get().actions.disconnectHR);
        const server = await hrDevice.gatt.connect();
        const service = await server.getPrimaryService(HR_SERVICE_UUID);
        const characteristic = await service.getCharacteristic(HR_MEASUREMENT_CHARACTERISTIC_UUID);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          const view = (event.target as BluetoothRemoteGATTCharacteristic).value!;
          const flags = view.getUint8(0);
          const is16bit = flags & 0x01;
          const heartRate = is16bit ? view.getUint16(1, true) : view.getUint8(1);
          set((state) => ({ metrics: { ...state.metrics, heartRate } }));
        });
        set({ hrConnected: true, hrName: hrDevice.name || 'Heart Rate Monitor' });
        toast({ title: 'HR Monitor Connected', description: `${hrDevice.name || 'HR Monitor'} is ready.` });
      } catch (error) {
        console.error('Error connecting to HR monitor:', error);
        toast({
          title: 'Connection Failed',
          description: (error as Error).message,
          variant: 'destructive',
        });
        get().actions.disconnectHR();
      }
    },
    disconnectHR: () => {
      if (hrDevice?.gatt?.connected) {
        hrDevice.gatt.disconnect();
      }
      hrDevice = null;
      set({ hrConnected: false, hrName: null, metrics: { ...get().metrics, heartRate: 0 } });
      if (!get().trainerConnected) {
        if (mockInterval) clearInterval(mockInterval);
        mockInterval = null;
        set({ isMock: false });
      }
    },
    setTargetPower: (power) => {
      set({ targetPower: power, resistance: null });
      if (ftmsControlPoint && get().trainerConnected) {
        const buffer = new ArrayBuffer(3);
        const view = new DataView(buffer);
        view.setUint8(0, 0x05); // Op Code for Set Target Power
        view.setInt16(1, power, true); // Target power in watts
        ftmsControlPoint.writeValue(view);
      }
    },
    setResistance: (resistance) => {
      set({ resistance, targetPower: null });
      if (ftmsControlPoint && get().trainerConnected) {
        const buffer = new ArrayBuffer(2);
        const view = new DataView(buffer);
        view.setUint8(0, 0x04); // Op Code for Set Resistance Level
        view.setInt8(1, resistance); // Resistance level
        ftmsControlPoint.writeValue(view);
      }
    },
  },
});

const useDeviceStore = create<DeviceState>()(stateCreator);

// Export hooks
export const useDevice = () => useDeviceStore((state) => state);
export const useDeviceActions = () => useDeviceStore((state) => state.actions);
export const useMetrics = () => useDeviceStore((state) => state.metrics);
export const useDeviceConnection = () => useDeviceStore((state) => ({
  trainerConnected: state.trainerConnected,
  hrConnected: state.hrConnected,
  trainerName: state.trainerName,
  hrName: state.hrName,
  isMock: state.isMock,
}));
