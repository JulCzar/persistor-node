type Observer = () => void
interface Config {
  path?: string
  expireIn?: number
}

class StoreItem {
  value: unknown
  expireIn?: number

  constructor(value: unknown, expireIn?: number) {
    this.value = value
    this.expireIn = expireIn
  }

  parseFromString(str: string) {
    const { value, expireIn } = JSON.parse(str)

    return new StoreItem(value, expireIn)
  }
}

export function getPersistentStorage(config?: Config) {
  const { path = 'storage', expireIn } = config ?? {}

  const store: any = { expireIn }
  const observers: Observer[] = []

  const setStore = (data: unknown) => {
    Object.assign(store, data)
  }

  const getItem = <T>(key: string): T | null => {
    const data = store[key]

    if (!data) return null

    if (!data.expireIn) return data.value

    if (data.expireIn <= Date.now()) {
      removeItem(key)
      return null
    }

    return data.value
  }

  /** @param expireIn time to expire content, in minutes */
  const setItem = (key: string, value: unknown, expireIn?: number) => {
    const expireDate = expireIn ? Date.now() + expireIn * 60000 : undefined
    const storeItem = new StoreItem(value, expireDate)

    const store = { [key]: storeItem }

    setStore(store)

    updateStore()
  }

  const clear = () => {
    for (const key of Object.keys(store)) delete store[key]

    updateStore()

    globalThis?.localStorage.removeItem(path)
  }

  const removeItem = (key: string) => {
    delete store[key]

    updateStore()
  }

  const subscribe = (observer: Observer) => {
    if (typeof observer === 'function') observers.push(observer)
  }

  const notifyAll = () => observers.forEach(o => o())

  const updateStore = () => {
    const stringifiedStore = JSON.stringify(store)

    globalThis?.localStorage.setItem(path, stringifiedStore)

    notifyAll()
  }

  const _init = () => {
    try {
      const encryptedStorePersisted =
        globalThis?.localStorage?.getItem(path) || ''

      const stringified = encryptedStorePersisted.toString()

      const parsedStore: any = stringified
        ? JSON.parse(stringified)
        : { expireIn }

      if (!parsedStore?.expireIn) void 0
      else if (parsedStore.expireIn <= Date.now())
        console.error('Store Expired')

      setStore(parsedStore)
    } catch (error) {
      console.log(
        'store could not be loaded due to inconsistent data, state was cleared'
      )
      console.error(error)
    }

    return { clear, getItem, removeItem, setItem, subscribe }
  }

  return _init()
}

export const persistentStorage = getPersistentStorage()