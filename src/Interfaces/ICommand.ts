import { IOption } from './IOption';
import { ICloneable, IComparable } from './Types';
import { OptionType } from '../Types';

/**
 * A command.
 */
export interface ICommand extends ICloneable, IComparable {
  /**
   * The command name.
   */
  name: string;

  /**
   * The command aliases.
   */
  aliases: string[];

  /**
   * The command title.
   */
  title: string;

  /**
   * The command description.
   */
  description: string;

  /**
   * Shortened description of this command.
   */
  shortDescription: string;

  /**
   * Example usage of this command.
   */
  examples: string[];

  /**
   * The list of command options.
   */
  options: IOption[];

  /**
   * Subcommands of this command.
   */
  subcommands: Map<string, ICommand>;

  /**
   * Adds a new option to this command.
   * @param option Option instance.
   */
  addOption(option: IOption): void;
  /**
   * Adds a new subcommand to this command.
   * @param subcommand Subcommand instance.
   */
  addSubcommand(subcommand: ICommand): void;
  /**
   * Returns if array of options has any option of specific type.
   * @param type Target option type.
   */
  hasOptionOfType(type: OptionType): boolean;

  /**
   * Returns all options of specific type.
   * @param type Target option type.
   * @returns Filtered option array.
   */
  getOptionsOfType(type: OptionType): IOption[];

  /**
   * Searches for an actual option instance by option name.
   * @param name Option name.
   * @returns Option instance or null if not found.
   */
  getOptionByName(name: string): IOption | null;

  /**
   * Searches for an actual option instance by a class.
   * @param Option Option class.
   * @returns Option instance or null if not found.
   */
  getOption<T extends IOption>(Option: new () => T): T | null;

  /**
   * Tries to get current value of the specified option.
   * @param Option Option class.
   * @returns Current value or null.
   */
  getValue<T extends IOption>(Option: new () => T): ReturnType<T['getValue']>;

  /**
   * Gets current or default value of the specified option.
   * @param Option Option class.
   * @returns Current or default value of the option.
   */
  getValueOrDefault<T extends IOption>(Option: new () => T): ReturnType<T['getValueOrDefault']>;

  /**
   * The command execute function.
   */
  execute: (...args: any[]) => any;
}
