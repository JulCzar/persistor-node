import { Duration } from 'js-duration';
import { PersistentStorage, Storage } from '../src';

const storage: Map<string, string> = new Map();
// simulating a storage with previous values in it
storage.set('foo', '{"expireAt":1292910058337,"value":"bar"}');
storage.set('bar', 'null');
storage.set('baz', '{"expireAt":null,"value":"bar"}');
const storageReplace: Storage = {
  get length() {
    return storage.size;
  },
  clear: () => {
    storage.clear();
  },
  getItem: (key: string) => {
    return storage.get(key) ?? null;
  },
  key: (index: number) => {
    return Array.from(storage.keys())[index] ?? null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
};

const stale = (dur: Duration) =>
  new Promise(r => setTimeout(r, dur.inMilliseconds));

describe('Storage', () => {
  const storage = PersistentStorage.create({
    storage: storageReplace,
    replacer: (_, value) => {
      if (typeof value === 'bigint') return `bi-${value.toString()}`;

      return value;
    },
    reviver: (_, value) => {
      if (typeof value === 'string' && value.startsWith('bi-'))
        return BigInt(value.slice(3));

      return value;
    },
  });

  it('should be able to create a storage instance', () => {
    expect(storage).toBeTruthy();
  });
  it('should be able to set a value and retrieve it', () => {
    storage.setItem('foo', 'bar');

    expect(storage.getItem('foo')).toBe('bar');
  });
  it('should be able to set a value and retrieve it with a lifetime', async () => {
    storage.setItem('foo', 'bar', Duration.of({ seconds: 2 }));

    expect(storage.getItem('foo')).toBe('bar');

    await stale(Duration.of({ seconds: 2, milliseconds: 100 }));

    expect(storage.getItem('foo')).toBeNull();
  });
  it('should be able to set a value and retrieve it with a reviver and a replacer', async () => {
    const testValue = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1000);

    storage.setItem('foo', testValue);

    expect(storage.getItem('foo')).toBe(testValue);
  });
  it('should be able to return the length of the storage', () => {
    storage.setItem('foo', 'bar');
    storage.setItem('bar', 'foo');
    storage.setItem('baz', 'bar');

    expect(storage.length).toBe(3);
  });
  it('should be able to return the key of the storage by its index', () => {
    storage.setItem('foo', 'bar');

    expect(storage.key(0)).toBeTruthy();
  });
  it('should be able to remove an item from the storage', () => {
    storage.setItem('foo', 'bar');
    storage.removeItem('foo');

    expect(storage.getItem('foo')).toBeNull();
  });
  it('should be able to clear the storage', () => {
    storage.setItem('foo', 'bar');
    storage.setItem('bar', 'foo');

    expect(storage.length).toBe(3);
    storage.clear();

    expect(storage.length).toBe(0);
  });
  it('should be able to subscribe to a key and listen to its events', () => {
    const mock = jest.fn();
    storage.watch('foo', mock);
    storage.setItem('foo', 'bar');

    expect(mock).toBeCalledWith('bar');

    storage.setItem('foo', 'bar2');

    expect(mock).toBeCalledWith('bar2');

    expect(mock).toBeCalledTimes(2);
  });
  it('should be able to unsubscribe from a key', () => {
    const mock = jest.fn();
    const unsubscribe = storage.watch('foo', mock);
    storage.setItem('foo', 'bar');

    expect(mock).toBeCalledWith('bar');

    unsubscribe();
    storage.setItem('foo', 'bar2');

    expect(mock).toBeCalledTimes(1);
  });
  it('should not accept non serializable values', () => {
    expect(() => storage.setItem('foo', () => {})).toThrow();

    expect(() => storage.setItem('foo', Symbol('bar'))).toThrow();

    expect(() => storage.setItem('foo', { bar: Symbol('bar') })).toThrow();

    expect(() => storage.setItem('foo', { bar: () => {} })).toThrow();

    expect(() =>
      storage.setItem('foo', { bar: { baz: Symbol('baz') } })
    ).toThrow();
    expect(() => storage.setItem('foo', null)).not.toThrow();
    expect(() => storage.setItem('foo', [{ baz: () => {} }])).toThrow();
  });
});
