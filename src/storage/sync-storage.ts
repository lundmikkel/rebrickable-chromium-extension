import {
  Observable,
  Subject,
  concat,
  defer,
  distinctUntilChanged,
  from,
} from "rxjs";

type StorageData = Record<string, any>;

export class SyncStorage {
  private static storage = chrome.storage.sync;

  public static get<T>(key: string): Promise<T | undefined> {
    return this.getAll(key).then((items) => items[key]);
  }

  public static getObservable<T>(key: string): Observable<T | undefined> {
    // Reads initial value when subscribed, instead of when this method is called
    const initialValue$ = defer(() =>
      from(this.getAll(key).then((items) => items[key]))
    );

    const valueSubject = new Subject<Record<string, number>>();
    chrome.storage.sync.onChanged.addListener((changes) =>
      valueSubject.next(changes[key].newValue ?? {})
    );

    return concat(initialValue$, valueSubject).pipe(distinctUntilChanged());
  }

  private static getAll(...keys: string[]): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      this.storage.get(keys, (items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(items);
        }
      });
    });
  }

  public static set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  public static remove(...keys: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  public static clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear(() => {
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
