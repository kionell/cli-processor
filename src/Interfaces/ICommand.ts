import { ICloneable, IComparable } from './Types';

/**
 * A command.
 */
export interface ICommand extends ICloneable, IComparable {
  /**
   * The command name.
   */
  name: string;

  /**
   * The command title.
   */
  title: string;

  /**
   * The command aliases.
   */
  aliases: string[];

  /**
   * The command description.
   */
  description: string;

  /**
   * The command execute function.
   */
  execute: (...args: any[]) => any;
}
