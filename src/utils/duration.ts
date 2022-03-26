interface iDurationParams {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
  microseconds?: number;
}

export class Duration {
  private _days: number;
  private _hours: number;
  private _minutes: number;
  private _seconds: number;
  private _milliseconds: number;
  private _microseconds: number;

  constructor({
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
  }: iDurationParams) {
    this._days = days ?? 0;
    this._hours = hours ?? 0;
    this._minutes = minutes ?? 0;
    this._seconds = seconds ?? 0;
    this._milliseconds = milliseconds ?? 0;
    this._microseconds = microseconds ?? 0;
  }

  public get value(): number {
    return (
      this._days * 24 * 60 * 60 * 1000 +
      this._hours * 60 * 60 * 1000 +
      this._minutes * 60 * 1000 +
      this._seconds * 1000 +
      this._milliseconds +
      this._microseconds / 1000
    );
  }
}
