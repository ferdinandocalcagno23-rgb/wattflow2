import { POWER_ZONES } from '@/lib/constants';
import type { CalculatedPowerZone } from '@/types';

/**
 * Calculates power zones in watts based on a given FTP.
 * @param ftp - Functional Threshold Power in watts.
 * @returns A record of calculated power zones.
 */
export function calculateZones(ftp: number): Record<string, CalculatedPowerZone> {
  const calculatedZones: Record<string, CalculatedPowerZone> = {};
  for (const key in POWER_ZONES) {
    const zone = POWER_ZONES[key];
    calculatedZones[key] = {
      ...zone,
      watts: [
        Math.round((zone.percentage[0] / 100) * ftp),
        Math.round((zone.percentage[1] / 100) * ftp),
      ],
    };
  }
  return calculatedZones;
}

/**
 * Finds the corresponding power zone for a given power value.
 * @param power - Power in watts.
 * @param ftp - Functional Threshold Power in watts.
 * @returns The key of the power zone (e.g., 'Z1', 'Z2').
 */
export function getZoneByPower(power: number, ftp: number): string {
  if (ftp <= 0) return 'Z1';
  const percentage = (power / ftp) * 100;
  for (const key in POWER_ZONES) {
    const zone = POWER_ZONES[key];
    if (percentage >= zone.percentage[0] && percentage <= zone.percentage[1]) {
      return key;
    }
  }
  return 'Z6'; // Default to Z6 if above defined zones
}
