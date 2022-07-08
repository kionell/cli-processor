import { ICommand, IOption } from '../Interfaces';
import { OptionType } from '../Types';

/**
 * A command.
 */
export class Command implements ICommand {
  /**
   * The command name.
   */
  name = '';

  /**
   * The command aliases.
   */
  aliases: string[] = [];

  /**
   * The command title.
   */
  title = '';

  /**
   * The command description.
   */
  description = '';

  /**
   * Shortened description of this command.
   */
  shortDescription = '';

  /**
   * Example usage of this command.
   */
  examples: string[] = [];

  /**
   * The list of command options.
   */
  options: IOption[] = [];

  /**
   * Subcommands of this command.
   */
  subcommands: Map<string, ICommand> = new Map();

  /**
   * The command execute function.
   */
  execute(...args: any[]): any {
    return args;
  }

  /**
   * Creates a new instance of a command.
   * @param params The command params.
   * @constructor
   */
  constructor(params: Partial<ICommand> = {}) {
    Object.assign(this, params);
  }

  /**
   * Adds a new option to this command.
   * @param option Option instance.
   */
  addOption(option: IOption): void {
    this.options.push(option);
  }

  /**
   * Adds a new subcommand to this command.
   * @param subcommand Subcommand instance.
   */
  addSubcommand(subcommand: ICommand): void {
    this.subcommands.set(subcommand.name, subcommand);
  }

  /**
   * Returns if array of options has any option of specific type.
   * @param type Target option type.
   */
  hasOptionOfType(type: OptionType): boolean {
    if (!this.options.length) return false;

    for (const option of this.options) {
      if (option.type === type) return true;
    }

    return false;
  }

  /**
   * Returns all options of specific type.
   * @param type Target option type.
   * @returns Filtered option array.
   */
  getOptionsOfType(type: OptionType): IOption[] {
    return this.options.filter((o) => o.type === type);
  }

  /**
   * Searches for an actual option instance by option name.
   * @param name Option name.
   * @returns Option instance or null if not found.
   */
  getOptionByName(name: string): IOption | null {
    if (!this.options.length) return null;

    for (const option of this.options) {
      if (option.name === name) return option;
    }

    return null;
  }

  /**
   * Searches for an actual option instance by a class.
   * @param Option Option class.
   * @returns Option instance or null if not found.
   */
  getOption<T extends IOption>(Option: new () => T): T | null {
    if (!this.options.length) return null;

    for (const option of this.options) {
      if (option instanceof Option) return option;
    }

    return null;
  }

  /**
   * Tries to get current value of the specified option.
   * @param Option Option class.
   * @returns Current value or null.
   */
  getValue<T extends IOption>(Option: new () => T): ReturnType<T['getValue']> {
    const value = this.getOption(Option)?.getValue() ?? null;

    return value as ReturnType<T['getValue']>;
  }

  /**
   * Gets current or default value of the specified option.
   * @param Option Option class.
   * @returns Current or default value of the option.
   */
  getValueOrDefault<T extends IOption>(Option: new () => T): ReturnType<T['getValueOrDefault']> {
    const value = this.getOption(Option)?.getValueOrDefault() ?? String();

    return value as ReturnType<T['getValueOrDefault']>;
  }

  /**
   * A string representation of the argument.
   */
  toString(): string {
    return this.name;
  }

  clone(): this {
    const TypedCommand = this.constructor as new (params: Partial<ICommand>) => this;

    const cloned = new TypedCommand({
      name: this.name,
      aliases: this.aliases,
      title: this.title,
      description: this.description,
      shortDescription: this.shortDescription,
      examples: this.examples,
      options: this.options.map((o) => o.clone()),
      execute: this.execute,
    });

    cloned.subcommands = new Map();

    for (const subcommand of this.subcommands.values()) {
      cloned.subcommands.set(subcommand.name, subcommand.clone());
    }

    return cloned;
  }

  equals(other: Command): boolean {
    return this.name === other.name;
  }
}
