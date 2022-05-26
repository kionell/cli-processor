import { ArgumentType } from '../Types';
import { ICloneable, IComparable } from './Types';

/**
 * An argument.
 */
export interface IArgument<
  T extends string | number | boolean = string | number | boolean
> extends ICloneable, IComparable {
  /**
   * The argument description.
   */
  readonly description: string;

  /**
   * Whether the argument is required or not.
   */
  readonly isRequired: boolean;

  /** 
   * The number of words needed to be considered as this argument.
   */
  readonly minLength: number;

  /** 
   * The max number of words possible to be considered as this argument.
   */
  readonly maxLength: number;

  /**
   * Default value of this argument.
   */
  readonly defaultValue: T;

  /**
   * The type of this argument at runtime.
   */
  readonly type: ArgumentType;

  /**
   * Actual length of the argument.
   */
  readonly length: number;

  /**
   * @returns Raw input split into separate words.
   */
  keys(): Generator<string>

  /**
   * @returns The default value of this argument converted to type of this argument.
   */
  getDefaultValue(): T;

  /**
   * @returns Current value of this argument converted to type of this argument.
   */
  getValue(): T | null;

  /**
   * @returns Current value of this argument or default value.
   */
  getValueOrDefault(): T;

  /**
   * Sets the value of this argument.
   * @param value Input value.
   */
  setValue(value: T | null): void;
}
