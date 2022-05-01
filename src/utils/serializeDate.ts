import { format } from 'date-fns';
import { DATE_FORMAT } from '../constants';

export const serializeDate = (date: Date | undefined) => {
  if (!date) return undefined;

  return format(date, DATE_FORMAT);
};
