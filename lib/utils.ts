// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes safely.
 * Accepts multiple class values and merges them intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
