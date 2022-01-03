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
   * The raw args that will be parsed.
   */
  args: string[];

  /**
   * The command which will be used to parse arguments.
   */
  command: Command;
}
