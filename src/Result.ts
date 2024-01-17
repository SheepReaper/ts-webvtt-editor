export class Result<TResult> {
  #value: TResult | null;

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  get value(): TResult {
    if (this.isFailure) throw new Error("Cannot access value of failure");
    return this.#value;
  }

  constructor(
    public readonly isSuccess: boolean,
    value: TResult | null = null
  ) {
    this.#value = value;
  }
}
