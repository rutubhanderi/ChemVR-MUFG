import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse a simple chemical formula like C2H6O into element counts
export function parseFormula(formula: string): Record<string, number> {
  const counts: Record<string, number> = {}
  const regex = /([A-Z][a-z]?)(\d*)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(formula)) !== null) {
    const element = match[1]
    const num = match[2] ? parseInt(match[2], 10) : 1
    counts[element] = (counts[element] || 0) + num
  }
  return counts
}

export function areFormulasEquivalent(a: string, b: string): boolean {
  const ca = parseFormula(a)
  const cb = parseFormula(b)
  const keys = new Set([...Object.keys(ca), ...Object.keys(cb)])
  for (const k of keys) {
    if ((ca[k] || 0) !== (cb[k] || 0)) return false
  }
  return true
}
