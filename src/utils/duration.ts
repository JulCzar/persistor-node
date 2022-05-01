interface iDurationParams {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
  microseconds?: number;
}

export class Duration {
  /** the duration of a non leap year, 365 days */
  static YEAR = new Duration({ days: 365 });
  /** the duration of a comercial month, 30 days */
  static MONTH = new Duration({ days: 30 });
  /** the duration of a day */
  static DAY = new Duration({ days: 1 });
  /** the duration of an hour */
  static HOUR = new Duration({ hours: 1 });
  /** the duration of a minute */
  static MINUTE = new Duration({ minutes: 1 });
  /** the duration of a second */
  static SECOND = new Duration({ seconds: 1 });
  /** the duration of a millisecond */
  static MILLISECOND = new Duration({ milliseconds: 1 });
  /** the duration of a microsecond */
  static MICROSECOND = new Duration({ microseconds: 1 });

  private _days: number;
  private _hours: number;
  private _minutes: number;
  private _seconds: number;
  private _milliseconds: number;
  private _microseconds: number;

  /** this class don't guarantee the execution will be precisely runned in a
   * specific time, it just does the calculation in an desired unit for you */
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

  get inDays(): number {
    return (
      this._days +
      this._hours / 24 +
      this._minutes / 24 / 60 +
      this._seconds / 24 / 60 / 60
    );
  }

  get inHours(): number {
    return (
      this._days * 24 +
      this._hours +
      this._minutes / 60 +
      this._seconds / 60 / 60 +
      this._milliseconds / 1000 / 60 / 60 +
      this._microseconds / 1000 / 60 / 60 / 1000
    );
  }

  /** return how many minutes are in this duration */
  get inMinutes(): number {
    return (
      this._days * 24 * 60 +
      this._hours * 60 +
      this._minutes +
      this._seconds / 60 +
      this._milliseconds / 1000 +
      this._microseconds / 1000 / 1000
    );
  }

  get inSeconds(): number {
    return (
      this._days * 24 * 60 * 60 +
      this._hours * 60 * 60 +
      this._minutes * 60 +
      this._seconds +
      this._milliseconds / 1000 +
      this._microseconds / 1000 / 1000
    );
  }

  get inMilliseconds(): number {
    return (
      this._days * 24 * 60 * 60 * 1000 +
      this._hours * 60 * 60 * 1000 +
      this._minutes * 60 * 1000 +
      this._seconds * 1000 +
      this._milliseconds +
      this._microseconds / 1000
    );
  }

  get inMicroseconds(): number {
    return (
      this._days * 24 * 60 * 60 * 1000 * 1000 +
      this._hours * 60 * 60 * 1000 * 1000 +
      this._minutes * 60 * 1000 * 1000 +
      this._seconds * 1000 * 1000 +
      this._milliseconds * 1000 +
      this._microseconds
    );
  }
}
