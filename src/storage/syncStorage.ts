interface StorageData {
    [key: string]: any;
  }
  
  class SyncStorage {
    static get(keys: string | string[] | null): Promise<StorageData> {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (items) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(items);
          }
        });
      });
    }
  
    static set(items: StorageData): Promise<void> {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  
    static remove(keys: string | string[]): Promise<void> {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  
    static clear(): Promise<void> {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  }
  
  export default SyncStorage;
  