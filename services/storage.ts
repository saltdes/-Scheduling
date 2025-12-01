
import { ShiftMap, ShiftType, ShiftConfig, LeaveRecord, AppSettings } from '../types';
import { DEFAULT_SHIFT_CONFIGS } from '../constants';

const SHIFT_STORAGE_KEY = 'shift_master_data';
const CONFIG_STORAGE_KEY = 'shift_master_configs';
const LEAVE_STORAGE_KEY = 'shift_master_leaves';
const SETTINGS_STORAGE_KEY = 'shift_master_settings';

export const saveShifts = (shifts: ShiftMap): void => {
  try {
    localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(shifts));
  } catch (error) {
    console.error('Failed to save shifts', error);
  }
};

export const loadShifts = (): ShiftMap => {
  try {
    const data = localStorage.getItem(SHIFT_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load shifts', error);
    return {};
  }
};

export const saveConfigs = (configs: Record<ShiftType, ShiftConfig>): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save configs', error);
  }
};

export const loadConfigs = (): Record<ShiftType, ShiftConfig> => {
  try {
    const data = localStorage.getItem(CONFIG_STORAGE_KEY);
    return data ? { ...DEFAULT_SHIFT_CONFIGS, ...JSON.parse(data) } : DEFAULT_SHIFT_CONFIGS;
  } catch (error) {
    console.error('Failed to load configs', error);
    return DEFAULT_SHIFT_CONFIGS;
  }
};

export const saveLeaveRecords = (records: LeaveRecord[]): void => {
  try {
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save leave records', error);
  }
};

export const loadLeaveRecords = (): LeaveRecord[] => {
  try {
    const data = localStorage.getItem(LEAVE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load leave records', error);
    return [];
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return data ? JSON.parse(data) : { enableReminders: false };
  } catch (error) {
    console.error('Failed to load settings', error);
    return { enableReminders: false };
  }
};
