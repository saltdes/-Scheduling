import html2canvas from 'html2canvas';
import { ShiftMap, ShiftType, ShiftConfig } from '../types';

// Generate .ics file content
export const generateICS = (shifts: ShiftMap, configs: Record<ShiftType, ShiftConfig>): string => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShiftMaster//App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  Object.entries(shifts).forEach(([dateStr, type]) => {
    if (type === ShiftType.OFF) return;

    const config = configs[type];
    const startDate = dateStr.replace(/-/g, '');
    
    // Add 1 day for end date (all day event)
    const nextDate = new Date(dateStr);
    nextDate.setDate(nextDate.getDate() + 1);
    const endDate = nextDate.toISOString().slice(0, 10).replace(/-/g, '');

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`DTSTART;VALUE=DATE:${startDate}`);
    icsContent.push(`DTEND;VALUE=DATE:${endDate}`);
    icsContent.push(`SUMMARY:${config.label}`);
    icsContent.push('TRANSP:TRANSPARENT'); // Show as available
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

export const downloadICS = (shifts: ShiftMap, configs: Record<ShiftType, ShiftConfig>) => {
  const content = generateICS(shifts, configs);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `shifts_backup_${new Date().toISOString().slice(0,10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const captureCalendarImage = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      backgroundColor: '#ffffff',
      useCORS: true
    });

    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = `shift_calendar_${new Date().toISOString().slice(0,10)}.png`;
    link.click();
  } catch (error) {
    console.error("Snapshot failed", error);
    alert("截圖失敗，請稍後再試");
  }
};