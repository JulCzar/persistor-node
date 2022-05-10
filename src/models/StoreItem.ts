import { format, isBefore, isValid, parse } from 'date-fns';
import { DATE_FORMAT } from '../constants';

const valueSyn = Symbol('value');

export interface StoreItemJSON {
  value: unknown;
  expireIn: string;
}

export class StoreItem {
  private [valueSyn]: unknown;
  private _expireIn?: Date;

  constructor(value: unknown, expireIn?: Date) {
    this[valueSyn] = value;
    this._expireIn = expireIn;
  }

  get value() {
    if (this.isExpired()) return undefined;

    return this[valueSyn];
  }

  isExpired() {
    if (this._expireIn) return isBefore(this._expireIn, new Date());

    return false;
  }

  static fromJSON({ value, expireIn }: StoreItemJSON) {
    try {
      const expireInDate = parse(expireIn, DATE_FORMAT, new Date());

      if (expireIn) if (!isValid(expireInDate)) return null;

      return new StoreItem(
        value,
        expireIn !== undefined ? expireInDate : undefined
      );
    } catch (e) {
      console.warn(e);

      return null;
    }
  }

  toJSON() {
    if (this.isExpired()) return undefined;
    const expireIn = this._expireIn;

    return {
      value: this.value,
      expireIn: expireIn ? format(expireIn, DATE_FORMAT) : undefined,
    };
  }
}
