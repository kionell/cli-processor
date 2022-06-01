import { ICommand } from '../Interfaces';

/**
 * A command tree.
 */
export class CommandTree implements Iterable<ICommand> {
  /**
   * A command list by levels.
   */
  private _commands: ICommand[] = [];

  /**
   * The command at first level of the tree.
   */
  get first(): ICommand | null {
    return this._commands[0] ?? null;
  }

  /**
   * The command at last level of the tree.
   */
  get last(): ICommand | null {
    return this._commands[this._commands.length - 1] ?? null;
  }

  /**
   * The number of levels of this tree.
   */
  get levels(): number {
    return this._commands.length;
  }

  at(index?: number): ICommand | null {
    if (typeof index !== 'number') return null;

    return this._commands[index] ?? null;
  }

  /**
   * Adds a new level of a commands.
   * @param command The command to be added.
   */
  add(command: ICommand): void {
    this._commands.push(command);
  }

  /**
   * Removes the last level of a commands.
   * @returns The command that was deleted.
   */
  remove(): ICommand | undefined {
    return this._commands.pop();
  }

  toString(): string {
    return this._commands.map((c) => c.toString()).join(' ');
  }

  [Symbol.iterator](): Iterator<ICommand> {
    const data = this._commands;
    let i = -1;

    return {
      next: () => ({ value: data[++i], done: !(i in data) }),
    };
  }
}
