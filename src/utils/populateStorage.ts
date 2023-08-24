import { Storage } from '../types';
import { PersistedValue, Reviver } from '../services/PersistentStorage';
import { LIFETIME_KEY } from '../constants';
import { Duration } from 'js-duration';

interface PopulateHelpers {
  persistor: Storage;
  reviver?: Reviver;
  storage: Map<string, unknown>;
}

export const populate = async ({
  persistor,
  reviver,
  storage,
}: PopulateHelpers) => {
  // get all keys from persistor
  const keys: string[] = [];

  if (persistor.length === 0) return;

  for (let i = 0; i < persistor.length; i++) {
    const key = await persistor.key(i);
    if (key === LIFETIME_KEY) continue;
    if (key) keys.push(key);
  }

  // get all key-value pairs from persistor
  const values = await Promise.all(
    keys.map(key => [key, persistor.getItem(key)] as const)
  );

  // populate storage
  for (const [key, valuePromised] of values) {
    const value = await valuePromised;
    if (value === null) continue;

    try {
      const valueParsed: PersistedValue | null = JSON.parse(value);

      if (valueParsed === null) continue;
      if (typeof valueParsed !== 'object') continue;

      if (Array.isArray(valueParsed)) continue;

      if (!('expireAt' in valueParsed)) continue;
      if (!('value' in valueParsed)) continue;

      if (!valueParsed.expireAt) {
        storage.set(key, JSON.parse(value, reviver));
        continue;
      }

      const expireDuration = Duration.between(
        new Date(valueParsed.expireAt),
        new Date()
      );

      if (expireDuration.isNegative) persistor.removeItem(key);
      else storage.set(key, JSON.parse(valueParsed.value, reviver));
    } catch (e) {
      if (e instanceof Error && e.message.includes('Unexpected token'))
        continue;
      throw e;
    }
  }
};
