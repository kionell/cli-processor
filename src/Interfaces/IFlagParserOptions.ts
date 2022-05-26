import { ICommand } from './ICommand';
import { IHasFlags } from './Types';

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
   * The command which will be used to parse flags.
   */
  command: ICommand & IHasFlags,
}
