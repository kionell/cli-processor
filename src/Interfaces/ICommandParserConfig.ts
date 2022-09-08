import { ICommand } from './ICommand';

/**
 * Config for a command parser instance.
 */
export interface ICommandParserConfig {
  /**
   * A command prefix that will be considered by this parser.
   */
  commandPrefix?: string;

  /**
   * A prefix for all shortened flags that will be considered by this parser.
   */
  shortFlagPrefix?: string;

  /**
   * A prefix for all full flags that will be considered by this parser.
   */
  fullFlagPrefix?: string;

  /**
   * A suffix for all flags that will be considered by this parser.
   */
  flagSuffix?: string;

  /**
   * A dictionary with all existing commands.
   */
  commandList?: Map<string, ICommand> | null;

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
