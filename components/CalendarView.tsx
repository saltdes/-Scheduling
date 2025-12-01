
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, X, ClipboardPaste, ArrowRight, Settings, CalendarPlus, Share2 } from 'lucide-react';
import { ShiftMap, ShiftType, ShiftConfig, LeaveRecord, BackupData, AppSettings } from '../types';
import { WEEKS_ZH } from '../constants';
import ShiftSelector from './ShiftSelector';
import ShiftSettingsModal from './ShiftSettingsModal';
import LeaveManagerModal from './LeaveManagerModal';
import ExportModal from './ExportModal';

interface CalendarViewProps {
  shifts: ShiftMap;
  shiftConfigs: Record<ShiftType, ShiftConfig>;
  leaveRecords: LeaveRecord[];
  settings: AppSettings;
  onUpdateShift: (date: string, type: ShiftType) => void;
  onBatchUpdateShifts: (updates: Record<string, ShiftType>) => void;
  onUpdateConfig: (type: ShiftType, newConfig: ShiftConfig) => void;
  onDeleteConfig: (type: ShiftType) => void;
  onAddLeave: (record: LeaveRecord, updates: Record<string, ShiftType>) => void;
  onDeleteLeave: (id: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreData: (data: BackupData) => void;
}

type Mode = 'VIEW' | 'SELECT_START' | 'SELECTING' | 'CONFIRM_COPY' | 'PASTE_TARGET';

const CalendarView: React.FC<CalendarViewProps> = ({ 
  shifts, 
  shiftConfigs,
  leaveRecords,
  settings,
  onUpdateShift, 
  onBatchUpdateShifts,
  onUpdateConfig,
  onDeleteConfig,
  onAddLeave,
  onDeleteLeave,
  onUpdateSettings,
  onRestoreData
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveManager, setShowLeaveManager] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // Copy/Paste State
  const [mode, setMode] = useState<Mode>('VIEW');
  const [isDragging, setIsDragging] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [clipboard, setClipboard] = useState<ShiftType[]>([]);
  const [pasteTargetDate, setPasteTargetDate] = useState<Date | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calendar generation logic
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [year, month]);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const resetSelectionMode = () => {
    setMode('VIEW');
    setRangeStart(null);
    setRangeEnd(null);
    setClipboard([]);
    setPasteTargetDate(null);
    setIsDragging(false);
  };

  // --- Pointer Event Handlers for Drag Selection ---

  const handlePointerDown = (e: React.PointerEvent, date: Date) => {
    if (mode === 'VIEW') {
      // Normal click behavior handled by onClick
      return; 
    }
    
    if (mode === 'PASTE_TARGET') {
      // Paste click handled by onClick
      return;
    }

    // Start Selection (Copy Mode)
    e.preventDefault(); // Prevent default touch actions
    // @ts-ignore
    e.target.releasePointerCapture?.(e.pointerId); // Release capture so we can use elementFromPoint
    
    setMode('SELECTING');
    setIsDragging(true);
    setRangeStart(date);
    setRangeEnd(date);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || mode !== 'SELECTING') return;

    // Use elementFromPoint to find the date cell under the finger/cursor
    // This works better than onPointerEnter for touch dragging across elements
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const dateCell = element?.closest('[data-date]');
    const dateStr = dateCell?.getAttribute('data-date');

