import { Argument, Command } from '../Classes';
import { IArgumentParserOptions } from '../Interfaces';

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
  private _command: Command | null = null;

  /**
   * Creates a new instance of an argument parser.
   * @param options The argument parser options.
   * @constructor
   */
  constructor(options?: IArgumentParserOptions) {
    this._throwError = options?.throwError ?? this._throwError;
    this._allowTooManyArgs = options?.allowTooManyArgs ?? this._allowTooManyArgs;
    this._command = options?.command ?? this._command;
  }

  /**
   * Takes a string and collects command args from it.
   * @param input Command line.
   * @returns Parsed command args of the current command level or null.
   */
  parse(input: string): Argument | null {
    const args = input?.split(' ') ?? [];

    if (!this._validateArgs(args)) return null;

    const argument = (this._command?.arg as Argument).clone();
    const values = args.splice(0, argument.maxLength);

    if (values.length > 0) {
      argument.values = values;
    }

    return argument;
  }

  /**
   * Checks if remained args in the list are valid.
   * @returns Whether args valid or not.
   */
  private _validateArgs(args: string[]): boolean {
    if (!this._command?.arg) return false;

    const minLength = this._command.arg.minLength ?? 0;
    const maxLength = this._command.arg.maxLength ?? 0;

    /**
     * Throw an error if there are not enough arguments.
     */
    if (args.length < minLength) {
      if (this._throwError) {
        throw new Error('Not enough arguments was specified!');
      }

      return false;
    }

    /**
     * Throw an error if there are too many arguments.
     */
    if (!this._allowTooManyArgs && args.length > maxLength) {
      if (this._throwError) {
        throw new Error('Too many arguments!');
      }

      return false;
    }

    return true;
  }
}
