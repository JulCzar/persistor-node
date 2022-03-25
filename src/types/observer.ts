export interface StoreEvent {
  type: 'GET' | 'SET' | 'REMOVE' | 'CLEAR';
}

export type Observer = (event: StoreEvent) => void;
