
export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  standardRange?: string;
  status: 'Normal' | 'High' | 'Low' | 'Unknown';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timing: ('Morning' | 'Afternoon' | 'Night')[];
  instructions?: string;
  type?: 'Tablet' | 'Syrup' | 'Injection' | 'Other';
}

export interface SafetyAlert {
  medicationName: string;
  severity: 'High' | 'Medium' | 'Low';
  type: 'Allergy' | 'Interaction' | 'Contraindication';
  message: string;
}

export interface MedicalRecord {
  id: string;
  _id?: string; // For MongoDB compatibility
  userId?: string; // For Database linking
  title: string;
  date: string; // ISO Date string
  type: 'Lab Report' | 'Prescription' | 'Other';
  doctorName?: string;
  facility?: string;
  summary: string;
  bodyPart?: 'Head' | 'Chest' | 'Abdomen' | 'Limbs' | 'Back' | 'General';
  metrics: HealthMetric[];
  medications?: Medication[];
  safetyAlerts?: SafetyAlert[];
  originalFileName: string;
  fileUrl?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  unit: string;
  isProjection?: boolean;
}

export interface HealthAnalysis {
  wellnessScore: number;
  scoreBreakdown: {
    adherence: number;
    vitalStability: number;
    preventiveScreenings: number;
    recordCompleteness: number;
  };
  summary: string;
  risks: {
    condition: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
  }[];
  recommendations: string[];
  missingScreenings: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RECORDS = 'RECORDS',
  UPLOAD = 'UPLOAD',
  DETAILS = 'DETAILS',
  ASSISTANT = 'ASSISTANT',
  MEDICATIONS = 'MEDICATIONS',
  PROFILE = 'PROFILE',
  INSIGHTS = 'INSIGHTS',
  BODY_MAP = 'BODY_MAP',
  LAB_COMPARISON = 'LAB_COMPARISON',
  HEALTH_JOURNEY = 'HEALTH_JOURNEY',
  DOCTOR_SUMMARY = 'DOCTOR_SUMMARY'
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  type: 'Primary' | 'Secondary';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  dob: string;
  weight: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  avatarUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profile?: UserProfile;
  isVerified?: boolean; // New field
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  simulated?: boolean;
  verificationToken?: string; // For simulation display
}

export interface LoginCredentials {
  email: string;
  password: string;
}
