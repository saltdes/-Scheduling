import React from 'react';
import { ShiftType, ShiftConfig } from '../types';
import { getIconComponent } from '../constants';

interface ShiftSelectorProps {
  shiftConfigs: Record<ShiftType, ShiftConfig>;
  onSelect: (type: ShiftType) => void;
  selectedDate: string | null;
  onClose: () => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shiftConfigs, onSelect, selectedDate, onClose }) => {
  if (!selectedDate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm pt-20" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white rounded-t-2xl p-6 pb-12 shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            設定 {selectedDate} 班別
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {Object.values(shiftConfigs).map((config) => {
             // Don't show "OFF" as a primary colored button, style it differently or keep consistent
             const isOff = config.id === ShiftType.OFF;
             return (
              <button
                key={config.id}
                onClick={() => onSelect(config.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-transform active:scale-95 ${
                  isOff ? 'bg-gray-100 border-2 border-dashed border-gray-300' : config.bgColor
                }`}
              >
                <div className={`mb-2 ${config.textColor}`}>
                  {getIconComponent(config.icon, 28)}
                </div>
                <span className={`text-sm font-medium ${config.textColor}`}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShiftSelector;