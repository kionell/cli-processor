import { CommandTree } from './CommandTree';
import { IOption } from '../Interfaces';

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
   * The command options.
   */
  get options(): IOption[] | null {
    return this.tree.last?.options ?? null;
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

    this.options?.forEach((option) => {
      keys.push(option.toString());
    });

    return keys.join(' ');
  }
}
