import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DIRECTIONS = [
  'dir_N', 'dir_NNE', 'dir_NE', 'dir_ENE', 'dir_E', 'dir_ESE', 'dir_SE', 'dir_SSE',
  'dir_S', 'dir_SSW', 'dir_SW', 'dir_WSW', 'dir_W', 'dir_WNW', 'dir_NW', 'dir_NNW'
] as const;

export function getCompassDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return DIRECTIONS[index];
}
