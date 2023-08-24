import { Replacer, Reviver } from '../services';

export const testSanitization = (
  data: unknown,
  reviver?: Reviver,
  replacer?: Replacer,
  recursive = false
): void => {
  const type = typeof data;
  if (['function', 'object', 'symbol', 'bigint'].includes(type)) {
    switch (type) {
      case 'function':
        throw new Error(
          'The passed data is a function or contains a function, which is not serializable!'
        );
      case 'object':
        if (data === null) return;

        if (Array.isArray(data)) {
          for (const item of data)
            testSanitization(item, reviver, replacer, true);
        }
        for (const key in data)
          testSanitization(
            (data as Record<string, unknown>)[key],
            reviver,
            replacer,
            true
          );
        break;
      case 'symbol':
        throw new Error(
          recursive
            ? 'Symbol is not allowed cause it is not serializable!'
            : 'One of the values inside the passed object is a symbol and it is not serializable!'
        );
      case 'bigint':
        if (!reviver || !replacer)
          console.warn(
            'The usage of BigInt with this package is not officially supported! ' +
              'but you can pass a custom reviver and replacer to the ' +
              'PersistentStorage.create() method to handle BigInts!'
          );
    }
  }
};
