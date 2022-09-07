import { ICloneable, IComparable } from './Types';
import { DataType, InputData, OptionType } from '../Types';

/**
 * A command option.
 */
export interface IOption<T extends InputData = InputData> extends ICloneable, IComparable {
  /**
   * Full name of this option.
   */
  name: string;

  /**
   * Shortened name of this option.
   */
  shortName: string;

  /**
   * Description of this option.
   */
  description: string;

  /**
   * Shortened description of this option.
   */
  shortDescription: string;

  /**
   * This is used to describe what kind of value is expected from this option.
   */
  expected: string;

  /**
   * Whether the option is required or not.
   */
  isRequired: boolean;

  /** 
   * The min number of words needed to be considered as this option.
   */
  minWords: number;

  /** 
   * The max number of words possible to be considered as this option.
   */
  maxWords: number;

  /** 
   * The min length of this option value.
   */
  minLength: number;

  /** 
   * The max length of this option value.
   */
  maxLength: number;

  /**
   * Default value of this option.
   */
  defaultValue: T;

  /**
   * The type of this option.
   */
  type: OptionType;

  /**
   * The type of this option data at runtime.
   */
  dataType: DataType;

  /**
   * Actual length of the option.
   */
  length: number;

  /**
   * Actual number of words of this option.
   */
  words: number;

  /**
   * Limited choices for this option.
   * This will override min & max length.
   */
  choices: T[];

  /**
   * @returns Raw input split into separate words.
   */
  keys(): Generator<string>

  /**
   * @returns The default value of this option converted to type of this option.
   */
  getDefaultValue(): T;

  /**
   * @returns Current value of this option converted to type of this option.
   */
  getValue(): T | null;

  /**
   * @returns Current value of this option or default value.
   */
  getValueOrDefault(): T;

  /**
   * Sets the value of this option.
   * @param value Input value.
   */
  setValue(value: T | null): void;
}
