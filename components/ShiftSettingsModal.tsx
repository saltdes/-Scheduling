
import React, { useState, useEffect } from 'react';
import { ShiftType, ShiftConfig, BackupData, AppSettings } from '../types';
import { getIconComponent, COLOR_THEMES, AVAILABLE_ICONS, DEFAULT_SHIFT_CONFIGS } from '../constants';
import { Plus, Trash2, Cloud, CloudUpload, CloudDownload, LogIn, LogOut, Loader, Settings as SettingsIcon, Bell } from 'lucide-react';
import * as driveService from '../services/driveService';
import { requestNotificationPermission } from '../services/notificationService';

interface ShiftSettingsModalProps {
  configs: Record<ShiftType, ShiftConfig>;
  shiftsData?: any; // Passed from parent for backup
  leavesData?: any; // Passed from parent for backup
  settings?: AppSettings;
  onUpdate: (type: ShiftType, newConfig: ShiftConfig) => void;
  onDelete?: (type: ShiftType) => void;
  onUpdateSettings?: (settings: AppSettings) => void;
  onRestoreData?: (data: BackupData) => void;
  onClose: () => void;
}

const ShiftSettingsModal: React.FC<ShiftSettingsModalProps> = ({ 
  configs, shiftsData, leavesData, settings,
  onUpdate, onDelete, onUpdateSettings, onRestoreData, onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'PREFERENCES' | 'BACKUP'>('SETTINGS');
  
  // --- Shift Settings State ---
  const [editingId, setEditingId] = useState<ShiftType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editThemeKey, setEditThemeKey] = useState<string>('amber');

  // --- Backup State ---
  const [clientId, setClientId] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('google_client_id');
    if (storedId) setClientId(storedId);
  }, []);

  // --- Shift Settings Handlers ---
  const startEditing = (type: ShiftType) => {
    const config = configs[type];
    setEditingId(type);
    setIsCreating(false);
    setEditLabel(config.label);
    setEditIcon(config.icon);
    const foundTheme = Object.entries(COLOR_THEMES).find(([_, val]) => val.bgColor === config.bgColor);
    setEditThemeKey(foundTheme ? foundTheme[0] : 'gray');
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingId(null);
    setEditLabel('新班別');
    setEditIcon('Star');
    setEditThemeKey('gray');
  };

  const handleSaveConfig = () => {
    const theme = COLOR_THEMES[editThemeKey as keyof typeof COLOR_THEMES];
    if (isCreating) {
      const newId = `CUSTOM_${Date.now()}`;
      const newConfig: ShiftConfig = { id: newId, label: editLabel, icon: editIcon, ...theme };
      onUpdate(newId, newConfig);
      setIsCreating(false);
    } else if (editingId) {
      const newConfig: ShiftConfig = { ...configs[editingId], label: editLabel, icon: editIcon, ...theme };
      onUpdate(editingId, newConfig);
      setEditingId(null);
    }
  };

  const handleReset = (type: ShiftType) => {
    if (confirm(`確定要將 ${configs[type].label} 重置為預設值嗎？`)) {
      onUpdate(type, DEFAULT_SHIFT_CONFIGS[type]);
    }
  };

  const handleDelete = () => {
    if (editingId && onDelete) {
       if (confirm(`確定要刪除「${editLabel}」嗎？相關的班表紀錄也會被清除。`)) {
         onDelete(editingId);
         setEditingId(null);
       }
    }
  };

  const isDefaultType = (id: string | null) => {
    return id ? Object.values(DEFAULT_SHIFT_CONFIGS).some(c => c.id === id) : false;
  };

  // --- Preferences Handlers ---
  const handleToggleReminder = async () => {
    if (!onUpdateSettings || !settings) return;

    if (!settings.enableReminders) {
      // Trying to enable
      const granted = await requestNotificationPermission();
      if (granted) {
        onUpdateSettings({ ...settings, enableReminders: true });
      }
    } else {
      // Disable
      onUpdateSettings({ ...settings, enableReminders: false });
    }
  };

  // --- Backup Handlers ---
  const handleInitClient = async () => {
    if (!clientId) {
      setStatusMsg("請輸入 Client ID");
      return;
    }
    setIsLoading(true);
    try {
      localStorage.setItem('google_client_id', clientId);
      await driveService.initGapiClient();
      driveService.initGisClient(clientId);
      setStatusMsg("初始化成功，請登入");
    } catch (err) {
      console.error(err);
      setStatusMsg("初始化失敗，請檢查 Client ID");
    }
    setIsLoading(false);
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      await driveService.handleAuthClick();
      setIsSignedIn(true);
      setStatusMsg("已登入 Google");
    } catch (err) {
      setStatusMsg("登入失敗");
    }
    setIsLoading(false);
  };

  const handleSignOut = () => {
    driveService.handleSignoutClick();
    setIsSignedIn(false);
    setStatusMsg("已登出");
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const backupData: BackupData = {
        shifts: shiftsData,
        configs: configs,
        leaves: leavesData,
        settings: settings,
        timestamp: Date.now(),
        version: '1.0'
      };
      await driveService.uploadBackup(backupData);
      setStatusMsg("備份成功！");
    } catch (err) {
      console.error(err);
      setStatusMsg("備份失敗");
    }
    setIsLoading(false);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const data = await driveService.downloadBackup();
      if (data && onRestoreData) {
        onRestoreData(data);
        setStatusMsg(`還原成功 (時間: ${new Date(data.timestamp).toLocaleString()})`);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("還原失敗或找不到檔案");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tabs */}
        <div className="bg-gray-50 border-b border-gray-100">
           <div className="flex justify-between items-center p-3 pb-0">
             <h3 className="text-lg font-bold text-gray-800 px-1">設定</h3>
             <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
           </div>
           
           <div className="flex px-2 mt-2">
             <button 
               onClick={() => setActiveTab('SETTINGS')}
               className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                 activeTab === 'SETTINGS' ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-t-lg'
               }`}
             >
               <SettingsIcon size={16} /> 班別
             </button>
             <button 
               onClick={() => setActiveTab('PREFERENCES')}
               className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                 activeTab === 'PREFERENCES' ? 'border-green-600 text-green-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-t-lg'
               }`}
             >
               <Bell size={16} /> 一般
             </button>
             <button 
               onClick={() => setActiveTab('BACKUP')}
               className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                 activeTab === 'BACKUP' ? 'border-purple-600 text-purple-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:bg-gray-100 rounded-t-lg'
               }`}
             >
               <Cloud size={16} /> 備份
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'SETTINGS' ? (
             /* --- Settings Tab Content --- */
             editingId || isCreating ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">顯示名稱</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">顏色主題</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => setEditThemeKey(key)}
                        className={`w-10 h-10 rounded-full ${theme.color} flex items-center justify-center transition-transform active:scale-95 ${
                          editThemeKey === key ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">圖示</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        onClick={() => setEditIcon(iconName)}
                        className={`p-2 rounded-lg flex items-center justify-center border transition-colors ${
                          editIcon === iconName ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {getIconComponent(iconName, 20)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                   {!isCreating && !isDefaultType(editingId) && (
                    <button onClick={handleDelete} className="p-3 bg-red-100 text-red-600 rounded-xl"><Trash2 size={20} /></button>
                   )}
                  <button onClick={() => { setEditingId(null); setIsCreating(false); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">取消</button>
                  <button onClick={handleSaveConfig} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md">儲存</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pb-20">
                {Object.values(configs).map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor} ${config.textColor}`}>
                        {getIconComponent(config.icon, 20)}
                      </div>
                      <span className="font-bold text-gray-700">{config.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {isDefaultType(config.id) && (
                          <button onClick={() => handleReset(config.id)} className="p-2 text-gray-400 hover:text-red-500 text-xs">重置</button>
                      )}
                      <button onClick={() => startEditing(config.id)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200">編輯</button>
                    </div>
                  </div>
                ))}
                <button onClick={startCreating} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors font-bold">
                  <Plus size={20} /> 新增自訂班別
                </button>
              </div>
            )
          ) : activeTab === 'PREFERENCES' ? (
             /* --- Preferences Tab Content --- */
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">每日班表提醒</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        每天開啟 App 時，自動通知您明天的班別
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleReminder}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings?.enableReminders ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                      settings?.enableReminders ? 'left-7' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                
                <div className="p-4 bg-blue-50 text-blue-800 text-xs rounded-xl">
                  提示：此功能需要瀏覽器支援通知權限。若您在手機上將此網頁加入主畫面 (PWA)，體驗會更佳。
                </div>
             </div>
          ) : (
            /* --- Backup Tab Content --- */
            <div className="space-y-6">
              {!isSignedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-800">
                    請輸入 Google Cloud Client ID 以啟用備份功能。<br/>
                    <span className="text-xs text-purple-600 mt-1 block">
                      (僅需首次設定，ID 將儲存於本地)
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Google Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter Client ID"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                    />
                  </div>
                  <button
                    onClick={handleInitClient}
                    className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    1. 初始化 API
                  </button>
                  <button
                    onClick={handleAuth}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <LogIn size={20} /> 2. 登入 Google
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-green-800 flex items-center gap-2 font-bold">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     已連線至 Google Drive
                   </div>
                   
                   <button
                    onClick={handleBackup}
                    disabled={isLoading}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 hover:bg-purple-700 active:scale-95 transition-all"
                   >
                     <CloudUpload size={24} /> 備份至雲端
                   </button>

                   <button
                    onClick={handleRestore}
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
                   >
                     <CloudDownload size={24} /> 從雲端還原
                   </button>
                   
                   <button
                    onClick={handleSignOut}
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 mt-4"
                   >
                     <LogOut size={18} /> 登出
                   </button>
                </div>
              )}

              {/* Status Message */}
              {statusMsg && (
                <div className="text-center text-sm font-bold text-gray-500 mt-4 animate-pulse">
                  {isLoading && <Loader className="inline animate-spin mr-2" size={14} />}
                  {statusMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftSettingsModal;
