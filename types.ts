export enum AppView {
  INTRO = 'INTRO',
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  PROFILE = 'PROFILE',
  SCAN = 'SCAN',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  CABINET = 'CABINET',
  EMERGENCY = 'EMERGENCY'
}

export interface UserProfile {
  id: string;
  name: string;
  relation: 'Me' | 'Parent' | 'Child' | 'Partner' | 'Other';
  avatar: string; // Icon ID like 'smile', 'heart', 'user'
  themeColor: string; // Gradient class or hex
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  conditions: string[]; // e.g., "Asthma", "High BP"
  allergies: string[]; // e.g., "Penicillin"
  currentMeds: string[]; // e.g., "Aspirin"
}

export enum SafetyStatus {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER',
  UNKNOWN = 'UNKNOWN'
}

export interface DrugAnalysis {
  drugName: string;
  activeIngredient: string;
  purpose: string;
  status: SafetyStatus;
  headline: string; // "STOP! High Risk" or "Safe to take"
  reasoning: string;
  simpleExplanation?: string; // New: Explain Like a Doctor
  interactionScore?: number; // New: 0-100 for Radar
  sideEffects: string[];
  safeAlternatives?: string[]; // New: Suggested safer options
  dosageWarning?: string;
  timestamp: number;
  fdaSource?: boolean; // Whether OpenFDA data was used
  contraindicationsDetected?: string[]; // Specific conditions matched
  expiryDate?: string; // User set or AI estimated
}