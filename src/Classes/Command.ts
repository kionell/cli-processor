import {
  ICommand,
  IHasArgument,
  IHasFlags,
  IHasSubcommands,
} from '../Interfaces';

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

  clone(): this {
    const TypedCommand = this.constructor as new (params: Partial<ICommand>) => this;

    const result = new TypedCommand({
      name: this.name,
      title: this.title,
      aliases: this.aliases.slice(),
      description: this.description,
      execute: this.execute,
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const original = this as this & IHasFlags & IHasArgument & IHasSubcommands;
    const cloned = result as this & IHasFlags & IHasArgument & IHasSubcommands;

    if (original.flags) {
      cloned.flags = new Map();

      for (const flag of original.flags.values()) {
        cloned.flags.set(flag.name, flag.clone());
      }
    }

    if (original.subcommands) {
      cloned.subcommands = new Map();

      for (const subcommand of original.subcommands.values()) {
        cloned.subcommands.set(subcommand.name, subcommand.clone());
      }
    }

    if (original.arg) {
      cloned.arg = original.arg?.clone();
    }

    return result;
  }

  equals(other: Command): boolean {
    return this.name === other.name;
  }
}
