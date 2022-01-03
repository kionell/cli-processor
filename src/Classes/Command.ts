import { ICommand, ICloneable, IComparable, IStringable } from '../Interfaces';
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
  flags?: Set<Flag>;

  /**
   * The dictionary with subcommands.
   */
  subcommands?: Map<string, Command>;

  /**
   * The command execute function.
   */
  execute: (...args: any[]) => any = () => void 0;

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
    const entries = [...this.subcommands?.entries() ?? []];
    const cloned = entries.map((entry) => {
      return [entry[0], entry[1].clone()] as [string, Command];
    });

    return new Command({
      name: this.name,
      title: this.title,
      aliases: this.aliases.slice(),
      description: this.description,
      arg: this.arg?.clone() ?? null,
      flags: this.flags && new Set([...this.flags].map((f) => f.clone())),
      subcommands: this.subcommands && new Map<string, Command>(cloned),
      execute: this.execute,
    });
  }

  equals(other: Command): boolean {
    if (this.name !== other.name) return false;

    if (this.arg !== null && other.arg !== null) {
      if (!this.arg.equals(other.arg)) return false;
    }

    if (this.arg !== other.arg) return false;

    if (this.flags && other.flags) {
      for (const flag of this.flags.values()) {
        if (!other.flags.has(flag)) return false;
      }
    }

    return true;
  }
}
