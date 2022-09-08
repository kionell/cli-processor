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
   * A prefix for all shortened flags that will be considered by this parser.
   */
  shortPrefix?: string;

  /**
   * A prefix for all full flags that will be considered by this parser.
   */
  fullPrefix?: string;

  /**
   * A suffix for all flags that will be considered by this parser.
   */
  suffix?: string;

  /**
   * A trimmable custom option key/value separator that will be considered by this parser.
   */
  separator?: string;

  /**
   * Array of all flags of target commands.
   */
  flags?: IFlag[];

  /**
   * Array of all args of target commands.
   */
  args?: IOption[];
}
