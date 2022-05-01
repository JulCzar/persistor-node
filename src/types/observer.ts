export interface StoreEvent {
  type: 'GET' | 'SET' | 'REMOVE' | 'CLEAR';
  payload?: any;
}

export type Observer = (event: StoreEvent) => void;
export type Unsubscriber = () => void;
