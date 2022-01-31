import { Argument, Flag } from '../Classes';

/**
 * A command.
 */
export interface ICommand {
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
  arg: Argument | null;

  /**
   * The command flags.
   */
  flags?: Map<string, Flag>;

  /**
   * The dictionary with subcommands.
   */
  subcommands?: Map<string, ICommand>;

  /**
   * The command execute function.
   */
  execute: (...args: any[]) => any;
}
