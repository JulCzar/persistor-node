export * from './observer';
export * from './StorageStatus';

type Nullable<T> = T | null;
type PromiseOr<T> = Promise<T> | T;

export interface Storage {
  getItem(key: string): PromiseOr<Nullable<string>>;
  setItem(key: string, value: string): PromiseOr<void>;
  key(index: number): PromiseOr<Nullable<string>>;
  removeItem(key: string): PromiseOr<void>;
  clear(): PromiseOr<void>;
  length: number;
}
