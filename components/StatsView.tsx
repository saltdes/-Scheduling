import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ShiftMap, ShiftType, ShiftConfig } from '../types';

interface StatsViewProps {
  shifts: ShiftMap;
  shiftConfigs: Record<ShiftType, ShiftConfig>;
}

const StatsView: React.FC<StatsViewProps> = ({ shifts, shiftConfigs }) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const data = useMemo(() => {
    // Filter for current month roughly (or all time if preferred, but usually month is better)
    // Let's do current month analysis
    const counts: Record<string, number> = {};
    
    // Initialize counts
    Object.keys(shiftConfigs).forEach(key => {
      if (key !== ShiftType.OFF) counts[key] = 0;
    });

    Object.entries(shifts).forEach(([date, type]) => {
      if (date.startsWith(currentMonth) && type !== ShiftType.OFF) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([key, value]) => {
      const config = shiftConfigs[key as ShiftType];
      // Extract color hex approximation. Recharts needs real hex colors.
      // This is a mapping from Tailwind class names to generic Hex values for the chart
      let hex = '#ccc';
      if (config.color.includes('amber')) hex = '#f59e0b';
      else if (config.color.includes('blue')) hex = '#3b82f6';
      else if (config.color.includes('purple')) hex = '#7e22ce';
      else if (config.color.includes('emerald')) hex = '#10b981';
      else if (config.color.includes('pink')) hex = '#ec4899';
      else if (config.color.includes('red')) hex = '#ef4444';
      else if (config.color.includes('cyan')) hex = '#06b6d4';
      else if (config.color.includes('indigo')) hex = '#6366f1';
      else if (config.color.includes('gray')) hex = '#9ca3af';

      return {
        name: config.label,
        value: value,
        hex: hex
      };
    });
  }, [shifts, currentMonth, shiftConfigs]);

  const totalShifts = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-4 bg-white h-full flex flex-col overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">本月統計 ({currentMonth})</h2>
      
      {totalShifts === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <p>這個月還沒有排班紀錄喔！</p>
        </div>
      ) : (
        <>
          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hex} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.map((item) => (
               <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.hex }}></div>
                   <span className="font-medium text-gray-700">{item.name}</span>
                 </div>
                 <span className="font-bold text-gray-900">{item.value} 天</span>
               </div>
            ))}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">排班小計</h4>
              <p className="text-sm text-blue-600">本月共已安排 {totalShifts} 個班次。</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsView;