// Fitness Machine Service (FTMS)
export const FTMS_SERVICE_UUID = '00001826-0000-1000-8000-00805f9b34fb';
export const INDOOR_BIKE_DATA_CHAR_UUID = '00002ad2-0000-1000-8000-00805f9b34fb';
export const FITNESS_MACHINE_CONTROL_POINT_UUID = '00002ad9-0000-1000-8000-00805f9b34fb';
export const FITNESS_MACHINE_STATUS_UUID = '00002ada-0000-1000-8000-00805f9b34fb';

// Heart Rate Service
export const HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
export const HR_MEASUREMENT_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// Cycling Power Service (Fallback for some trainers)
export const CPS_SERVICE_UUID = '00001818-0000-1000-8000-00805f9b34fb';
export const CPS_MEASUREMENT_CHAR_UUID = '00002a63-0000-1000-8000-00805f9b34fb';

// Op Codes for FTMS Control Point
export const OP_CODE_REQUEST_CONTROL = 0x00;
export const OP_CODE_RESET = 0x01;
export const OP_CODE_SET_TARGET_POWER = 0x05;
export const OP_CODE_SET_RESISTANCE = 0x04;
export const OP_CODE_START_RESUME = 0x07;
export const OP_CODE_STOP_PAUSE = 0x08;

export const RESULT_SUCCESS = 0x01;

// Default Settings
export const MIN_POWER = 50;
export const MAX_POWER = 1000;
export const MAX_RESISTANCE_LEVEL = 10;

export const POWER_ZONES: Record<string, { percentage: [number, number], color: string, label: string }> = {
  Z1: { percentage: [0, 55], color: '#94a3b8', label: 'Recovery' },
  Z2: { percentage: [56, 75], color: '#06b6d4', label: 'Endurance' },
  Z3: { percentage: [76, 90], color: '#10b981', label: 'Tempo' },
  Z4: { percentage: [91, 105], color: '#f59e0b', label: 'Threshold' },
  Z5: { percentage: [106, 120], color: '#ef4444', label: 'VO2 Max' },
  Z6: { percentage: [121, 150], color: '#8b5cf6', label: 'Anaerobic' },
};

// Aliases for the store
export const FTMS_CONTROL_POINT_CHARACTERISTIC_UUID = FITNESS_MACHINE_CONTROL_POINT_UUID;
export const HR_MEASUREMENT_CHARACTERISTIC_UUID = HR_MEASUREMENT_CHAR_UUID;
export const INDOOR_BIKE_DATA_CHARACTERISTIC_UUID = INDOOR_BIKE_DATA_CHAR_UUID;
