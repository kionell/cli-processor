import {
  IFlag,
  IOption,
  IOptionParserConfig,
} from '../Interfaces';

import {
  addDoubleQuotes,
  splitByDoubleQuotes,
} from '../Utils';

/**
 * A command option parser.
 */
export class OptionParser {
  /**
   * Whether to throw error or not.
   */
  private _throwError = true;

  /**
   * Should too many arguments be allowed or not?
   */
  private _allowTooManyArgs = false;

  /** 
   * The prefix of a shortened flag.
   */
  private _shortPrefix?: string;

  /**
   * The prefix of a full flag.
   */
  private _fullPrefix?: string;

  /**
   * The suffix of a flag.
   */
  private _suffix?: string;

  /**
   * Array of all command flags.
   */
  private _flags: IFlag[];

  /**
   * Array of all command arguments.
   */
  private _args: IOption[];

  /**
   * Creates a new instance of a flag parser.
   * @param config The option parser config.
   */
  constructor(config: IOptionParserConfig) {
    if (!config.flags && config.throwError) {
      throw new Error('A list of flags is not found in option parser!');
    }

    if (!config.args && config.throwError) {
      throw new Error('A list of args is not found in option parser!');
    }

    this._throwError = config?.throwError ?? this._throwError;
    this._allowTooManyArgs = config?.allowTooManyArgs ?? this._allowTooManyArgs;
    this._shortPrefix = config?.shortPrefix ?? this._shortPrefix;
    this._fullPrefix = config?.fullPrefix ?? this._fullPrefix;
    this._suffix = config?.suffix ?? this._suffix;
    this._flags = config?.flags ?? [];
    this._args = config?.args ?? [];
  }

  /**
   * Takes a string and collects command options from it.
   * @param input Command line.
   * @returns Parsed command options of the current command level.
   */
  parse(input: string): IOption[] {
    let values = splitByDoubleQuotes(input);

    const parsed: IOption[] = [];
    const positions = this._findFlagPositions(values);
    const argsMinWords = this._args.reduce((minWords, current) => {
      return minWords + (current?.isRequired ? current?.minWords ?? 0 : 0);
    }, 0);

    positions.forEach((currentFlag, currentPos) => {
      const cloned = currentFlag.clone();
      const collected: string[] = [];

      /**
       * Possible args are starting from the current flag position.
       * We need to subtract 1 to skip the flag itself.
       */
      const possibleArgs = values.length - currentPos - 1;

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

      /**
       * Empty first arg because this is the flag itself.
       */
      values[currentPos] = '';

      while (++collectedArgs < possibleArgs) {
        const isEndOfFlag = positions.has(++currentPos);
        const isCollected = collectedArgs >= currentFlag.maxWords;
        const isOnMinimum = argsMinWords >= possibleArgs - collectedArgs;

        if (isEndOfFlag || isCollected || isOnMinimum) break;

        collected.push(values[currentPos]);

        /**
         * Empty this arg to mark it as processed.
         */
        values[currentPos] = '';
      }

      /**
       * We need to double quote all arguments before adding a new value.
       */
      cloned.setValue(collected.map(addDoubleQuotes).join(' '));

      this._validateOption(cloned);

      parsed.push(cloned);
    });

    values = values.filter((x) => x);

    this._args.forEach((arg, i) => {
      const last = i === this._args.length - 1;
      const cloned = arg.clone();
      const collected: string[] = [];

      while (collected.length < arg.maxWords && values.length) {
        /**
         * We want to collect at least minimum amount of values.
         * Rest of the values will be in the last argument.
         */
        if (!last && collected.length === arg.minWords) {
          break;
        }

        collected.push(values.shift() as string);
      }

      /**
       * We need to double quote all arguments before adding a new value.
       */
      cloned.setValue(collected.map(addDoubleQuotes).join(' '));

      this._validateOption(cloned);

      parsed.push(cloned);
    });

    return parsed;
  }

  /**
   * Validates specific option after setting a value.
   * @param option Option which will be validated.
   * @returns Whether option valid or not.
   */
  private _validateOption(option: IOption): boolean {
    if (option.length < option.minLength && option.isRequired) {
      if (this._throwError) {
        throw new Error(`Value of ${option.name} option is too short!`);
      }

      return false;
    }

    if (option.length > option.maxLength) {
      if (this._throwError) {
        throw new Error(`Value of ${option.name} option is too long!`);
      }

      return false;
    }

    if (option.words < option.minWords && option.isRequired) {
      if (this._throwError) {
        throw new Error(`Not enough arguments for ${option.name} option!`);
      }

      return false;
    }

    if (option.words > option.maxWords) {
      if (!this._allowTooManyArgs && this._throwError) {
        throw new Error(`Too many arguments for ${option.name} option!`);
      }

      return false;
    }

    const currentValue = option.getValue();

    if (currentValue !== null && option.choices.length > 0) {
      if (this._throwError && !option.choices.includes(currentValue)) {
        throw new Error(`Wrong value for ${option.name} option!`);
      }

      return false;
    }

    return true;
  }

  private _findFlagPositions(args: string[]): Map<number, IFlag> {
    const positions: Map<number, IFlag> = new Map<number, IFlag>();

    args.forEach((arg, index) => {
      const flag = this._getFlagByNameOrShortname(arg);

      if (flag) positions.set(index, flag);
    });

    return positions;
  }

  /**
   * Tries to find a command from the commands list by name or alias.
   * @param input Command name or alias.
   * @return The found command or null.
   */
  private _getFlagByNameOrShortname(input: string): IFlag | null {
    for (const flag of this._flags.values()) {
      const shortPrefix = flag.shortPrefix ?? this._shortPrefix ?? '';
      const fullPrefix = flag.prefix ?? this._fullPrefix ?? '';
      const suffix = flag.suffix ?? this._suffix ?? '';

      // Exact match by short version of a flag.
      if (input === shortPrefix + flag.shortName + suffix) return flag;

      // Exact match by full version of a flag.
      if (input === fullPrefix + flag.name + suffix) return flag;
    }

    return null;
  }
}
