import { IOption } from '../Interfaces';
import { DataType, InputData, OptionType } from '../Types';
import { addDoubleQuotes, removeDoubleQuotes, splitByDoubleQuotes } from '../Utils';

/**
 * A command option.
 */
export abstract class Option<T extends InputData = InputData> implements IOption<T> {
  /**
   * Full name of this option.
   */
  name = '';

  /**
   * Shortened name of this option.
   */
  shortName = '';

  /**
   * The aliases for the full name of this option.
   */
  aliases: string[] = [];

  /**
   * The aliases for the short name of this option.
   */
  shortAliases: string[] = [];

  /**
   * Trimmable custom key/value separator. 
   */
  separator = ' ';

  /**
   * The aliases for the option key/value separator.
   */
  separatorAliases: string[] = [];

  /**
   * Description of this option.
   */
  description = '';

  /**
   * Shortened description of this option.
   */
  shortDescription = '';

  /**
   * This is used to describe what kind of value is expected from this option.
   */
  expected = '';

  /**
   * Example of the possible values for this option.
   */
  examples: string[] = [];

  /**
   * Whether the option is required or not.
   */
  isRequired = false;

  /** 
   * The min number of words needed to be considered as this option.
   */
  minWords = 0;

  /** 
   * The max number of words possible to be considered as this option.
   */
  maxWords: number;

  /** 
   * The min length of this option value.
   */
  minLength = 0;

  /** 
   * The max length of this option value.
   */
  maxLength = Infinity;

  /**
   * Default value of this option.
   */
  defaultValue: T = '' as T;

  /**
   * The type of this option data at runtime.
   */
  dataType: DataType = DataType.String;

  /**
   * Limited choices for this option.
   * This will override min & max length.
   */
  choices: T[] = [];

  /**
   * A regular expression to validate values for this option.
   */
  matchPattern: RegExp | null = null;

  /**
   * The type of this option.
   */
  abstract type: OptionType;

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
  constructor(params: Partial<IOption<T>> = {}) {
    Object.assign(this, params);

    this.maxWords = Math.max(this.minWords, params?.maxWords ?? 0);
  }

  /**
   * Actual length of the option.
   */
  get length(): number {
    return this._value?.toString().length ?? 0;
  }

  get words(): number {
    return this._raw.length;
  }

  *keys(): Generator<string> {
    for (const v of this._raw) yield v;
  }

  getDefaultValue(): T {
    return this._castValue(this.defaultValue);
  }

  getValue(): T | null {
    return this._value && this._castValue(this._value);
  }

  getValueOrDefault(): T {
    return this.getValue() ?? this.getDefaultValue();
  }

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

    if (values.length < this.minWords) return;
    if (values.length > this.maxWords) return;

    this._raw = values;
    this._value = isString ? removeDoubleQuotes(value as string) as T : value;
  }

  /**
   * Converts a value to the type of this argument.
   * @param value Input value.
   * @returns Cast value.
   */
  private _castValue(value: unknown): T {
    switch (this.dataType) {
      case DataType.Boolean:
        return Boolean(value) as T;

      case DataType.Integer:
        return (parseInt(value as string) || Number()) as T;

      case DataType.Float:
        return (parseFloat(value as string) || Number()) as T;
    }

    return (value ? String(value) : String()) as T;
  }

  /**
   * A string representation of the option.
   */
  toString(): string {
    return this._raw.map((v) => addDoubleQuotes(v)).join(' ');
  }

  /**
   * Creates a deep copy of this option.
   */
  clone(): this {
    const TypedOption = this.constructor as new (params: Partial<IOption<T>>) => this;

    const option = new TypedOption({
      name: this.name,
      shortName: this.shortName,
      description: this.description,
      shortDescription: this.shortDescription,
      expected: this.expected,
      isRequired: this.isRequired,
      minWords: this.minWords,
      maxWords: this.maxWords,
      minLength: this.minLength,
      maxLength: this.maxLength,
      defaultValue: this.defaultValue,
      dataType: this.dataType,
      choices: this.choices,
      type: this.type,
    });

    option.setValue(this.getValue());

    return option;
  }

  /**
   * Returns if these two options are equal.
   * @param other Other option.
   */
  equals(other: IOption<T>): boolean {
    return this.getValue() === other.getValue();
  }
}
