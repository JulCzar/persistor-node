import { NodeStorage } from '../services/NodeStorage';

export const getAvailableStorage = () => {
  const isBrowser = typeof window !== 'undefined';

  return isBrowser
    ? window.localStorage
    : new NodeStorage();
};
