'use client';

import {
  FTMS_SERVICE_UUID,
  INDOOR_BIKE_DATA_CHAR_UUID,
  FITNESS_MACHINE_CONTROL_POINT_UUID,
  HR_SERVICE_UUID,
  HR_MEASUREMENT_CHAR_UUID,
  OP_CODE_REQUEST_CONTROL,
  OP_CODE_SET_TARGET_POWER,
  OP_CODE_SET_RESISTANCE,
  RESULT_SUCCESS,
} from '@/lib/constants';
import { TrainerData, HeartRateData } from '@/types';

type TrainerDataCallback = (data: TrainerData) => void;
type HRDataCallback = (data: HeartRateData) => void;

class BLEService {
  private trainerDevice: BluetoothDevice | null = null;
  private hrDevice: BluetoothDevice | null = null;
  private controlPoint: BluetoothRemoteGATTCharacteristic | null = null;
  private mockInterval: number | null = null;
  public isMocking: boolean = false;
  
  // Mock data state
  private mockTargetPower: number = 0;
  private mockResistanceLevel: number = 1;

  private hasControl: boolean = false;
  
  private onTrainerData: TrainerDataCallback | null = null;
  private onHRData: HRDataCallback | null = null;

  private controlRequestCompletion: { resolve: () => void; reject: (reason?: any) => void; } | null = null;


  public setCallbacks(trainerCb: TrainerDataCallback, hrCb: HRDataCallback) {
    this.onTrainerData = trainerCb;
    this.onHRData = hrCb;
  }

  // --- MOCK DATA ---
  private startMockData() {
    if (this.mockInterval) return;
    this.isMocking = true;
    this.hasControl = true; // For mock, assume control is granted.
    this.mockTargetPower = 0; // Default to resistance mode
    this.mockResistanceLevel = 1;
    console.log("Starting mock data stream...");

    this.mockInterval = window.setInterval(() => {
      if (this.onTrainerData) {
        const cadence = Math.max(0, Math.round(85 + Math.sin(Date.now() / 1500) * 10 + (Math.random() - 0.5) * 5));
        
        let power = 0;
        if (this.mockTargetPower > 0) { // ERG mode simulation
          power = Math.max(0, Math.round(this.mockTargetPower + (Math.random() - 0.5) * 8));
        } else { // Resistance mode simulation
          const baseResistance = this.mockResistanceLevel * this.mockResistanceLevel * 0.8;
          const cadenceFactor = cadence > 40 ? (cadence / 85) : 0.5;
          power = Math.round(baseResistance + (cadence * 1.2 * cadenceFactor));
          power = Math.max(0, power + (Math.random() - 0.5) * 5); // Add some noise
        }

        this.onTrainerData({ power, cadence, speed: power / 10 });
      }
      if (this.onHRData) {
        const heartRate = Math.max(0, Math.round(120 + Math.sin(Date.now() / 5000) * 20));
        this.onHRData({ heartRate });
      }
    }, 1000);
  }

