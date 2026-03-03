import type { IntervalStep } from '@/types';

// Use power as a percentage of FTP
export interface PreMadeIntervalStep extends Omit<IntervalStep, 'targetPower' | 'startPower' | 'id'> {
    targetPowerPercent: number; // as a decimal, e.g., 0.95 for 95%
    startPowerPercent?: number; // as a decimal
}

export interface PreMadeWorkout {
    id: string;
    name: string;
    description: string;
    category: 'Recovery' | 'Endurance' | 'Sweet Spot' | 'Threshold' | 'VO2 Max' | 'Testing';
    steps: PreMadeIntervalStep[];
}

export const PRE_MADE_WORKOUTS: PreMadeWorkout[] = [
    // --- RECOVERY ---
    {
        id: 'rec-1',
        name: 'Active Recovery',
        description: 'A light spin to help your muscles recover.',
        category: 'Recovery',
        steps: [
            { type: 'steady', duration: 300, targetPowerPercent: 0.4, description: 'Warm Up' },
            { type: 'steady', duration: 1200, targetPowerPercent: 0.5, description: 'Main Set' },
            { type: 'steady', duration: 300, targetPowerPercent: 0.4, description: 'Cool Down' },
        ]
    },
    // --- ENDURANCE ---
    {
        id: 'end-1',
        name: 'Classic Endurance',
        description: 'A steady 60-minute ride in Zone 2 to build your aerobic base.',
        category: 'Endurance',
        steps: [
            { type: 'ramp', duration: 600, startPowerPercent: 0.5, targetPowerPercent: 0.65, description: 'Warm Up' },
            { type: 'steady', duration: 2400, targetPowerPercent: 0.7, description: 'Endurance Block' },
            { type: 'ramp', duration: 600, startPowerPercent: 0.65, targetPowerPercent: 0.5, description: 'Cool Down' },
        ]
    },
    // --- SWEET SPOT ---
    {
        id: 'ss-1',
        name: '2x20 Sweet Spot',
        description: 'The bread and butter of FTP building. Two 20-minute efforts at 90% FTP.',
        category: 'Sweet Spot',
        steps: [
            { type: 'ramp', duration: 600, startPowerPercent: 0.5, targetPowerPercent: 0.75, description: 'Warm Up' },
            { type: 'steady', duration: 1200, targetPowerPercent: 0.90, description: 'Sweet Spot 1' },
            { type: 'steady', duration: 300, targetPowerPercent: 0.55, description: 'Recovery' },
            { type: 'steady', duration: 1200, targetPowerPercent: 0.90, description: 'Sweet Spot 2' },
            { type: 'ramp', duration: 600, startPowerPercent: 0.75, targetPowerPercent: 0.5, description: 'Cool Down' },
        ]
    },
    // --- THRESHOLD ---
    {
        id: 'thr-1',
        name: '3x10 Threshold',
        description: 'Push your limits with three 10-minute intervals at your functional threshold power.',
        category: 'Threshold',
        steps: [
            { type: 'ramp', duration: 600, startPowerPercent: 0.5, targetPowerPercent: 0.8, description: 'Warm Up' },
            { type: 'steady', duration: 600, targetPowerPercent: 1.0, description: 'Threshold 1' },
            { type: 'steady', duration: 300, targetPowerPercent: 0.55, description: 'Recovery' },
            { type: 'steady', duration: 600, targetPowerPercent: 1.0, description: 'Threshold 2' },
            { type: 'steady', duration: 300, targetPowerPercent: 0.55, description: 'Recovery' },
            { type: 'steady', duration: 600, targetPowerPercent: 1.0, description: 'Threshold 3' },
            { type: 'ramp', duration: 600, startPowerPercent: 0.8, targetPowerPercent: 0.5, description: 'Cool Down' },
        ]
    },
     // --- TESTING ---
    {
        id: 'ftp-1',
        name: 'FTP Ramp Test',
        description: 'Ramps up until exhaustion. Best 1-min power x 0.75 = est. FTP. Steps are based on your current FTP setting.',
        category: 'Testing',
        steps: [
            { type: 'ramp', duration: 300, startPowerPercent: 0.4, targetPowerPercent: 0.5, description: 'Warm Up' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.55, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.62, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.69, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.76, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.83, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.90, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 0.97, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.04, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.11, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.18, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.25, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.32, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.39, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.46, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.53, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.60, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.67, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.74, description: 'Ramp Step' },
            { type: 'steady', duration: 60, targetPowerPercent: 1.81, description: 'Ramp Step' },
            { type: 'ramp', duration: 600, startPowerPercent: 0.5, targetPowerPercent: 0.3, description: 'Cool Down' },
        ]
    },
    // --- VO2 MAX ---
    {
        id: 'vo2-1',
        name: '5x3 VO2 Max',
        description: 'Short, intense intervals to boost your top-end power and oxygen uptake.',
        category: 'VO2 Max',
        steps: [
            { type: 'ramp', duration: 900, startPowerPercent: 0.5, targetPowerPercent: 0.8, description: 'Extended Warm Up' },
            { type: 'steady', duration: 180, targetPowerPercent: 1.15, description: 'VO2 Max 1' },
            { type: 'steady', duration: 180, targetPowerPercent: 0.5, description: 'Recovery' },
            { type: 'steady', duration: 180, targetPowerPercent: 1.15, description: 'VO2 Max 2' },
            { type: 'steady', duration: 180, targetPowerPercent: 0.5, description: 'Recovery' },
            { type: 'steady', duration: 180, targetPowerPercent: 1.15, description: 'VO2 Max 3' },
            { type: 'steady', duration: 180, targetPowerPercent: 0.5, description: 'Recovery' },
            { type: 'steady', duration: 180, targetPowerPercent: 1.15, description: 'VO2 Max 4' },
            { type: 'steady', duration: 180, targetPowerPercent: 0.5, description: 'Recovery' },
            { type: 'steady', duration: 180, targetPowerPercent: 1.15, description: 'VO2 Max 5' },
            { type: 'ramp', duration: 600, startPowerPercent: 0.7, targetPowerPercent: 0.5, description: 'Cool Down' },
        ]
    },
];
