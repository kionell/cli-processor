import { CommandTree } from './CommandTree';

import {
  ICommand,
  IArgument,
  IHasArgument,
  IFlag,
  IHasFlags,
} from '../Interfaces';

export class CommandData {
  /**
   * The command prefix.
   */
  prefix = '';

  /**
   * The prefix of a full flag.
   */
  flagPrefix = '';

  /**
   * The command tree.
   */
  tree: CommandTree = new CommandTree();

  /**
   * Raw command line text.
   */
  private _raw = '';

  /**
   * The command name.
   */
  get name(): string {
    return this.tree.first?.name ?? '';
  }

  /**
   * The command arg.
   */
  get arg(): IArgument | null {
    return (this.tree.last as ICommand & IHasArgument)?.arg ?? null;
  }

  /**
   * The command flags.
   */
  get flags(): Map<string, IFlag> | null {
    return (this.tree.last as ICommand & IHasFlags)?.flags ?? null;
  }

  /**
   * Command line execute function.
   */
  get execute(): ((...args: any[]) => any) | null {
    /**
     * Bind command context to the command.
     */
    return this.tree.last?.execute.bind(this.tree.last) ?? null;
  }

  /**
   * Whether the command data is valid or not.
   */
  get isValid(): boolean {
    return this.name !== '' && this.tree.levels > 0;
  }

  /**
   * Raw command line data.
   */
  get raw(): string {
    return this._raw;
  }

  set raw(val: string) {
    this._raw = val ?? this._raw;
  }

  toString(): string {
    const keys = [];

    if (this.tree.levels > 0) {
      keys.push(this.prefix + this.tree.toString());
    }

    if (this.arg) keys.push(this.arg.toString());

    this.flags?.forEach((flag) => {
      const prefix = this.flagPrefix || flag.prefix;
      const prefixWithName = prefix + flag.name;
      const argument = (flag as IFlag & IHasArgument).arg;

      keys.push(argument ? `${prefixWithName} ${argument}` : prefixWithName);
    });

    return keys.join(' ');
  }
}
