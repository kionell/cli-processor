import { splitByDoubleQuotes } from '../Utils';

import {
  IArgumentParserOptions,
  IArgument,
  ICommand,
  IHasArgument,
} from '../Interfaces';

/**
 * An argument parser.
 */
export class ArgumentParser {
  /**
   * Whether to throw error or not.
   */
  private _throwError = true;

  /**
   * Should too many arguments be allowed or not?
   */
  private _allowTooManyArgs = false;

  /**
   * The command which will be used to parse arguments.
   */
  private _command: ICommand & IHasArgument;

  /**
   * The argument instance that will be used to parse argument.
   */
  private _arg: IArgument;

  /**
   * Creates a new instance of an argument parser.
   * @param options The argument parser options.
   * @constructor
   */
  constructor(options: IArgumentParserOptions) {
    this._throwError = options?.throwError ?? this._throwError;
    this._allowTooManyArgs = options?.allowTooManyArgs ?? this._allowTooManyArgs;
    this._command = options.command;

    if (!this._command?.arg && this._throwError) {
      throw new Error('Argument instance is not found!');
    }

    this._arg = this._command?.arg ?? {};
  }

  /**
   * Takes a string and collects command args from it.
   * @param input Command line.
   * @returns Parsed command args of the current command level or null.
   */
  parse(input: string): IArgument {
    const args = splitByDoubleQuotes(input);
    const cloned = this._arg.clone();

    if (this._validateArgs(args)) {
      cloned?.setValue(input);
    }

    return cloned;
  }

  /**
   * Checks if remained arguments in the list are valid.
   * @returns Whether arguments valid or not.
   */
  private _validateArgs(values: string[]): boolean {
    if (!this._arg) return false;

    const minLength = this._arg.minLength ?? 0;
    const maxLength = this._arg.maxLength ?? 0;

    /**
     * Throw an error if there are not enough arguments.
     */
    if (values.length < minLength && this._arg.isRequired) {
      if (this._throwError) {
        throw new Error('Not enough arguments was specified!');
      }

      return false;
    }

    /**
     * Throw an error if there are too many arguments.
     */
    if (!this._allowTooManyArgs && values.length > maxLength) {
      if (this._throwError) {
        throw new Error('Too many arguments!');
      }

      return false;
    }

    return true;
  }
}
