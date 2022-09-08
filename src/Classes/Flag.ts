import { Option } from './Option';
import { IFlag } from '../Interfaces';
import { InputData, OptionType } from '../Types';

/**
 * A command flag.
 */
export class Flag<T extends InputData = InputData> extends Option<T> implements IFlag<T> {
  /**
   * The full prefix of this flag that will overwrite parser options.
   */
  prefix = '--';

  /**
   * The short prefix of this flag that will overwrite parser options.
   */
  shortPrefix = '-';

  /**
   * The list of full prefix aliases for the flags.
   */
  prefixAliases: string[] = [];

  /**
   * The list of short prefix aliases for the flags.
   */
  shortPrefixAliases: string[] = [];

  /**
   * The suffix of this flag.
   * Flag parser options will overwrite this.
   */
  suffix = '';

  /**
   * The list of suffix aliases for the flags.
   */
  suffixAliases: string[] = [];

  /**
   * The type of this option.
   */
  type: OptionType = OptionType.Flag;

  /**
   * A string representation of the flag.
   */
  toString(): string {
    return this.prefix + this.name + this.suffix + ' ' + super.toString();
  }

  /**
   * Creates a deep copy of this flag.
   */
  clone(): this {
    const result = super.clone();

    result.prefix = this.prefix;
    result.shortPrefix = this.shortPrefix;
    result.suffix = this.suffix;

    return result;
  }

  /**
   * Returns if these two flags are equal.
   * @param other Other flag.
   */
  equals(other: IFlag<T>): boolean {
    return super.equals(other)
      && this.name === other.name
      && this.shortName === other.shortName;
  }
}
