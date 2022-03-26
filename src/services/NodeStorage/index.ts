import fs from 'fs';
import path from 'path';
import { Nullable } from '../../types';
import { tryRecoverStorage } from './tryRecoveStorage';

export class NodeStorage implements Storage {
  private _dir: string;
  private _storage: Map<string, string>;

  constructor(dir: string = path.join('storage')) {
    this._dir = dir;
    this._storage = tryRecoverStorage(dir);
  }

  private persist() {
    const obj = Object.fromEntries(this._storage);
    fs.writeFileSync(this._dir, JSON.stringify(obj));
  }

  get length(): number {
    return this._storage.size;
  }

  key(index: number): Nullable<string> {
    if (index < 0) return null;
    const keys = this._storage.keys();
    for (let i = 0; i < index; keys.next(), i++) 0;

    return keys.next().value ?? null;
  }
  getItem(key: string): Nullable<string> {
    return this._storage.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this._storage.set(key, value);
    this.persist();
  }
  removeItem(key: string): void {
    this._storage.delete(key);
    this.persist();
  }
  clear(): void {
    this._storage.clear();
    this.persist();
  }
}
