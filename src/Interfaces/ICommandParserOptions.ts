import { ICommand } from './ICommand';

/**
 * The options of a command parser instance.
 */
export interface ICommandParserOptions {
  /**
   * A command prefix that will be considered by this parser.
   */
  commandPrefix?: string;

  /**
   * A prefix of a shortened flag that will be considered by this parser.
   */
  shortFlagPrefix?: string;

  /**
   * A prefix of a full flag that will be considered by this parser.
   */
  fullFlagPrefix?: string;

  /**
   * A dictionary with all existing commands.
   */
  commandList?: Map<string, ICommand>;

  /**
   * Whether to throw error while parsing or not.
   */
  throwError?: boolean;

  /**
   * Should too many arguments be allowed or not?
   */
  allowTooManyArgs?: boolean;

  /**
   * Are commands case sensitive?
   */
  caseSensitive?: boolean;
}
