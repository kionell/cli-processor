import {
  ICommand,
  ICloneable,
  IComparable,
  IStringable,
} from '../Interfaces';

import { Argument } from './Argument';
import { Flag } from './Flag';

/**
 * A command.
 */
export class Command implements ICommand, ICloneable, IComparable, IStringable {
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
   * The command argument.
   */
  arg: Argument | null = null;

  /**
   * The command flags.
   */
  flags?: Map<string, Flag>;

  /**
   * The dictionary with subcommands.
   */
  subcommands?: Map<string, Command>;

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
   * A string representation of the argument.
   */
  toString(): string {
    return this.name;
  }

  clone(): Command {
    const TypedCommand = this.constructor as new (params: Partial<ICommand>) => this;

    const command = new TypedCommand({
      name: this.name,
      title: this.title,
      aliases: this.aliases.slice(),
      description: this.description,
      arg: this.arg?.clone() ?? null,
      execute: this.execute,
    });

    if (this.flags) {
      command.flags = new Map();

      this.flags?.forEach((entry) => {
        command.flags?.set(entry.name, entry.clone());
      });
    }

    if (this.subcommands) {
      command.subcommands = new Map();

      this.subcommands?.forEach((entry) => {
        command.subcommands?.set(entry.name, entry.clone());
      });
    }

    return command;
  }

  equals(other: Command): boolean {
    if (this.name !== other.name) return false;

    if (this.arg !== null && other.arg !== null) {
      if (!this.arg.equals(other.arg)) return false;
    }

    if (this.arg !== other.arg) return false;

    if (this.flags && other.flags) {
      for (const flag of this.flags.keys()) {
        if (!other.flags.has(flag)) return false;
      }
    }

    return true;
  }
}
