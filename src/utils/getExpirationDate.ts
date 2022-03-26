import { Duration } from './duration';

/** return the expiration date of the item from an time in minutes */
export const getExpirationDate = (minutes?: number) => {
  if (!minutes) return undefined;

  const now = Date.now();
  const lifeSpan = new Duration({ minutes });

  return new Date(now + lifeSpan.value);
};