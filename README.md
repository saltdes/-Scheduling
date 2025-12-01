# 排班大師 (ShiftMaster)

專為護理人員與輪班工作者設計的行動優先排班 Web App。支援 PWA 安裝、AI 班表分析、Google 雲端備份與手機行事曆匯出。

## 🚀 快速開始 (如何在手機上使用)

最簡單的方法是使用 **Vercel** 免費部署。

### 1. 取得程式碼
將此專案上傳至您的 GitHub。

### 2. 取得 AI 金鑰 (Gemini API Key)
1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)。
2. 點擊 **Create API key**。
3. 複製您的 Key (以 `AIza` 開頭)。

### 3. 部署到 Vercel
1. 註冊並登入 [Vercel](https://vercel.com/)。
2. 點擊 **Add New Project** -> **Import** 您的 GitHub 專案。
3. 在 **Environment Variables** (環境變數) 區域設定：
   - Name: `VITE_API_KEY`
   - Value: (貼上您的 Google API Key)
4. 點擊 **Deploy**。

### 4. 安裝到手機
1. 部署完成後，用手機瀏覽器打開網址。
2. iPhone (Safari): 分享按鈕 -> **加入主畫面**。
3. Android (Chrome): 選單 -> **安裝應用程式** 或 **加入主畫面**。

## 🛠️ 開發指令

如果您想在電腦上修改程式碼：

```bash
# 安裝套件
npm install

# 啟動測試伺服器
npm run dev

# 打包
npm run build
```

## 🔑 常見問題

**Q: 為什麼 GitHub 不讓我上傳？**
A: 請檢查您是否不小心將真實的 API Key 寫在程式碼裡。請務必使用 `VITE_API_KEY` 環境變數。

**Q: AI 助理說無法連線？**
A: 請確認 Vercel 的 Environment Variables 中有設定 `VITE_API_KEY`，並且設定後有重新部署 (Redeploy)。
