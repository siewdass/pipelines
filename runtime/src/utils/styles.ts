import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining Tailwind classes safely, managing conflicts.
 * Uses 'clsx' to handle conditional classes and 'tailwind-merge' to 
 * ensure the last applied class wins.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
