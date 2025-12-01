
import React, { useState, useEffect } from 'react';
import { Calendar, PieChart, MessageSquare } from 'lucide-react';
import { AppTab, ShiftMap, ShiftType, ShiftConfig, LeaveRecord, BackupData, AppSettings } from './types';
import { loadShifts, saveShifts, loadConfigs, saveConfigs, loadLeaveRecords, saveLeaveRecords, loadSettings, saveSettings } from './services/storage';
import { DEFAULT_SHIFT_CONFIGS } from './constants';
import { checkAndSendDailyReminder } from './services/notificationService';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import ChatView from './components/ChatView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CALENDAR);
  const [shifts, setShifts] = useState<ShiftMap>({});
  const [shiftConfigs, setShiftConfigs] = useState<Record<ShiftType, ShiftConfig>>(DEFAULT_SHIFT_CONFIGS);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ enableReminders: false });

  // Initial Load
  useEffect(() => {
    const loadedShifts = loadShifts();
    const loadedConfigs = loadConfigs();
    const loadedLeaves = loadLeaveRecords();
    const loadedSettings = loadSettings();

    setShifts(loadedShifts);
    setShiftConfigs(loadedConfigs);
    setLeaveRecords(loadedLeaves);
    setSettings(loadedSettings);

    // Check for notifications
    checkAndSendDailyReminder(loadedShifts, loadedConfigs, loadedSettings, handleUpdateSettings);
  }, []);

  // Handler to update a single shift
  const handleUpdateShift = (date: string, type: ShiftType) => {
    setShifts(prev => {
      const next = { ...prev };
      if (type === ShiftType.OFF) {
        delete next[date];
      } else {
        next[date] = type;
      }
      saveShifts(next);
      return next;
    });
  };

  // Handler to batch update shifts (for copy/paste functionality)
  const handleBatchUpdateShifts = (updates: Record<string, ShiftType>) => {
    setShifts(prev => {
      const next = { ...prev };
      Object.entries(updates).forEach(([date, type]) => {
        if (type === ShiftType.OFF) {
          delete next[date];
        } else {
          next[date] = type;
        }
      });
      saveShifts(next);
      return next;
    });
  };

  // Handler to update shift configurations
  const handleUpdateConfig = (type: ShiftType, newConfig: ShiftConfig) => {
    setShiftConfigs(prev => {
      const next = { ...prev, [type]: newConfig };
      saveConfigs(next);
      return next;
    });
  };

  // Handler to delete a custom shift configuration
  const handleDeleteConfig = (type: ShiftType) => {
    setShiftConfigs(prev => {
      const next = { ...prev };
      delete next[type];
      saveConfigs(next);
      return next;
    });

    // Cleanup shifts using this type
    setShifts(prev => {
      const next = { ...prev };
      let changed = false;
      Object.entries(next).forEach(([date, t]) => {
        if (t === type) {
          delete next[date];
          changed = true;
        }
      });
      if (changed) saveShifts(next);
      return next;
    });
  };

  // Leave Handlers
  const handleAddLeave = (record: LeaveRecord, shiftUpdates: Record<string, ShiftType>) => {
    // 1. Update Leave Records
    setLeaveRecords(prev => {
      const next = [...prev, record];
      saveLeaveRecords(next);
      return next;
    });

    // 2. Update Calendar Shifts
    handleBatchUpdateShifts(shiftUpdates);
  };

  const handleDeleteLeave = (id: string) => {
    setLeaveRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      saveLeaveRecords(next);
      return next;
    });
  };

  // Settings Handler
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Restore Handler
  const handleRestoreData = (data: BackupData) => {
    if (data.shifts) {
      setShifts(data.shifts);
      saveShifts(data.shifts);
    }
    if (data.configs) {
      setShiftConfigs(data.configs);
      saveConfigs(data.configs);
    }
    if (data.leaves) {
      setLeaveRecords(data.leaves);
      saveLeaveRecords(data.leaves);
    }
    if (data.settings) {
      setSettings(data.settings);
      saveSettings(data.settings);
    }
    alert('資料還原成功！');
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === AppTab.CALENDAR && (
          <CalendarView 
            shifts={shifts}
            shiftConfigs={shiftConfigs} 
            leaveRecords={leaveRecords}
            settings={settings}
            onUpdateShift={handleUpdateShift}
            onBatchUpdateShifts={handleBatchUpdateShifts} 
            onUpdateConfig={handleUpdateConfig}
            onDeleteConfig={handleDeleteConfig}
            onAddLeave={handleAddLeave}
            onDeleteLeave={handleDeleteLeave}
            onUpdateSettings={handleUpdateSettings}
            onRestoreData={handleRestoreData}
          />
        )}
        {activeTab === AppTab.STATS && (
          <StatsView shifts={shifts} shiftConfigs={shiftConfigs} />
        )}
        {activeTab === AppTab.AI_ASSISTANT && (
          <ChatView shifts={shifts} shiftConfigs={shiftConfigs} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around z-50 pb-safe">
        <button
          onClick={() => setActiveTab(AppTab.CALENDAR)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            activeTab === AppTab.CALENDAR ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Calendar size={24} />
          <span className="text-xs mt-1 font-medium">班表</span>
        </button>

        <button
          onClick={() => setActiveTab(AppTab.STATS)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            activeTab === AppTab.STATS ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PieChart size={24} />
          <span className="text-xs mt-1 font-medium">統計</span>
        </button>

        <button
          onClick={() => setActiveTab(AppTab.AI_ASSISTANT)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            activeTab === AppTab.AI_ASSISTANT ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1 font-medium">AI 助理</span>
        </button>
      </div>
    </div>
  );
};

export default App;
