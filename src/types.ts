export type ActivityType = 'DIRECT_COMPARE' | 'UNIT_MEASURE' | 'RULER_MEASURE' | 'LENGTH_BOOK';

export interface MeasurableObject {
  id: string;
  name: string;
  emoji: string;
  lengthCm: number; // The physical length in cm (for interactive calculation)
  color: string;    // Accent color
  description: string;
}

export interface UnitType {
  id: string;
  name: string;
  emoji: string;
  singularName: string;
  sizeCm: number; // How long this unit is in cm (e.g. clip = 2.5cm)
  color: string;
}

export interface SavedRecord {
  id: string;
  timestamp: string;
  objectName: string;
  objectEmoji: string;
  estimatedCm: number;
  measuredCm: number;
  differenceCm: number;
  unitNotes?: string; // e.g. "클립 3개보다 조금 더 길어요"
  studentNote: string; // Dynamic note written by the student
}
