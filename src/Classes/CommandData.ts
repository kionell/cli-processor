import { Argument } from './Argument';
import { Flag } from './Flag';
import { CommandTree } from './CommandTree';

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
   * The command name.
   */
  get name(): string {
    return this.tree.first?.name ?? '';
  }

  /**
   * The command arg.
   */
  get arg(): Argument | null {
    return this.tree.last?.arg ?? null;
  }

  /**
   * The command flags.
   */
  get flags(): Set<Flag> {
    return this.tree.last?.flags ?? new Set<Flag>();
  }

  /**
   * Command line execute function.
   */
  get execute(): ((...args: any[]) => any) | null {
    return this.tree.last?.execute ?? null;
  }

  get isValid(): boolean {
    return this.name !== '' && this.tree.levels > 0;
  }

  toString(): string {
    const keys = [];

    if (this.tree.levels > 0) {
      keys.push(this.prefix + this.tree.toString());
    }

    if (this.arg) keys.push(this.arg.toString());

    this.flags.forEach((flag) => {
      keys.push(this.flagPrefix + flag.toString());
    });

    return keys.join(' ');
  }
}
