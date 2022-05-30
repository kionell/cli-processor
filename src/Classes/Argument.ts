import { ArgumentType } from '../Types';
import { IArgument } from '../Interfaces';
import { removeDoubleQuotes, splitByDoubleQuotes } from '../Utils';

/**
 * An argument.
 */
export class Argument<T extends string | number | boolean = string | number | boolean> implements IArgument<T> {
  /**
   * The argument description.
   */
  readonly description = '';

  /**
   * Whether the argument is required or not.
   */
  readonly isRequired = false;

  /** 
   * The number of words needed to be considered as this argument.
   */
  readonly minLength = 0;

  /** 
   * The max number of words possible to be considered as this argument.
   */
  readonly maxLength;

  /**
   * Default value of this argument.
   */
  readonly defaultValue: T = '' as T;

  /**
   * The type of this argument at runtime.
   */
  readonly type: ArgumentType = 'string';

  /**
   * Current value of this argument.
   */
  private _value: T | null = null;

  /**
   * Raw argument values.
   */
  private _raw: string[] = [];

  /**
   * Creates a new instance of an argument.
   * @param params The agrument params.
   * @constructor
   */
  constructor(params: Partial<IArgument<T>> = {}) {
    Object.assign(this, params);

    this.maxLength = Math.max(this.minLength, params?.maxLength ?? 0);
  }

  /**
   * Actual length of the argument.
   */
  get length(): number {
    return this._raw.length;
  }

  /**
   * @returns Raw input split into separate words.
   */
  *keys(): Generator<string> {
    for (const v of this._raw) yield v;
  }

  /**
   * @returns The default value of this argument converted to type of this argument.
   */
  getDefaultValue(): T {
    return this._castValue(this.defaultValue);
  }

  /**
   * @returns Current value of this argument converted to type of this argument.
   */
  getValue(): T | null {
    return this._value && this._castValue(this._value);
  }

  /**
   * @returns Current value of this argument or default value.
   */
  getValueOrDefault(): T {
    return this.getValue() ?? this.getDefaultValue();
  }

  /**
   * Sets the value of this argument.
   * @param value Input value.
   */
  setValue(value: T | null): void {
    if (value === null) {
      this._raw.length = 0;
      this._value = value;

      return;
    }

    const isString = typeof value === 'string';
    const isNumber = typeof value === 'number';
    const isBoolean = typeof value === 'boolean';

    if (!isString && !isNumber && !isBoolean) return;

    const values = splitByDoubleQuotes(value.toString());

    if (values.length < this.minLength) return;
    if (values.length > this.maxLength) return;

    this._raw = values;
    this._value = isString ? removeDoubleQuotes(value) as T : value;
  }

  /**
   * Converts a value to the type of this argument.
   * @param value Input value.
   * @returns Cast value.
   */
  private _castValue(value: unknown): T {
    switch (this.type) {
      case 'boolean':
        return Boolean(value) as T;

      case 'integer':
        return (parseInt(value as string) || Number()) as T;

      case 'float':
        return (parseFloat(value as string) || Number()) as T;
    }

    return (value ? String(value) : String()) as T;
  }

  /**
   * A string representation of the argument.
   */
  toString(): string {
    const addDoubleQuotes = (input: string) => {
      return input.split(' ').length > 1 ? `"${input}"` : input;
    };

    return this._raw.map((v) => addDoubleQuotes(v)).join(' ');
  }

  clone(): this {
    const TypedArgument = this.constructor as new (params: Partial<IArgument<T>>) => this;

    const argument = new TypedArgument({
      description: this.description,
      isRequired: this.isRequired,
      minLength: this.minLength,
      maxLength: this.maxLength,
      defaultValue: this.defaultValue,
      type: this.type,
    });

    argument.setValue(this.getValue());

    return argument;
  }

  equals(other: IArgument<T>): boolean {
    return this.getValue() === other.getValue();
  }
}
