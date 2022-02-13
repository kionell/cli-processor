import { Command } from '../Classes';

/**
 * The options of an argument parser instance.
 */
export interface IFlagParserOptions {
  /**
   * Whether to throw error while parsing or not.
   */
  throwError?: boolean;

  /** 
   * The prefix of a shortened flag.
   */
  shortPrefix: string,

  /**
   * The prefix of a full flag.
   */
  fullPrefix: string,

  /**
   * The command which will be used to parse arguments.
   */
  command: Command,
}
