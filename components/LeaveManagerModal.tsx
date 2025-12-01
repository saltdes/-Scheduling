import React, { useState } from 'react';
import { ShiftType, ShiftConfig, LeaveRecord, ShiftMap } from '../types';
import { getIconComponent } from '../constants';
import { Trash2, CalendarPlus, History, ArrowRight } from 'lucide-react';

interface LeaveManagerModalProps {
  configs: Record<ShiftType, ShiftConfig>;
  leaveRecords: LeaveRecord[];
  onAddLeave: (record: LeaveRecord, shiftUpdates: Record<string, ShiftType>) => void;
  onDeleteLeave: (id: string) => void;
  onClose: () => void;
}

const LeaveManagerModal: React.FC<LeaveManagerModalProps> = ({ 
  configs, 
  leaveRecords, 
  onAddLeave, 
  onDeleteLeave, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'APPLY' | 'HISTORY'>('APPLY');
  
  // Form State
  const [selectedType, setSelectedType] = useState<ShiftType>(ShiftType.ANNUAL_LEAVE);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  // Helper to calculate days difference
  const calculateDuration = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1; // Inclusive
  };

  const handleSubmit = () => {
    if (new Date(startDate) > new Date(endDate)) {
      alert("結束日期不能早於開始日期");
      return;
    }

    const duration = calculateDuration(startDate, endDate);
    
    // Create Record
    const newRecord: LeaveRecord = {
      id: Date.now().toString(),
      type: selectedType,
      startDate,
      endDate,
      duration,
      note,
      createdAt: Date.now()
    };

    // Create Shift Updates
    const updates: Record<string, ShiftType> = {};
    const curr = new Date(startDate);
    const end = new Date(endDate);
    
    while (curr <= end) {
      const dStr = curr.toISOString().slice(0, 10);
      updates[dStr] = selectedType;
      curr.setDate(curr.getDate() + 1);
    }

    onAddLeave(newRecord, updates);
    setActiveTab('HISTORY');
    
    // Reset form slightly but keep dates for convenience
    setNote('');
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return start;
    return `${start} ~ ${end}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 text-gray-800">
            <CalendarPlus size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold">休假管理</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-50 gap-2 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('APPLY')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'APPLY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            申請休假
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'HISTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            紀錄 ({leaveRecords.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {activeTab === 'APPLY' ? (
            <div className="space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">假別</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(configs)
                    .filter(c => c.id !== ShiftType.DAY && c.id !== ShiftType.EVENING && c.id !== ShiftType.NIGHT && c.id !== ShiftType.OFF)
                    .map(config => (
                      <button
                        key={config.id}
                        onClick={() => setSelectedType(config.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          selectedType === config.id 
                            ? `${config.bgColor} ${config.textColor} border-current` 
                            : 'bg-gray-50 border-transparent text-gray-500'
                        }`}
                      >
                         {getIconComponent(config.icon, 20)}
                         <span className="text-xs font-bold mt-1">{config.label}</span>
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">開始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">結束日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                <span className="text-sm text-blue-800 font-medium">預計天數</span>
                <span className="text-xl font-bold text-blue-600">
                  {calculateDuration(startDate, endDate)} 天
                </span>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                確認申請 <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <History size={32} className="mb-2 opacity-50" />
                  <p>尚無休假紀錄</p>
                </div>
              ) : (
                leaveRecords.slice().sort((a,b) => b.createdAt - a.createdAt).map(record => {
                  const config = configs[record.type];
                  return (
                    <div key={record.id} className="relative group p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                      <div className={`w-1 h-12 rounded-full ${config.color} shrink-0`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                           <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${config.bgColor} ${config.textColor}`}>
                               {config.label}
                             </span>
                             <span className="text-xs text-gray-400">
                               {new Date(record.createdAt).toLocaleDateString()}
                             </span>
                           </div>
                           <button 
                             onClick={() => onDeleteLeave(record.id)}
                             className="text-gray-400 hover:text-red-500 p-1"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm mb-0.5">
                          {formatDateRange(record.startDate, record.endDate)}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          共 {record.duration} 天
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagerModal;