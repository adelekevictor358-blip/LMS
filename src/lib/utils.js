import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// MTU course-numbering convention: the last digit of a course code is odd for
// first-semester courses and even for second-semester courses
// (e.g. CSC 101 → 1st, MTH 102 → 2nd, PHY 104 → 2nd).
// Returns '1st' | '2nd', or null when the code has no digit. Used as a fallback
// when a course has no explicit `semester` field, and as a smart default when
// provisioning a course. The explicit `semester` field still wins where present
// (e.g. MTH 499 is reused for Research Project I and II).
export function semesterFromCode(code) {
  const digits = String(code || "").match(/\d/g);
  if (!digits || digits.length === 0) return null;
  return Number(digits[digits.length - 1]) % 2 === 0 ? "2nd" : "1st";
}

// Academic-session + level progression. A session is "YYYY/YYYY" (e.g. "2025/2026").
// Provisioning the next session rolls both years forward and advances each student
// one level: 100L → 200L → 300L → 400L → Graduated.
export const LEVEL_ORDER = ["100L", "200L", "300L", "400L"];

export function nextSession(session) {
  const m = String(session || "").match(/(\d{4})\s*\/\s*(\d{4})/);
  if (!m) return session;
  return `${Number(m[1]) + 1}/${Number(m[2]) + 1}`;
}

export function nextLevel(level) {
  const i = LEVEL_ORDER.indexOf(level);
  if (i === -1) return level; // unknown / already 'Graduated' stays put
  return i < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[i + 1] : "Graduated";
}
