import {
  IFlag,
  IOption,
  IOptionParserConfig,
} from '../Interfaces';

import {
  addDoubleQuotes,
  convertFlagsToRegExp,
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
   * A prefix for all shortened flags that will be considered by this parser.
   */
  private _shortPrefix?: string;

  /**
   * A prefix for all full flags that will be considered by this parser.
   */
  private _fullPrefix?: string;

  /**
   * A suffix for all flags that will be considered by this parser.
   */
  private _suffix?: string;

  /**
   * A trimmable custom option key/value separator that will be considered by this parser.
   */
  private _separator?: string;

  /**
   * Array of all command flags.
   */
  private _flags: IFlag[];

  /**
   * Array of all command arguments.
   */
  private _args: IOption[];

  /**
   * Mapping for all flag regular expressions.
   */
  private _flagRegexes: Map<IFlag, RegExp[]>;

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
    this._separator = config?.separator ?? this._separator;
    this._flags = config?.flags ?? [];
    this._args = config?.args ?? [];

    this._flagRegexes = convertFlagsToRegExp(this._flags, {
      fullPrefix: this._fullPrefix,
      shortPrefix: this._shortPrefix,
      suffix: this._suffix,
      separator: this._separator,
    });
  }

  /**
   * Takes a string and collects command options from it.
   * @param input Command line.
   * @returns Parsed command options of the current command level.
   */
  parse(input: string): IOption[] {
    let values = this._removeSeparators(splitByDoubleQuotes(input));

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

    if (values.length > 0 && !this._allowTooManyArgs && this._throwError) {
      throw new Error('Too many arguments!');
    }

    return parsed;
  }

  private _removeSeparators(args: string[]): string[] {
    return args.flatMap((arg) => {
      const entry = this._findFlagRegexEntry(arg);

      if (!entry) return arg;

      const [flag, regexes] = entry;

      /**
       * We split stuff through this weird way to make sure we don't 
       * mess up with flags that have separator inside their name.
       * First regex is for short version of a flag and the second is for full flags.
       * Prioritize the longest regex from these two because 
       * shorter one can sometimes replace only part of the string. 
       */
      let [shorterRegex, longerRegex] = regexes;

      if (shorterRegex.source.length > longerRegex.source.length) {
        [shorterRegex, longerRegex] = [longerRegex, shorterRegex];
      }

      const secondPart = longerRegex.test(arg)
        ? arg.replace(longerRegex, '')
        : arg.replace(shorterRegex, '');

      const firstPartWithSeparator = arg.substring(0, arg.lastIndexOf(secondPart));

      const separators = [flag.separator, ...flag.separatorAliases];

      for (const separator of separators) {
        if (separator === '' || !firstPartWithSeparator.endsWith(separator)) {
          continue;
        }

        const firstPart = firstPartWithSeparator.slice(0, -separator.length);

        return [firstPart, secondPart];
      }

      return arg;
    });
  }

  private _findFlagPositions(args: string[]): Map<number, IFlag> {
    const positions: Map<number, IFlag> = new Map<number, IFlag>();

    args.forEach((arg, index) => {
      const entry = this._findFlagRegexEntry(arg);

      if (entry) positions.set(index, entry[0]);
    });

    return positions;
  }

  /**
   * Tries to find an entry in the flag regexp map by input string.
   * @param input An input string with possible flag.
   * @return The found entry in the flag regexp map or null.
   */
  private _findFlagRegexEntry(input: string): [IFlag, RegExp[]] | null {
    for (const entry of this._flagRegexes) {
      const regex = entry[1];

      const longestRegex = regex[0].source.length > regex[1].source.length
        ? regex[0]
        : regex[1];

      if (longestRegex.test(input)) return entry;
    }

    for (const entry of this._flagRegexes) {
      const regex = entry[1];

      const shortestRegex = regex[0].source.length > regex[1].source.length
        ? regex[1]
        : regex[0];

      if (shortestRegex.test(input)) return entry;
    }

    return null;
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

    if (currentValue !== null && option.matchPattern) {
      const matchableValue = [...option.keys()].join(' ');

      if (this._throwError && !option.matchPattern.test(matchableValue)) {
        throw new Error(`Wrong value for ${option.name} option!`);
      }

      return false;
    }

    return true;
  }
}
