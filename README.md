# 排班大師 (ShiftMaster)

專為護理人員與輪班工作者設計的行動優先排班 Web App。支援 PWA 安裝、AI 班表分析、Google 雲端備份與手機行事曆匯出。

## 🚀 如何在手機上使用 (部署教學)

本專案是一個網頁應用程式 (Web App)，您需要將其部署到網路上才能在手機使用。

### 步驟 1：取得程式碼
將此專案上傳至您的 GitHub 儲存庫。

### 步驟 2：取得 AI 金鑰 (Gemini API Key)
1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)。
2. 點擊 **Create API key**。
3. 複製您的 Key (以 `AIza` 開頭)。

### 步驟 3：部署網站 (推薦使用 Netlify)

**Netlify** 是最簡單且免費的選擇，通常不需要手機驗證。

1. 前往 [Netlify](https://www.netlify.com/) 並使用 **GitHub 登入**。
2. 點擊 **"Add new site"** -> **"Import from an existing project"** -> 選擇 **GitHub**。
3. 選擇您剛剛上傳的專案 (Repository)。
4. **設定環境變數 (Environment Variables)**：
   - 點擊 "Add environment variables"。
   - **Key**: `VITE_API_KEY`
   - **Value**: (貼上您的 AIza... 金鑰)
5. **確認建置設定 (Build Settings)**：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 點擊 **Deploy** 按鈕。

*(備用方案: Vercel)*
如果您偏好 Vercel，流程類似，請在 Settings -> Environment Variables 中新增 `VITE_API_KEY`。

### 步驟 4：安裝到手機 (PWA)
部署完成後，您會獲得一個網址 (例如 `https://您的專案.netlify.app`)。

1. **iPhone (Safari)**：用 Safari 開啟網址 -> 點擊下方「分享」按鈕 -> 往下滑選擇 **「加入主畫面」**。
2. **Android (Chrome)**：用 Chrome 開啟網址 -> 點擊右上角選單 -> 選擇 **「安裝應用程式」** 或 **「加入主畫面」**。

現在，您的桌面上就有一個全螢幕執行的排班 App 了！

## 🛠️ 開發指令 (給開發者)

如果您想在電腦上修改程式碼：

```bash
# 安裝套件
npm install

# 啟動測試伺服器
npm run dev

# 打包生產版本
npm run build
```

## 🔑 常見問題

**Q: 為什麼 GitHub 拒絕我的上傳 (Push rejected)？**
A: 請檢查程式碼中是否包含了真實的 API Key。GitHub 安全機制會阻擋金鑰洩漏。請確保使用 `process.env.VITE_API_KEY` (或 `import.meta.env.VITE_API_KEY`) 並在部署平台設定變數。

**Q: AI 助理無法分析？**
A: 請確認 Netlify/Vercel 的環境變數名稱是否正確為 `VITE_API_KEY`，設定後通常需要重新部署 (Redeploy) 才會生效。
