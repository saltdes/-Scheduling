
export const ShiftType = {
  DAY: 'DAY',
  EVENING: 'EVENING',
  NIGHT: 'NIGHT',
  COMP_LEAVE: 'COMP_LEAVE',
  ANNUAL_LEAVE: 'ANNUAL_LEAVE',
  SICK_LEAVE: 'SICK_LEAVE',
  PERSONAL_LEAVE: 'PERSONAL_LEAVE',
  OFF: 'OFF'
} as const;

export type ShiftType = typeof ShiftType[keyof typeof ShiftType] | string;

export interface ShiftEntry {
  date: string; // YYYY-MM-DD
  type: ShiftType;
  note?: string;
}

export type ShiftMap = Record<string, ShiftType>;

export interface ShiftConfig {
  id: ShiftType;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export interface LeaveRecord {
  id: string;
  type: ShiftType;
  startDate: string;
  endDate: string;
  duration: number;
  note?: string;
  createdAt: number;
}

export interface AppSettings {
  enableReminders: boolean;
  lastReminderDate?: string;
}

export interface BackupData {
  shifts: ShiftMap;
  configs: Record<ShiftType, ShiftConfig>;
  leaves: LeaveRecord[];
  settings?: AppSettings;
  timestamp: number;
  version: string;
}

export enum AppTab {
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  AI_ASSISTANT = 'AI_ASSISTANT'
}
