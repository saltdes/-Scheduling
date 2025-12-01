import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { ShiftMap, ShiftType, ShiftConfig } from '../types';
import { analyzeSchedule } from '../services/geminiService';

interface ChatViewProps {
  shifts: ShiftMap;
  shiftConfigs: Record<ShiftType, ShiftConfig>;
}

const ChatView: React.FC<ChatViewProps> = ({ shifts, shiftConfigs }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Pass shiftConfigs to the service
    const result = await analyzeSchedule(shifts, currentMonth, shiftConfigs);
    
    setResponse(result);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
          <Bot size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">AI 班表助理</h2>
          <p className="text-xs text-gray-500">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
        {!response && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Sparkles size={48} className="mb-4 text-purple-200" />
            <p className="mb-2">點擊下方按鈕</p>
            <p>讓我為您分析本月班表的健康與勞動狀況</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        )}

        {response && (
          <div className="prose prose-sm prose-purple max-w-none text-gray-700 whitespace-pre-line">
            {response}
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
      >
        {isLoading ? (
          '分析中...'
        ) : (
          <>
            <Sparkles size={20} />
            一鍵分析本月班表
          </>
        )}
      </button>
    </div>
  );
};

export default ChatView;