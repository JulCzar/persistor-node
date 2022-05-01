export const DATE_IS_INVALID = new Error('Date is Invalid');
export const STRUCTURE_NON_EXISTENT = new Error('Structure does not exist');
export const STRUCTURE_IS_INVALID = new Error('Structure is invalid');
export const STRUCTURE_EXPIRED = new Error('Structure expired');
export const STORAGE_EXPIRED = new Error('Storage expired');

export const internalErrors = [
  STRUCTURE_NON_EXISTENT,
  STRUCTURE_IS_INVALID,
  STRUCTURE_EXPIRED,
  STORAGE_EXPIRED,
  DATE_IS_INVALID,
];
