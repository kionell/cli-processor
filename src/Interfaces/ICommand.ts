import { IArgument } from './IArgument';
import { IFlag } from './IFlag';

import {
  ICloneable,
  IStringable,
  IComparable,
} from './Types';

/**
 * A command.
 */
export interface ICommand extends ICloneable, IStringable, IComparable {
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
   * The command argument.
   */
  arg: IArgument | null;

  /**
   * The command flags.
   */
  flags?: Map<string, IFlag>;

  /**
   * The dictionary with subcommands.
   */
  subcommands?: Map<string, ICommand>;

  /**
   * The command execute function.
   */
  execute: (...args: any[]) => any;
}
