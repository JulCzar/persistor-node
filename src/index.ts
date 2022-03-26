import { StoreItem } from './models/StoreItem';
import {
  iPersistentStorage,
  Nullable,
  Observer,
  PersistentStorageConfigs,
  StoreEvent,
  Unsubscriber,
} from './types';
import { getAvailableStorage, getExpirationDate } from './utils';

class PersistentStorage implements iPersistentStorage {
  private static _instances: Map<string, PersistentStorage>;
  private _store: Map<string, StoreItem>;
  private _observers: Observer[];
  private _storage: Storage;
  private _expireIn?: Date;

  private constructor(config: PersistentStorageConfigs) {
    this._store = new Map();
    this._observers = [];
    this._storage = config.storage;
    this._expireIn = getExpirationDate(config.expireIn);
  }
  private notify(event: StoreEvent) {
    for (const observer of this._observers) {
      observer.call(undefined, event);
    }
  }
  static getOrCreate(key: string, config?: PersistentStorageConfigs) {
    if (!this._instances) {
      this._instances = new Map();
    }

    if (this._instances.has(key)) {
      const instance = this._instances.get(key) as PersistentStorage;

      if (instance.isExpired()) {
        this._instances.delete(key);

        this.getOrCreate(key, config);
      }

      return instance;
    }

    const instance = new PersistentStorage({
      storage: config?.storage ?? getAvailableStorage(),
      expireIn: config?.expireIn,
    });

    this._instances.set(key, instance);

    instance.subscribe(evt => this.persist(evt, instance._storage));

    return instance;
  }
  get length() {
    return this._store.size;
  }
  static persist(event: StoreEvent, storage: Storage) {
    const instances = this._instances;

    for (const [key, item] of instances) {
      if (item.isExpired()) {
        instances.delete(key);
      }
    }

    const data = Object.fromEntries(instances);
    const json = JSON.stringify(data);

    if (event.type !== 'GET') {
      storage.setItem('persistentStorage', json);
    }
  }
  subscribe(observer: Observer): Unsubscriber {
    // adicionar um Observer a uma lista e retornar um método para removê-lo desta lista
    this._observers.push(observer);

    return () => {
      this._observers = this._observers.filter(o => o !== observer);
    };
  }
  setItem<T>(
    key: string,
    value: T,
    config?: Omit<PersistentStorageConfigs, 'storage'>
  ): void {
    const store = this._store;

    const expireIn = getExpirationDate(config?.expireIn);
    store.set(key, new StoreItem(value, expireIn));

    this.notify({
      type: 'SET',
      payload: {
        key,
      },
    });
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
      const item = store.get(key) as StoreItem<T>;

      if (item.isExpired()) {
        this.removeItem(key);

        return null;
      }

      return item.value ?? null;
    }

    return null;
  }
  clear(): void {
    this._store.clear();

    this.notify({
      type: 'CLEAR',
    });
  }
  isExpired() {
    if (this._expireIn) {
      return this._expireIn < new Date();
    }

    return false;
  }
  toJSON() {
    const store = this._store;

    return Object.fromEntries(store);
  }
}

const item1 = PersistentStorage.getOrCreate('test1');
const item2 = PersistentStorage.getOrCreate('test2');

console.time('set');
item2.setItem(
  'test',
  { test: 'test' },
  {
    expireIn: 7 / 60 / 1000,
  }
);
item1.setItem('test', 'não deve aparecer');
item2.setItem('test2', 'algo na store2');
console.log(item1.getItem('test'));
console.log(item1.length);
console.log(item2.getItem('test'));
console.timeEnd('set');