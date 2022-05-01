import { isValid, parse } from 'date-fns';
import { DATE_FORMAT, DEFAULT_STORAGE_KEY, TAG } from '../../constants';
import {
  internalErrors,
  STRUCTURE_IS_INVALID,
  STRUCTURE_NON_EXISTENT,
} from '../../errors';
import { StoreItem } from '../../models/StoreItem';
import {
  MultitonDto,
  MultitonJSON,
  Nullable,
  Observer,
  PersistentStorageConfigs,
  PersistentStorageDto,
  PersistentStorageJSON,
  SetItemConfig,
  StoreDto,
  StoreEvent,
  Unsubscriber,
} from '../../types';
import { AsyncStorage } from '../../types/AsyncStorage';
import { getExpirationDate } from '../../utils/getExpirationDate';
import { serializeDate } from '../../utils/serializeDate';

const storeSetter = Symbol('storeSetter');
const expireInSetter = Symbol('expireInSetter');

export class PersistentStorage {
  private static _instances: Map<string, PersistentStorage>;
  private _config: PersistentStorageConfigs;
  private _store: Map<string, StoreItem>;
  private _observers: Observer[];
  private _storage: Storage | AsyncStorage;
  private _expireIn?: Date;
  private _key: string;

  private constructor(config: PersistentStorageConfigs) {
    this._store = new Map();
    this._observers = [];
    this._storage = config.storage;
    this._expireIn = getExpirationDate(config.expireIn);
    this._config = config;
    this._key = config.key ?? DEFAULT_STORAGE_KEY;
  }
  private notify(event: StoreEvent) {
    for (const observer of this._observers) {
      observer.call(undefined, event);
    }
  }
  static getOrCreate(key: string, config: PersistentStorageConfigs) {
    const _storageKey = config.key ?? DEFAULT_STORAGE_KEY;
    const storage = config.storage;

    if (!this._instances) this.restoreFromDirectory(storage, _storageKey);

    if (this._instances.has(key)) {
      const instance = this._instances.get(key) as PersistentStorage;

      if (instance.isExpired()) {
        this._instances.delete(key);

        this.getOrCreate(key, config);
      }

      return instance;
    }

    const instance = new PersistentStorage({
      expireIn: config?.expireIn,
      storage,
    });

    this._instances.set(key, instance);

    instance.subscribe(evt =>
      this.persist(instance._storage, evt, _storageKey)
    );

    return instance;
  }
  static restoreFromDirectory(storage: Storage, key: string) {
    const instances = new Map<string, PersistentStorage>();

    try {
      const structure = storage.getItem(key);

      if (!structure) throw STRUCTURE_NON_EXISTENT;
      const data: MultitonJSON[] | undefined = JSON.parse(structure);

      if (!data) throw STRUCTURE_IS_INVALID;
      for (const { key, item } of data) {
        const persistentStorage = PersistentStorage.fromJSON(item, storage);

        if (persistentStorage) instances.set(key, persistentStorage);
      }
    } catch (e) {
      const error = e as Error;

      if (!internalErrors.includes(error)) console.warn(TAG, { error });
      else console.log(TAG, error.message);
    } finally {
      this._instances = instances;
    }
  }
  private set [storeSetter](store: Map<string, StoreItem>) {
    this._store = store;
  }
  private set [expireInSetter](expireIn: Date | undefined) {
    this._expireIn = expireIn;
  }
  get length() {
    return this._store.size;
  }
  static async persist(
    storage: Storage | AsyncStorage,
    evt: StoreEvent,
    key: string
  ) {
    const instances = this._instances;

    const data: MultitonDto[] = [];
    for (const [key, item] of instances) {
      if (!item.isExpired()) data.push({ key, item });
      else instances.delete(key);
    }

    const json = JSON.stringify(data);

    if (evt.type !== 'GET') storage.setItem(key, json);
  }
  subscribe(observer: Observer): Unsubscriber {
    // adicionar um Observer a uma lista e retornar um método para removê-lo desta lista
    this._observers.push(observer);

    return () => {
      this._observers = this._observers.filter(o => o !== observer);
    };
  }
  setItem<T>(key: string, value: T, config?: SetItemConfig): void {
    const expireIn = getExpirationDate(config?.expireIn);
    this._store.set(key, new StoreItem(value, expireIn));

    this.notify({ type: 'SET', payload: key });
  }
  removeItem(key: string): void {
    const store = this._store;

    store.delete(key);

    this.notify({
      type: 'REMOVE',
      payload: {
        key,
      },
    });
  }
  getItem<T = unknown>(key: string): Nullable<T> {
    const store = this._store;

    if (store.has(key)) {
      const item = store.get(key) as StoreItem;

      if (item.isExpired()) {
        this.removeItem(key);

        return null;
      }

      return (item.value as T) ?? null;
    }

    return null;
  }
  clear(): void {
    this._store.clear();

    this.notify({ type: 'CLEAR' });
  }
  isExpired() {
    if (this._expireIn) {
      return this._expireIn < new Date();
    }

    return false;
  }
  private static fromJSON(
    { items, expireIn, config }: PersistentStorageJSON,
    storage: Storage
  ) {
    const instance = new PersistentStorage({ ...config, storage });
    const store = new Map<string, StoreItem>();
    let _expireIn: Date | undefined = undefined;

    try {
      if (expireIn) {
        const expireInDate = parse(expireIn, DATE_FORMAT, new Date());

        if (!isValid(expireInDate)) return null;

        _expireIn = expireInDate;
      }

      for (const { key, value } of items) {
        const item = StoreItem.fromJSON(value);

        if (item) store.set(key, item);
      }
    } finally {
      instance[storeSetter] = store;
      instance[expireInSetter] = _expireIn;
      instance.subscribe(evt =>
        PersistentStorage.persist(storage, evt, instance._key)
      );
      return instance;
    }
  }
  toJSON(): PersistentStorageDto {
    const store = this._store;
    const expireIn = serializeDate(this._expireIn);

    const { storage: _, ...config } = this._config;

    const items: StoreDto[] = [];
    for (const [key, value] of store) items.push({ key, value });

    return { config, items, expireIn };
  }
}
