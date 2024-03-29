import { IOption } from './IOption';
import { InputData } from '../Types';

/**
 * A command flag.
 */
export interface IFlag<T extends InputData = InputData> extends IOption<T> {
  /**
   * The full prefix of this flag that will overwrite parser options.
   */
  prefix: string;

  /**
   * The short prefix of this flag that will overwrite parser options.
   */
  shortPrefix: string;

  /**
   * The list of full prefix aliases for the flags.
   */
  prefixAliases: string[];

  /**
   * The list of short prefix aliases for the flags.
   */
  shortPrefixAliases: string[];

  /**
   * The suffix of this flag.
   * Flag parser options will overwrite this.
   */
  suffix: string;

  /**
   * The list of suffix aliases for the flags.
   */
  suffixAliases: string[];
}
