export class StoreItem<T = unknown> {
  value: T;
  expireIn?: Date;

  constructor(value: T, expireIn?: Date) {
    this.value = value;
    this.expireIn = expireIn;
  }

  fromString(str: string) {
    try {
      const { value, expireIn } = JSON.parse(str);

      return new StoreItem(value, expireIn);
    } catch {}
  }
}
