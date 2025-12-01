import { ShiftType, ShiftConfig } from './types';
import { 
  Sun, Moon, Sunrise, Coffee, Palmtree, Ghost, Copy, Check, X, ClipboardPaste, ArrowRight, Settings,
  Briefcase, Star, Heart, Zap, Umbrella, Home, User, Clock, AlertCircle, Plane, Thermometer, CalendarPlus,
  Cloud, CloudUpload, CloudDownload, LogOut, LogIn, RefreshCw, Share2, Download, Image as ImageIcon, Calendar as CalendarIcon
} from 'lucide-react';
import React from 'react';

export const COLOR_THEMES = {
  amber: { color: 'bg-amber-500', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  blue: { color: 'bg-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  purple: { color: 'bg-purple-700', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  emerald: { color: 'bg-emerald-500', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  pink: { color: 'bg-pink-500', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
  red: { color: 'bg-red-500', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  cyan: { color: 'bg-cyan-500', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
  indigo: { color: 'bg-indigo-500', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  teal: { color: 'bg-teal-500', bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
  rose: { color: 'bg-rose-500', bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
  gray: { color: 'bg-gray-400', bgColor: 'bg-gray-100', textColor: 'text-gray-500' },
};

export const AVAILABLE_ICONS = [
  'Sun', 'Sunrise', 'Moon', 'Coffee', 'Palmtree', 'Ghost',
  'Briefcase', 'Star', 'Heart', 'Zap', 'Umbrella', 'Home', 'User', 'Clock', 'AlertCircle',
  'Plane', 'Thermometer', 'CalendarPlus'
];

export const DEFAULT_SHIFT_CONFIGS: Record<ShiftType, ShiftConfig> = {
  [ShiftType.DAY]: {
    id: ShiftType.DAY,
    label: '白班',
    ...COLOR_THEMES.amber,
    icon: 'Sun'
  },
  [ShiftType.EVENING]: {
    id: ShiftType.EVENING,
    label: '小夜',
    ...COLOR_THEMES.blue,
    icon: 'Sunrise'
  },
  [ShiftType.NIGHT]: {
    id: ShiftType.NIGHT,
    label: '大夜',
    ...COLOR_THEMES.purple,
    icon: 'Moon'
  },
  [ShiftType.COMP_LEAVE]: {
    id: ShiftType.COMP_LEAVE,
    label: '補休',
    ...COLOR_THEMES.emerald,
    icon: 'Coffee'
  },
  [ShiftType.ANNUAL_LEAVE]: {
    id: ShiftType.ANNUAL_LEAVE,
    label: '特休',
    ...COLOR_THEMES.pink,
    icon: 'Palmtree'
  },
  [ShiftType.SICK_LEAVE]: {
    id: ShiftType.SICK_LEAVE,
    label: '病假',
    ...COLOR_THEMES.red,
    icon: 'Thermometer'
  },
  [ShiftType.PERSONAL_LEAVE]: {
    id: ShiftType.PERSONAL_LEAVE,
    label: '事假',
    ...COLOR_THEMES.teal,
    icon: 'User'
  },
  [ShiftType.OFF]: {
    id: ShiftType.OFF,
    label: '清除',
    ...COLOR_THEMES.gray,
    icon: 'Ghost'
  }
};

export const getIconComponent = (iconName: string, size: number = 20) => {
  switch (iconName) {
    case 'Sun': return <Sun size={size} />;
    case 'Moon': return <Moon size={size} />;
    case 'Sunrise': return <Sunrise size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Palmtree': return <Palmtree size={size} />;
    case 'Ghost': return <Ghost size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Star': return <Star size={size} />;
    case 'Heart': return <Heart size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'Umbrella': return <Umbrella size={size} />;
    case 'Home': return <Home size={size} />;
    case 'User': return <User size={size} />;
    case 'Clock': return <Clock size={size} />;
    case 'AlertCircle': return <AlertCircle size={size} />;
    case 'Plane': return <Plane size={size} />;
    case 'Thermometer': return <Thermometer size={size} />;
    case 'CalendarPlus': return <CalendarPlus size={size} />;
    
    // UI Icons
    case 'Copy': return <Copy size={size} />;
    case 'Check': return <Check size={size} />;
    case 'X': return <X size={size} />;
    case 'ClipboardPaste': return <ClipboardPaste size={size} />;
    case 'ArrowRight': return <ArrowRight size={size} />;
    case 'Settings': return <Settings size={size} />;
    
    // Cloud Icons
    case 'Cloud': return <Cloud size={size} />;
    case 'CloudUpload': return <CloudUpload size={size} />;
    case 'CloudDownload': return <CloudDownload size={size} />;
    case 'LogOut': return <LogOut size={size} />;
    case 'LogIn': return <LogIn size={size} />;
    case 'RefreshCw': return <RefreshCw size={size} />;

    // Export Icons
    case 'Share2': return <Share2 size={size} />;
    case 'Download': return <Download size={size} />;
    case 'Image': return <ImageIcon size={size} />;
    case 'Calendar': return <CalendarIcon size={size} />;

    default: return <Ghost size={size} />;
  }
};

export const WEEKS_ZH = ['日', '一', '二', '三', '四', '五', '六'];