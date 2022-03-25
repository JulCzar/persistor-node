import { Config, Observer } from '../types';
import { isDate } from 'util/types';
import { StoreItem } from './StoreItem';

export class Store {
  private static _instance: Store;
  private expireIn?: Date;
  private store: Map<string, StoreItem>;
  private observers: Observer[];

  private constructor(config: Omit<Config, 'path'>) {
    this.expireIn = config.expireIn;
    this.store = new Map<string, StoreItem>();
    this.observers = [];
  }

  static getInstance(config: Omit<Config, 'path'>) {
    if (!this._instance) this._instance = new Store(config);

    if (isDate(this._instance.expireIn)) {
      if (this._instance.expireIn < new Date()) {
        this._instance = new Store(config);
      }
    }

    return this._instance;
  }
}
