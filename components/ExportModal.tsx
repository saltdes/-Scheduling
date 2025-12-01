import React from 'react';
import { ShiftMap, ShiftConfig, ShiftType } from '../types';
import { downloadICS, captureCalendarImage } from '../services/exportService';
import { Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface ExportModalProps {
  shifts: ShiftMap;
  configs: Record<ShiftType, ShiftConfig>;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ shifts, configs, onClose }) => {
  
  const handleDownloadICS = () => {
    downloadICS(shifts, configs);
    // Suggest closing, but maybe keep open to confirm
    setTimeout(onClose, 1000); 
  };

  const handleDownloadImage = () => {
    // We assume the calendar grid has ID 'calendar-grid-container'
    // We need to target a wrapper that contains the whole view ideally, 
    // or we can ask the user to view the month they want first.
    // For now, let's target the root app container or pass a ref from CalendarView.
    // However, simplest is targeting the main view ID set in CalendarView.
    captureCalendarImage('calendar-capture-target');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">匯出與分享</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-500 mb-2">
            選擇匯出方式以整合至您的數位生活：
          </p>

          <button
            onClick={handleDownloadICS}
            className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl flex items-center gap-4 group transition-all"
          >
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-blue-900">同步至手機行事曆</h4>
              <p className="text-xs text-blue-600 mt-1">
                下載 .ics 檔，支援 Widget 顯示
              </p>
            </div>
            <ArrowRight size={20} className="text-blue-300" />
          </button>

          <button
            onClick={handleDownloadImage}
            className="w-full p-4 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl flex items-center gap-4 group transition-all"
          >
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-purple-900">下載班表圖片</h4>
              <p className="text-xs text-purple-600 mt-1">
                將當前畫面存成 PNG，方便分享
              </p>
            </div>
            <ArrowRight size={20} className="text-purple-300" />
          </button>
        </div>
        
        <div className="p-3 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">
                提示：若要使用桌面小工具 (Widget)，請選擇「同步至手機行事曆」。
            </p>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;