import {
  ICloneable,
  IStringable,
  IComparable,
} from './Types';

/**
 * An argument.
 */
export interface IArgument extends ICloneable, IStringable, IComparable {
  /**
   * The argument description.
   */
  description: string;

  /**
   * Stringified argument value.
   */
  value: string;

  /**
   * Split words of argument value. 
   */
  values: string[];

  /**
   * Whether the argument is required or not.
   */
  isRequired: boolean;

  /** 
   * The number of words needed to be considered as this argument.
   */
  minLength: number;

  /** 
   * The max number of words possible to be considered as this argument.
   */
  maxLength: number;
}
