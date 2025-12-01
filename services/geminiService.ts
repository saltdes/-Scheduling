import { GoogleGenAI } from "@google/genai";
import { ShiftMap, ShiftType, ShiftConfig } from '../types';

// Helper to check status
// In Vite, we use import.meta.env instead of process.env
export const hasApiKey = !!import.meta.env.VITE_API_KEY;

export const analyzeSchedule = async (
  shifts: ShiftMap, 
  currentMonthStr: string,
  shiftConfigs: Record<ShiftType, ShiftConfig>
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
      return "請先設定 Gemini API Key 才能使用 AI 助理。\n\n請在 Vercel/Netlify 設定環境變數：VITE_API_KEY";
    }

    // Lazy initialization - only create client when needed
    const ai = new GoogleGenAI({ apiKey });

    // Filter shifts for the current month context
    const relevantShifts = Object.entries(shifts)
      .filter(([date]) => date.startsWith(currentMonthStr))
      .map(([date, type]) => `${date}: ${shiftConfigs[type].label}`)
      .join('\n');

    const legend = Object.values(shiftConfigs)
      .filter(c => c.id !== ShiftType.OFF)
      .map(c => `${c.label} (${c.id})`)
      .join(', ');

    const prompt = `
      你是一個專業的排班分析師與健康顧問。請分析以下這個月(${currentMonthStr})的班表：
      
      班別定義: ${legend}

      班表數據:
      ${relevantShifts || '這個月目前沒有排班。'}

      請提供以下內容（請用繁體中文，語氣親切鼓勵）：
      1. 本月排班摘要（統計各班別數量）。
      2. 健康建議（例如：如果有連續夜班，給予睡眠建議；如果班表很鬆散，建議如何安排休閒）。
      3. 如果發現違反勞基法或過勞的風險（例如連續工作超過7天），請溫和提醒。
      
      請保持簡潔，適合手機閱讀。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "無法分析班表，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 暫時無法連線，請檢查網路或 API Key 設定。";
  }
};