  private stopMockData() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    this.isMocking = false;
    this.hasControl = false;
    if (this.onTrainerData) this.onTrainerData({ power: 0, cadence: 0, speed: 0 });
    if (this.onHRData) this.onHRData({ heartRate: 0 });
    console.log("Stopped mock data stream.");
  }

  // --- TRAINER CONNECTION ---

  async connectTrainer(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.bluetooth) {
      console.log('Web Bluetooth not supported, using mock data for trainer.');
      this.startMockData();
      return true;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [FTMS_SERVICE_UUID] }],
        optionalServices: [FTMS_SERVICE_UUID]
      });

      if (!device) return false;

      this.trainerDevice = device;
      const server = await device.gatt?.connect();
      
      if (!server) throw new Error("GATT Server not found");

      const service = await server.getPrimaryService(FTMS_SERVICE_UUID);
      
      const dataChar = await service.getCharacteristic(INDOOR_BIKE_DATA_CHAR_UUID);
      await dataChar.startNotifications();
      dataChar.addEventListener('characteristicvaluechanged', this.handleTrainerData);

      try {
        this.controlPoint = await service.getCharacteristic(FITNESS_MACHINE_CONTROL_POINT_UUID);
        await this.controlPoint.startNotifications();
        this.controlPoint.addEventListener('characteristicvaluechanged', this.handleControlPointResponse);
        await this.requestControl(); // Wait for control to be granted
      } catch (e) {
        console.warn("Control point not available or writable, proceeding without control.", e);
      }

      device.addEventListener('gattserverdisconnected', () => {
        this.trainerDevice = null;
        this.controlPoint = null;
        this.hasControl = false; 
        console.log("Trainer disconnected");
        if(this.onTrainerData) this.onTrainerData({power: 0, cadence: 0, speed: 0});
      });

      return true;
    } catch (error) {
      console.error("Trainer Connection Error, falling back to mock data:", error);
      this.startMockData();
      return true;
    }
  }

  async disconnectTrainer() {
    if (this.isMocking) {
      this.stopMockData();
      return;
    }
    if (this.trainerDevice && this.trainerDevice.gatt?.connected) {
      this.trainerDevice.gatt.disconnect();
    }
    this.trainerDevice = null;
    this.controlPoint = null;
    this.hasControl = false;
  }

  // --- HR CONNECTION ---

  async connectHeartRate(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.bluetooth) {
      console.log('Web Bluetooth not supported, using mock data for HR.');
      this.startMockData();
      return true;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HR_SERVICE_UUID] }]
      });

      if (!device) return false;

      this.hrDevice = device;
      const server = await device.gatt?.connect();
      if (!server) throw new Error("GATT Server not found");

      const service = await server.getPrimaryService(HR_SERVICE_UUID);
      const dataChar = await service.getCharacteristic(HR_MEASUREMENT_CHAR_UUID);
      await dataChar.startNotifications();
      dataChar.addEventListener('characteristicvaluechanged', this.handleHRData);

      device.addEventListener('gattserverdisconnected', () => {
        this.hrDevice = null;
        console.log("HR Monitor disconnected");
        if(this.onHRData) this.onHRData({heartRate: 0});
      });

      return true;
    } catch (error) {
      console.error("HR Connection Error, falling back to mock data:", error);
      this.startMockData();
      return true;
    }
  }

  async disconnectHeartRate() {
     if (this.isMocking) {
      console.log("Mock HR disconnected.");
      if (this.onHRData) this.onHRData({ heartRate: 0 });
      // If trainer is not also being mocked, stop the interval
      if (!this.trainerDevice) this.stopMockData();
      return;
    }
    if (this.hrDevice && this.hrDevice.gatt?.connected) {
      this.hrDevice.gatt.disconnect();
    }
    this.hrDevice = null;
  }

  // --- DATA HANDLING ---

  private handleTrainerData = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    let power = 0;
    let cadence = 0;
    
    const flags = value.getUint16(0, true);
    let offset = 2;

    // The FTMS specification states that "Instantaneous Speed" is a mandatory field.
    if (value.byteLength < offset + 2) return; // Not a valid packet
    const speed = value.getUint16(offset, true) / 100;
    offset += 2;
    
    if (flags & 0x0002) { // Average Speed
        if (value.byteLength >= offset + 2) offset += 2;
    }
    if (flags & 0x0004) { // Instantaneous Cadence
        if (value.byteLength >= offset + 2) {
            cadence = value.getUint16(offset, true) / 2;
            offset += 2;
        }
    }
    if (flags & 0x0008) { // Average Cadence
        if (value.byteLength >= offset + 2) offset += 2;
    }
    if (flags & 0x0010) { // Total Distance
        if (value.byteLength >= offset + 3) offset += 3;
    }
    if (flags & 0x0020) { // Resistance Level
        if (value.byteLength >= offset + 2) offset += 2;
    }
    if (flags & 0x0040) { // Instantaneous Power
        if (value.byteLength >= offset + 2) {
            power = value.getInt16(offset, true);
            offset += 2;
        }
    }
    if (flags & 0x0080) { // Average Power
        if (value.byteLength >= offset + 2) offset += 2;
    }

    if (this.onTrainerData) {
      this.onTrainerData({ power, cadence, speed });
    }
  };

  private handleHRData = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRate = 0;

    if (rate16Bits) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }

    if (this.onHRData) {
      this.onHRData({ heartRate });
    }
  };

  private handleControlPointResponse = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value || value.byteLength < 3) {
      console.warn("Received invalid control point response.");
      return;
    }

    const responseOpCode = value.getUint8(0);
    const requestOpCode = value.getUint8(1);
    const resultCode = value.getUint8(2);

    if (responseOpCode !== 0x80) return; // Not a response opcode

    console.log(`Response for op code 0x${requestOpCode.toString(16)} -> result: 0x${resultCode.toString(16)}`);
      
    if (requestOpCode === OP_CODE_REQUEST_CONTROL) {
      if (resultCode === RESULT_SUCCESS) {
        this.hasControl = true;
        console.log("Control successfully taken over trainer.");
        this.controlRequestCompletion?.resolve();
      } else {
        this.hasControl = false;
        console.error("Failed to take control of the trainer. Result code:", resultCode);
        this.controlRequestCompletion?.reject(new Error(`Control request failed with code: ${resultCode}`));
      }
      this.controlRequestCompletion = null;
    }
  };

  // --- CONTROL COMMANDS ---

  async requestControl(): Promise<void> {
    if (!this.controlPoint || !this.controlPoint.properties.write) {
      console.warn("Cannot request control, no writable control point characteristic.");
      this.hasControl = true; // Assume control for trainers without a proper control point
      return Promise.resolve();
    }
    return new Promise(async (resolve, reject) => {
      this.controlRequestCompletion = { resolve, reject };
      try {
        const payload = new Uint8Array([OP_CODE_REQUEST_CONTROL]);
        await this.controlPoint!.writeValue(payload);
        console.log("Requested control of trainer...");
        // Timeout for the response
        setTimeout(() => {
          if (this.controlRequestCompletion) {
            console.warn("Control request timed out. Assuming control.");
            this.hasControl = true;
            this.controlRequestCompletion.resolve();
            this.controlRequestCompletion = null;
          }
        }, 3000); 
      } catch (e) {
        console.error("Failed to write request control. Assuming control.", e);
        this.hasControl = true;
        if (this.controlRequestCompletion) {
            this.controlRequestCompletion.resolve();
            this.controlRequestCompletion = null;
        }
      }
    });
  }

  async setTargetPower(watts: number) {
    // For mock mode
    this.mockTargetPower = watts;

    if (!this.controlPoint) {
      if (this.isMocking) console.log(`Mock Target Power: ${watts}W`);
      return;
    }
    if (!this.hasControl) {
      console.warn("Cannot set target power: No control over trainer.");
      return;
    }
    try {
      const buffer = new ArrayBuffer(3);
      const view = new DataView(buffer);
      view.setUint8(0, OP_CODE_SET_TARGET_POWER);
      view.setInt16(1, watts, true);
      await this.controlPoint.writeValue(buffer);
    } catch (e) {
      console.error("Failed to set target power.", e);
    }
  }

  async setResistance(level: number) {
    // For mock mode
    this.mockTargetPower = 0; // Clear target power to signal resistance mode
    this.mockResistanceLevel = level / 10; // The mock power formula uses a 0-10 scale.

    if (!this.controlPoint) {
        if (this.isMocking) console.log(`Mock Resistance Level set to: ${level}%`);
        return;
    }
    if (!this.hasControl) {
      console.warn("Cannot set resistance: No control over trainer.");
      return;
    }
    // The FTMS spec for "Set Indoor Bike Simulation" uses a SINT16 for grade.
    // However, "Set Resistance Level" is simpler and more widely supported.
    // This value is a percentage from 0-100.
    const value = level;
    
    try {
      const buffer = new ArrayBuffer(3);
      const view = new DataView(buffer);
      view.setUint8(0, OP_CODE_SET_RESISTANCE);
      view.setInt16(1, value, true); // Sending percentage value as SINT16
      await this.controlPoint.writeValue(buffer);
    } catch (e) {
      console.error("Failed to set resistance.", e);
    }
  }
}

export const bleService = new BLEService();
