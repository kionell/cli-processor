import { Flag, Command } from '../Classes';
import { IFlagParserOptions } from '../Interfaces';

/**
 * A flag parser.
 */
export class FlagParser {
  /**
   * Whether to throw error or not.
   */
  private _throwError = true;

  /**
   * The raw args that will be parsed;
   */
  private _args: string[] = [];

  /**
   * The command which will be used to parse arguments.
   */
  private _command: Command;

  /** 
   * The prefix of a shortened flag.
   */
  private _shortPrefix = '-';

  /**
   * The prefix of a full flag.
   */
  private _fullPrefix = '--';

  /**
   * The list of all command flags.
   */
  private _flags: Set<Flag>;

  /**
   * Creates a new instance of a flag parser.
   * @param options The flag parser options.
   */
  constructor(options: IFlagParserOptions) {
    this._throwError = options.throwError ?? this._throwError;
    this._args = options.args ?? this._args;
    this._command = options.command;
    this._shortPrefix = options.shortPrefix ?? this._shortPrefix;
    this._fullPrefix = options.fullPrefix ?? this._fullPrefix;
    this._flags = options.command?.flags ?? new Set<Flag>();
  }

  /**
   * @returns Parsed command flags of the current command level.
   */
  parse(): Set<Flag> {
    const parsed: Set<Flag> = new Set<Flag>();
    const positions = this._findFlagPositions();
    const cmdMinLength = this._command.arg?.isRequired
      ? this._command.arg?.minLength ?? 0 : 0;

    positions.forEach((currentFlag, currentPos) => {
      const clonedFlag = currentFlag.clone();

      const possibleArgs = this._args.length - currentPos;
      const flagMinLength = clonedFlag.arg?.minLength ?? 0;
      const flagMaxLength = clonedFlag.arg?.maxLength ?? 0;

      /**
       * Replace flag name with empty string.
       */
      this._args[currentPos] = '';

      /**
       * Collecting the flag arguments. We go through all arguments 
       * from the beginning of the flag to reaching one of the options:
       *  1) end of the number of possible arguments.
       *  2) end of the current flag.
       *  3) flag has collected all of its args.
       *  4) minimum number of arguments at which it is possible 
       *     to receive command arguments if the flag is infinite.
       */
      let collectedArgs = -1;

      while (++collectedArgs < possibleArgs) {
        const isEndOfFlag = positions.has(++currentPos);
        const isCollected = collectedArgs >= flagMaxLength;
        const isOnMinimum = cmdMinLength >= possibleArgs - collectedArgs;

        if (isEndOfFlag || isCollected || isOnMinimum) break;

        clonedFlag.arg?.values.push(this._args[currentPos]);

        /**
         * Replace flag arg with empty string.
         */
        this._args[currentPos] = '';
      }

      /**
       * Throw an error if there are not enough arguments.
       */
      if (collectedArgs < flagMinLength) {
        if (this._throwError) {
          throw new Error(`Not enough arguments for ${currentFlag.name} flag!`);
        }

        return;
      }

      parsed.add(clonedFlag);
    });

    return parsed;
  }

  private _findFlagPositions(): Map<number, Flag> {
    const positions: Map<number, Flag> = new Map<number, Flag>();

    this._args.forEach((arg, index) => {
      const flag = this._getFlagByNameOrAlias(arg);

      if (flag) positions.set(index, flag);
    });

    return positions;
  }

  /**
   * Tries to find a command from the commands list by name or alias.
   * @param input Command name or alias.
   * @return The found command or null.
   */
  private _getFlagByNameOrAlias(input: string): Flag | null {
    const hasShortPrefix = this._hasShortPrefix(input);
    const hasFullPrefix = this._hasFullPrefix(input);

    input = this._removePrefix(input);

    for (const flag of this._flags.values()) {
      if (flag.name === input && hasFullPrefix) return flag;
      if (flag.shortName === input && hasShortPrefix) return flag;
    }

    return null;
  }

  private _removePrefix(input: string): string {
    if (this._hasShortPrefix(input)) {
      return input.substring(this._shortPrefix.length);
    }

    if (this._hasFullPrefix(input)) {
      return input.substring(this._fullPrefix.length);
    }

    return input;
  }

  private _hasShortPrefix(input: string): boolean {
    return new RegExp(`^${this._shortPrefix}[^${this._shortPrefix}]`).test(input);
  }

  private _hasFullPrefix(input: string): boolean {
    return new RegExp(`^${this._fullPrefix}[^${this._fullPrefix}]`).test(input);
  }
}
