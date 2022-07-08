import { IFlag } from './IFlag';
import { IOption } from './IOption';

/**
 * Config for an argument parser instance.
 */
export interface IOptionParserConfig {
  /**
   * Whether to throw error while parsing or not.
   */
  throwError?: boolean;

  /**
   * Should too many arguments be allowed or not?
   */
  allowTooManyArgs?: boolean;

  /** 
   * The prefix of a shortened flag.
   */
  shortPrefix?: string,

  /**
   * The prefix of a full flag.
   */
  fullPrefix?: string,

  /**
   * The suffix of a flag.
   */
  suffix?: string;

  /**
   * Array of all flags of target commands.
   */
  flags?: IFlag[];

  /**
   * Array of all args of target commands.
   */
  args?: IOption[];
}
