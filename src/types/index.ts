import { StoreItem, StoreItemJSON } from '../models/StoreItem';
import { AsyncPersistentStorage, PersistentStorage } from '../services';
import { Duration } from '../utils';
import { AsyncStorage } from './AsyncStorage';

export * from './observer';

export type Nullable<T> = T | null;
export const RESTORED_STATE = Symbol('restored-state');

export interface SetItemConfig {
  /** this is the duration that the storage will be valid,
   * if a number is provided it will be read as minute,
   * if the value is 0 or undefined, the storage will be valid forever */
  expireIn?: number | Duration;
}
export interface PersistentStorageConfigs {
  /** the key where the structure will be saved */
  key?: string;
  /** the storage interface that will save the structure */
  storage: Storage;
  /** this is the duration that the storage will be valid,
   * if a number is provided it will be read as minute,
   * if the value is 0 or undefined, the storage will be valid forever */
  expireIn?: number | Duration;
}
export interface AsyncPersistentStorageConfigs {
  /** the key where the structure will be saved */
  key?: string;
  /** the storage interface that will save the structure */
  storage: Storage | AsyncStorage;
  /** this is the duration that the storage will be valid,
   * if a number is provided it will be read as minute,
   * if the value is 0 or undefined, the storage will be valid forever */
  expireIn?: number | Duration;
}

export interface PersistentStorageDto {
  config: Partial<PersistentStorageConfigs>;
  items: StoreDto[];
  expireIn: string | undefined;
}

export interface StoreDto {
  key: string;
  value: StoreItem;
}

export interface StoreJSON {
  key: string;
  value: StoreItemJSON;
}

export interface PersistentStorageJSON {
  expireIn?: string;
  config: Partial<PersistentStorageConfigs>;
  items: StoreJSON[];
}

export interface MultitonDto {
  key: string;
  item: PersistentStorage;
}

export interface AsyncMultitonDto {
  key: string;
  item: AsyncPersistentStorage;
}

export interface MultitonJSON {
  key: string;
  item: PersistentStorageJSON;
}
