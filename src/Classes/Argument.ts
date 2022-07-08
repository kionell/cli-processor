import { Option } from './Option';
import { IFlag } from '../Interfaces';
import { InputData, OptionType } from '../Types';

/**
 * A command argument.
 */
export class Argument<T extends InputData = InputData> extends Option<T> {
  /**
   * The type of this option.
   */
  type: OptionType = OptionType.Argument;

  /**
   * A string representation of the argument.
   */
  toString(): string {
    return super.toString();
  }

  /**
   * Creates a deep copy of this argument.
   */
  clone(): this {
    return super.clone();
  }

  /**
   * Returns if these two arguments are equal.
   * @param other Other argument.
   */
  equals(other: IFlag<T>): boolean {
    return super.equals(other);
  }
}
