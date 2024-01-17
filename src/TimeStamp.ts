export class TimeStamp {
  #valueMs: number;

  public static stringValidator = /^\d{1,2}:\d{1,2}:\d{1,2}(\.\d{1,3})?$/;

  get hours(): number {
    return Math.floor(this.#valueMs / 3600000);
  }

  get minutes(): number {
    return Math.floor((this.#valueMs % 3600000) / 60000);
  }

  get seconds(): number {
    return Math.floor((this.#valueMs % 60000) / 1000);
  }

  get milliseconds(): number {
    return this.#valueMs % 1000;
  }

  constructor(msec = 0) {
    this.#valueMs = Math.round(msec);
  }

  public static fromString(stampString: string): TimeStamp {
    // Regex pattern to match hh:mm:ss[.mmm]
    // Hours, minutes, and seconds can have 1 or 2 digits. Milliseconds can have 1 to 3 digits and are optional.
    if (!TimeStamp.stringValidator.test(stampString)) {
      throw new Error(
        "Invalid timestamp format. Expected format: hh:mm:ss[.mmm]",
      );
    }

    return new TimeStamp(TimeStamp.parseToMs(stampString));
  }

  public addMs(msec: number): void {
    if (this.#valueMs + msec < 0) {
      throw new Error("Resulting time cannot be negative.");
    }

    this.#valueMs += msec;
  }

  public addSec(seconds: number): void {
    this.addMs(seconds * 1000);
  }

  public addMin(minutes: number): void {
    this.addMs(minutes * 60000);
  }

  public addHours(hours: number): void {
    this.addMs(hours * 3600000);
  }

  public subMs(msec: number): void {
    this.addMs(-msec);
  }

  public subSec(seconds: number): void {
    this.addSec(-seconds);
  }

  public subMin(minutes: number): void {
    this.addMin(-minutes);
  }

  public subHours(hours: number): void {
    this.addHours(-hours);
  }

  public toString(): string {
    const hoursPadded = this.hours.toString().padStart(2, "0");
    const minutesPadded = this.minutes.toString().padStart(2, "0");
    const secondsPadded = this.seconds.toString().padStart(2, "0");
    const millisecondsPadded = this.milliseconds.toString().padStart(3, "0");

    return `${hoursPadded}:${minutesPadded}:${secondsPadded}.${millisecondsPadded}`;
  }

  public clone(): TimeStamp {
    return new TimeStamp(this.#valueMs);
  }

  static parseToMs(stampString: string): number {
    const [hours, minutes, seconds] = stampString.split(":");

    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseFloat(seconds) * 1000
    );
  }

  static replacer(_key: any, value: any) {
    if (value instanceof TimeStamp) {
      return value.toString();
    }

    return value;
  }

  static reviver(_key: any, value: any) {
    if (typeof value === "string" && TimeStamp.stringValidator.test(value)) {
      return TimeStamp.fromString(value);
    }
    
    return value;
  }
}
