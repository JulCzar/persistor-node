import { isDate } from 'util/types';

const valueSyn = Symbol('value');
const epochDate = new Date(0);

export class StoreItem<T = unknown> {
  private static _emptyInstance: StoreItem<never>;
  private [valueSyn]: T;
  private _expireIn?: Date;

  constructor(value: T, expireIn?: Date) {
    this[valueSyn] = value;
    this._expireIn = expireIn;
  }

  get value() {
    if (this.isExpired()) {
      return undefined;
    }

    return this[valueSyn];
  }

  isExpired() {
    if (isDate(this._expireIn)) {
      return this._expireIn < new Date();
    }

    return false;
  }

  private static get emptyInstance() {
    if (!StoreItem._emptyInstance) {
      StoreItem._emptyInstance = new StoreItem<never>(
        undefined as never,
        epochDate
      );
    }

    return StoreItem._emptyInstance;
  }

  static fromJSON<T>(str: string) {
    try {
      const { value, expireIn } = JSON.parse(str);

      return new StoreItem<T>(value, expireIn);
    } catch (e) {
      console.warn(e);

      return this.emptyInstance;
    }
  }

  toJSON() {
    return {
      value: this.value,
      expireIn: this._expireIn,
    };
  }
}