    if (dateStr) {
      const newDate = new Date(dateStr);
      // Only update if it's a valid date and different from current end
      if (!rangeEnd || newDate.getTime() !== rangeEnd.getTime()) {
        setRangeEnd(newDate);
      }
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setMode('CONFIRM_COPY');
    }
  };

  // Global pointer up to catch drag release outside the grid
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setMode('CONFIRM_COPY');
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [isDragging]);

  // --- Click Handlers (View & Paste) ---

  const handleDateClick = (date: Date | null) => {
    if (!date) return;

    if (mode === 'VIEW') {
      setSelectedDateStr(formatDate(date));
    } 
    else if (mode === 'PASTE_TARGET') {
      setPasteTargetDate(date);
    }
    // Note: Selection clicks are handled by Pointer Events now
  };

  const handleCopyConfirm = () => {
    if (!rangeStart || !rangeEnd) return;

    // Normalize start/end
    let start = rangeStart;
    let end = rangeEnd;
    if (start > end) {
      [start, end] = [end, start];
    }

    // Generate clipboard data
    const newClipboard: ShiftType[] = [];
    const curr = new Date(start);
    
    // Loop through dates
    while (curr <= end) {
      const dStr = formatDate(curr);
      const type = shifts[dStr] || ShiftType.OFF; 
      newClipboard.push(type);
      curr.setDate(curr.getDate() + 1);
    }

    setClipboard(newClipboard);
    setMode('PASTE_TARGET');
  };

  const executePaste = () => {
    if (clipboard.length === 0 || !pasteTargetDate) return;

    const updates: Record<string, ShiftType> = {};
    const curr = new Date(pasteTargetDate);

    clipboard.forEach(shiftType => {
      updates[formatDate(curr)] = shiftType;
      curr.setDate(curr.getDate() + 1);
    });

    onBatchUpdateShifts(updates);
    setPasteTargetDate(null);
    // Optional: give visual feedback
  };

  const handleShiftSelect = (type: ShiftType) => {
    if (selectedDateStr) {
      onUpdateShift(selectedDateStr, type);
      setSelectedDateStr(null);
    }
  };

  // Helper to check if a date is in the selection range
  const isInRange = (date: Date) => {
    if (!rangeStart) return false;
    if (rangeEnd) {
      const start = rangeStart < rangeEnd ? rangeStart : rangeEnd;
      const end = rangeStart < rangeEnd ? rangeEnd : rangeStart;
      return date >= start && date <= end;
    }
    return date.getTime() === rangeStart.getTime();
  };

  const getSelectionDaysCount = () => {
    if (!rangeStart || !rangeEnd) return 0;
    const diff = Math.abs(rangeEnd.getTime() - rangeStart.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
  }

  return (
    <div id="calendar-capture-target" className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
           {mode !== 'VIEW' && (
             <button onClick={resetSelectionMode} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
               <X size={20} />
             </button>
           )}
           {mode === 'VIEW' && (
             <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft size={24} />
             </button>
           )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 flex flex-col items-center">
          <span>{year}年 {month + 1}月</span>
          {mode !== 'VIEW' && (
             <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${mode === 'PASTE_TARGET' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
               {mode === 'PASTE_TARGET' ? '貼上模式 (選取起始日)' : '複製模式 (拖曳選取)'}
             </span>
          )}
        </h2>

        <div className="flex items-center gap-1">
          {mode === 'VIEW' ? (
            <>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight size={24} />
              </button>
              
              {/* Share/Export Button */}
              <button 
                onClick={() => setShowExport(true)} 
                className="p-2 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                title="匯出/分享"
              >
                <Share2 size={20} />
              </button>

              <button 
                onClick={() => setMode('SELECT_START')} 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                title="複製班表"
              >
                <Copy size={20} />
              </button>
              <button 
                onClick={() => setShowLeaveManager(true)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                title="休假管理"
              >
                <CalendarPlus size={20} />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                title="設定"
              >
                <Settings size={20} />
              </button>
            </>
          ) : (
             <div className="w-10"></div> // Spacer
          )}
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKS_ZH.map((day, idx) => (
          <div key={idx} className={`py-2 text-center text-sm font-medium ${idx === 0 || idx === 6 ? 'text-red-400' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div 
        ref={gridRef}
        className={`flex-1 grid grid-cols-7 grid-rows-6 gap-[1px] bg-gray-100 p-[1px] overflow-y-auto ${
            (mode === 'SELECT_START' || mode === 'SELECTING') ? 'touch-none cursor-crosshair' : ''
        }`}
        onPointerMove={handlePointerMove}
      >
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="bg-white min-h-[80px]" />;
          }

          const dateStr = formatDate(date);
          const shiftType = shifts[dateStr];
          const config = shiftType ? shiftConfigs[shiftType] : null;
          const isToday = formatDate(new Date()) === dateStr;
          
          const inRange = isInRange(date);
          const isStart = rangeStart && date.getTime() === rangeStart.getTime();
          const isEnd = rangeEnd && date.getTime() === rangeEnd.getTime();
          
          const isPasteTarget = pasteTargetDate && date.getTime() === pasteTargetDate.getTime();

          let borderClass = "";
          if (inRange) {
             borderClass = "bg-blue-50 ring-inset ring-2 ring-blue-400 z-10";
             // Handle visual for single day selection
             if (isStart && isEnd && rangeStart?.getTime() === rangeEnd?.getTime()) {
                borderClass += " ring-blue-600 bg-blue-100";
             }
          } else if (isPasteTarget) {
            borderClass = "bg-purple-50 ring-inset ring-2 ring-purple-600 z-10";
          }

          return (
            <div
              key={dateStr}
              data-date={date.toISOString()}
              onPointerDown={(e) => handlePointerDown(e, date)}
              onClick={() => handleDateClick(date)}
              className={`bg-white min-h-[80px] p-1 flex flex-col items-center justify-start relative active:bg-gray-50 transition-all select-none ${borderClass}`}
            >
              <span className={`text-sm w-6 h-6 flex items-center justify-center rounded-full mb-1 pointer-events-none ${isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-700'}`}>
                {date.getDate()}
              </span>
              
              {config && (
                <div className={`w-full h-full flex flex-col items-center justify-center rounded-md ${config.bgColor} p-1 pointer-events-none`}>
                  <span className={`${config.textColor} font-bold text-xs`}>
                    {config.label}
                  </span>
                </div>
              )}

              {/* Selection Badge */}
              {(isStart || isEnd) && inRange && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
              {isPasteTarget && (
                 <div className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mode Action Bar (Overlay at bottom) */}
      {mode !== 'VIEW' && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl p-4 animate-slide-up z-20">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              {(mode === 'SELECT_START' || mode === 'SELECTING') && "滑動以選取範圍"}
              {mode === 'CONFIRM_COPY' && (
                <span className="flex items-center gap-1">
                  已選取 <span className="font-bold text-blue-600">{getSelectionDaysCount()}</span> 天
                </span>
              )}
              {mode === 'PASTE_TARGET' && (
                 <span className="flex items-center gap-2">
                   <ClipboardPaste size={16} className="text-purple-600" />
                   {pasteTargetDate ? `將貼上於 ${formatDate(pasteTargetDate)}` : "請點選貼上起始日"}
                 </span>
              )}
            </div>

            <div className="flex gap-2">
              {mode === 'CONFIRM_COPY' && (
                <>
                  <button 
                    onClick={() => setMode('SELECT_START')}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold"
                  >
                    重選
                  </button>
                  <button 
                    onClick={handleCopyConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-1 shadow-md hover:bg-blue-700"
                  >
                    複製 <ArrowRight size={16} />
                  </button>
                </>
              )}
              {mode === 'PASTE_TARGET' && (
                 <>
                   <button 
                     onClick={resetSelectionMode}
                     className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold"
                   >
                     結束
                   </button>
                   {pasteTargetDate && (
                     <button 
                       onClick={executePaste}
                       className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-purple-700 flex items-center gap-1"
                     >
                       貼上 <ClipboardPaste size={16} />
                     </button>
                   )}
                 </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shift Selection Modal */}
      {selectedDateStr && (
        <ShiftSelector
          shiftConfigs={shiftConfigs}
          selectedDate={selectedDateStr}
          onSelect={handleShiftSelect}
          onClose={() => setSelectedDateStr(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <ShiftSettingsModal
          configs={shiftConfigs}
          shiftsData={shifts}
          leavesData={leaveRecords}
          settings={settings}
          onUpdate={onUpdateConfig}
          onDelete={onDeleteConfig}
          onUpdateSettings={onUpdateSettings}
          onRestoreData={onRestoreData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Leave Manager Modal */}
      {showLeaveManager && (
        <LeaveManagerModal
          configs={shiftConfigs}
          leaveRecords={leaveRecords}
          onAddLeave={onAddLeave}
          onDeleteLeave={onDeleteLeave}
          onClose={() => setShowLeaveManager(false)}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          shifts={shifts}
          configs={shiftConfigs}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;
