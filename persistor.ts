import fs from 'fs';

class StoreItem<T> {
  value: T;
  expireIn?: Date;

  constructor(value: T, expireIn?: Date) {
    this.value = value;
    this.expireIn = expireIn;
  }

  fromString(str: string) {
    try {
      const { value, expireIn } = JSON.parse(str);

      return new StoreItem(value, expireIn);
    } catch {
      
    }
  }
}

function getPersistentStorage(config) {
  const { path = 'storage', expireIn } = config ?? {};

  /** @type {{expireIn: number, [key:string]: StoreItem}} */
  const store = { expireIn };
  const observers = [];

  const setStore = data => {
    Object.assign(store, data);
  };

  /** @param {string} key */
  const getItem = key => {
    const data = store[key];

    if (!data) return;

    if (!data.expireIn) return data.value;

    if (data.expireIn <= Date.now()) return removeItem(key);

    return data.value;
  };

  /** @param {string} key @param {any} value @param {number} expireIn time to expire content, in minutes */
  const setItem = (key, value, expireIn) => {
    const storeItem = new StoreItem(value, Date.now() + expireIn * 60000);

    const store = { [key]: storeItem };

    setStore(store);

    updateStore();
  };

  const clear = () => {
    for (const key of Object.keys(store)) delete store[key];

    updateStore();

    fs.unlinkSync(path);
  };

  /** @param {string} key */
  const removeItem = key => {
    delete store[key];

    updateStore();
  };

  /** @param {function} observer */
  const subscribe = observer => {
    if (typeof observer === 'function') observers.push(observer);
  };

  const notifyAll = () => observers.forEach(o => o());

  const updateStore = () => {
    const stringifiedStore = JSON.stringify(store);

    fs.writeFileSync(path, stringifiedStore);
    notifyAll();
  };

  const _init = () => {
    try {
      const encryptedStorePersisted = fs.readFileSync(path, { flag: 'a+' });

      const stringified = encryptedStorePersisted.toString();

      /** @type {{expireIn: number, [name:string]: any}} */
      const parsedStore = stringified ? JSON.parse(stringified) : { expireIn };

      if (!parsedStore?.expireIn) 0;
      else if (parsedStore.expireIn <= Date.now()) throw Error('Store Expired');

      setStore(parsedStore);
    } catch (error) {
      console.log(
        'store could not be loaded due to inconsistent data, state was cleared'
      );
      console.error(error);
    }

    return { clear, getItem, removeItem, setItem, subscribe };
  };

  return _init();
}

module.exports = getPersistentStorage;
