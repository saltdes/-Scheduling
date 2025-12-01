
import { ShiftMap, ShiftConfig, ShiftType, AppSettings } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    alert("您的瀏覽器不支援通知功能");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    // Check if service worker is ready for a more persistent notification, 
    // otherwise fallback to standard Notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
       navigator.serviceWorker.ready.then(registration => {
         registration.showNotification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
            // vibrate: [200, 100, 200]
         });
       });
    } else {
       new Notification(title, {
         body,
         icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
       });
    }
  }
};

export const checkAndSendDailyReminder = (
  shifts: ShiftMap,
  configs: Record<ShiftType, ShiftConfig>,
  settings: AppSettings,
  updateSettings: (newSettings: AppSettings) => void
) => {
  if (!settings.enableReminders) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Prevent spamming: only notify once per day
  if (settings.lastReminderDate === todayStr) {
    return;
  }

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const shiftType = shifts[tomorrowStr];
  
  // If there is a shift scheduled for tomorrow (and it's not explicitly OFF if you track OFFs)
  // Note: shifts map usually only contains active shifts. 
  // If OFF is stored in map, handle it. If missing, it's empty.
  
  if (shiftType && shiftType !== ShiftType.OFF) {
    const config = configs[shiftType];
    const label = config ? config.label : '未知班別';
    
    sendNotification(
      '班表提醒', 
      `明天 (${tomorrowStr.slice(5)}) 的班別是：${label}`
    );
    
    // Update last reminder date
    updateSettings({
      ...settings,
      lastReminderDate: todayStr
    });
  }
};
