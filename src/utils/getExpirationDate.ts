import { Duration } from './duration';
import { addMilliseconds } from 'date-fns'

/** return the expiration date of the item from an time in minutes */
export const getExpirationDate = (duration?: number | Duration) => {
  if (!duration) return undefined;

  const now = new Date();
  
  const lifeSpan = typeof duration === 'number' ? new Duration({ minutes: duration }) : duration;

  return addMilliseconds(now, lifeSpan.inMilliseconds);
};
