import { Observer, Unsubscriber } from './observer';

export * from './config';
export * from './observer';

export type Nullable<T> = T | null;

export interface PersistentStorageConfigs {
  storage: Storage;
  /** this is the time in minutes that the storage will be valid, if the value is 0 or undefined, the storage will be valid forever */
  expireIn?: number;
}

export interface iPersistentStorage {
  subscribe(observer: Observer): Unsubscriber;
  setItem(key: string, value: string): void;
  getItem<T>(key: string): Nullable<T>;
  removeItem(key: string): void;
  isExpired(): boolean;
  clear(): void;
}