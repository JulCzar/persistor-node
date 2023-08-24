import { Duration } from 'js-duration';
import { STATUS_REPORT_KEY, TAG } from '../constants';
import { Observer, Storage } from '../types';
import { populate } from '../utils/populateStorage';
import { StorageStatus } from '../types/StorageStatus';
import { testSanitization } from '../utils';

export type Reviver = (key: string, value: unknown) => unknown;
export type Replacer = (key: string, value: unknown) => unknown;

interface PersistentStorageConfig<> {
  storage: Storage;
  reviver?: Reviver;
  replacer?: Replacer;
}

interface ComputedValue {
  value: unknown;
  expireAt: number | null;
}

export interface PersistedValue {
  value: string;
  expireAt: number | null;
}

export class PersistentStorage {
  private static __instance__: PersistentStorage | undefined;
  private status: StorageStatus = StorageStatus.INITIALIZING;

  private __observers__: Map<string, Set<Observer<unknown>>>;
  private __storage__: Map<string, ComputedValue>;
  private __persistor__: Storage;

  private __replacer__: Replacer | undefined;
  private __reviver__: Reviver | undefined;

  private constructor({
    storage: persistor,
    reviver,
    replacer,
  }: PersistentStorageConfig) {
    this.__storage__ = new Map();
    this.__observers__ = new Map();
    this.__persistor__ = persistor;
    this.__replacer__ = replacer;
    this.__reviver__ = reviver;

    populate({ persistor, reviver, storage: this.__storage__ })
      .catch(e => {
        this.status = StorageStatus.ERROR;
        console.error(TAG, e);
        this.notify(STATUS_REPORT_KEY, e);
      })
      .finally(() => {
        this.status = StorageStatus.READY;
        this.notify(STATUS_REPORT_KEY);
      });
  }

  static create(config: PersistentStorageConfig): PersistentStorage {
    if (!this.__instance__) this.__instance__ = new PersistentStorage(config);

    return this.__instance__;
  }

  watch<T = unknown>(key: string, observer: Observer<T>): () => void {
    const observers = this.__observers__;

    if (!observers.has(key)) observers.set(key, new Set());

    const observerSet = observers.get(key)! as Set<Observer<T>>;
    observerSet.add(observer);

    return () => observerSet.delete(observer);
  }

  private notify(key: string, value?: unknown): void {
    if (this.status === 'initializing') return;
    const observers = this.__observers__;

    if (!observers.has(key)) return;

    const observerSet = observers.get(key)!;
    observerSet.forEach(observer => observer(value));
  }

  getItem<T = unknown>(key: string): T | null {
    const { expireAt, value } = this.__storage__.get(key) ?? {};

    if (!expireAt) return (value ?? null) as T | null;

    const expireDuration = Duration.of({ milliseconds: expireAt - Date.now() });

    if (expireDuration.isNegative) {
      this.__storage__.delete(key);
      this.__persistor__.removeItem(key);

      return null;
    }

    return (value ?? null) as T | null;
  }

  setItem(key: string, value: unknown, lifetime?: Duration): void {
    if (lifetime?.isNegative) console.warn(TAG, 'Lifetime cannot be negative!');
    testSanitization(value, this.__replacer__, this.__reviver__);

    const expireAt = lifetime?.inMilliseconds
      ? lifetime.inMilliseconds + Date.now()
      : null;

    const computedValue: ComputedValue = {
      value,
      expireAt,
    };

    const persistedValue: PersistedValue = {
      value: JSON.stringify(value, this.__replacer__),
      expireAt,
    };

    this.__storage__.set(key, computedValue);
    this.notify(key, value);

    this.__persistor__.setItem(key, JSON.stringify(persistedValue));
  }

  get length(): number {
    return this.__storage__.size;
  }

  key(index: number): string | undefined {
    return Array.from(this.__storage__.keys())[index];
  }

  removeItem(key: string): void {
    this.__storage__.delete(key);
    this.notify(key, null);

    this.__persistor__.removeItem(key);
  }

  clear(): void {
    this.__storage__.clear();

    const allKeys = Array.from(this.__observers__.keys());
    for (const key of allKeys) this.notify(key, null);

    this.__persistor__.clear();
  }
}
