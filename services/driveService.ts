import { BackupData } from '../types';

declare var gapi: any;
declare var google: any;

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Initialize GAPI (for API calls)
export const initGapiClient = async (apiKey?: string) => {
  if (gapiInited) return;
  
  await new Promise<void>((resolve, reject) => {
    gapi.load('client', {
      callback: resolve,
      onerror: reject,
    });
  });

  await gapi.client.init({
    discoveryDocs: [DISCOVERY_DOC],
  });
  
  gapiInited = true;
};

// Initialize GIS (for Auth)
export const initGisClient = (clientId: string) => {
  if (gisInited) return;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: '', // defined later in requestAccessToken
  });
  
  gisInited = true;
};

// Handle Login
export const handleAuthClick = async () => {
  return new Promise<void>((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      resolve();
    };

    // Skip if valid token exists (simplified check)
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

// Sign out
export const handleSignoutClick = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
};

// Find existing backup file
const findBackupFile = async () => {
  const response = await gapi.client.drive.files.list({
    q: "name = 'shift_master_backup.json' and trashed = false",
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  const files = response.result.files;
  if (files && files.length > 0) {
    return files[0].id;
  }
  return null;
};

// Upload Backup
export const uploadBackup = async (data: BackupData) => {
  const fileContent = JSON.stringify(data);
  const fileId = await findBackupFile();

  const metadata = {
    name: 'shift_master_backup.json',
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const accessToken = gapi.client.getToken().access_token;
  
  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (fileId) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    method = 'PATCH';
  }

  const response = await fetch(url, {
    method: method,
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  });

  return response.json();
};

// Download Backup
export const downloadBackup = async (): Promise<BackupData | null> => {
  const fileId = await findBackupFile();
  if (!fileId) throw new Error("找不到雲端備份檔案");

  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  });

  return response.result as BackupData;
};