import { Command } from '../Classes';

/**
 * The options of an argument parser instance.
 */
export interface IArgumentParserOptions {
  /**
   * Whether to throw error while parsing or not.
   */
  throwError?: boolean;

  /**
   * Should too many arguments be allowed or not?
   */
  allowTooManyArgs?: boolean;

  /**
   * The command which will be used to parse arguments.
   */
  command?: Command | null;
}
