import { NodeStorage } from './model/NodeStorage';

interface PersistentStorageConfigs {
  storage: Storage;
  /** the time, in minutes, to wait before the storage expires */
  expireIn?: number;
}

class PersistentStorage {
  private static _instances: Map<string, PersistentStorage>;
  private storage: Storage;
  private expireIn?: number;

  private constructor(config: PersistentStorageConfigs) {
    this.storage = config.storage;
    this.expireIn = config.expireIn;
  }

  static getStorage(key: string, config?: PersistentStorageConfigs) {
    if (!this._instances) {
      this._instances = new Map<string, PersistentStorage>();
    }

    const instance = this._instances;
    if (instance.has(key)) {
      return instance.get(key) as PersistentStorage;
    } else if (config) {
      const newInstance = new PersistentStorage(config);

      instance.set(key, newInstance);
      return newInstance;
    } else {
      throw Error(
        'The expected key does not exist and was not provided configs for a new instance'
      );
    }
  }
}

const storage = PersistentStorage.getStorage('test', {
  storage: new NodeStorage(),
});

console.log(PersistentStorage);
