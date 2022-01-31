import { IArgument, ICloneable, IComparable, IStringable } from '../Interfaces';

/**
 * An argument.
 */
export class Argument implements IArgument, ICloneable, IComparable, IStringable {
  /**
   * The argument description.
   */
  description = '';

  /**
   * Split words of argument value.
   */
  values: any[] = [];

  /**
   * Whether the argument is required or not.
   */
  isRequired = false;

  /** 
   * The number of words needed to be considered as this argument.
   */
  minLength = 0;

  /** 
   * The max number of words possible to be considered as this argument.
   */
  maxLength = 0;

  /**
   * Creates a new instance of an argument.
   * @param params The agrument params.
   * @constructor
   */
  constructor(params: Partial<IArgument> = {}) {
    Object.assign(this, params);

    this.maxLength = Math.max(this.minLength, this.maxLength);
  }

  /**
   * Stringified value of the agrument.
   */
  get value(): string {
    return this.values.join(' ');
  }

  set value(val: string) {
    this.values = val?.split(' ') ?? this.values;
  }

  /**
   * Actual length of the argument.
   */
  get length(): number {
    return this.values.length;
  }

  set length(val: number) {
    this.values.length = Math.max(0, Math.min(this.values.length, val));
  }

  /**
   * A string representation of the argument.
   */
  toString(): string {
    const addDoubleQuotes = (input: string) => {
      return input.split(' ').length > 1 ? `"${input}"` : input;
    };

    const values = this.values.map((value) => {
      if (typeof value === 'number') {
        return value.toString();
      }

      return typeof value === 'string' ? value : '';
    });

    return values
      .filter((v) => v)
      .map((v) => addDoubleQuotes(v))
      .join(' ');
  }

  clone(): Argument {
    return new Argument({
      description: this.description,
      values: this.values.slice(),
      isRequired: this.isRequired,
      minLength: this.minLength,
      maxLength: this.maxLength,
    });
  }

  equals(other: Argument): boolean {
    if (this.length !== other.length) return false;

    for (const value of this.values) {
      if (!other.values.includes(value)) return false;
    }

    return true;
  }
}
