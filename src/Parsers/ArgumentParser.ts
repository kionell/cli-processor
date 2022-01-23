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
   * The raw args that will be parsed;
   */
  private _args: string[] = [];

  /**
   * The command which will be used to parse arguments.
   */
  private _command: Command;

  /**
   * Creates a new instance of an argument parser.
   * @param options The argument parser options.
   * @constructor
   */
  constructor(options: IArgumentParserOptions) {
    this._throwError = options.throwError ?? this._throwError;
    this._args = options.args?.slice() ?? this._args;
    this._command = options.command;
  }

  /**
   * @returns Parsed command args of the current command level or null.
   */
  parse(): Argument | null {
    if (!this._validateArgs()) return null;

    const argument = (this._command.arg as Argument).clone();
    const values = this._args.splice(0, argument.maxLength);

    if (values.length > 0) {
      argument.values = values;
    }

    return argument;
  }

  /**
   * Checks if remained args in the list are valid.
   * @returns Whether args valid or not.
   */
  private _validateArgs(): boolean {
    if (!this._command.arg) return false;

    const minLength = this._command.arg.minLength ?? 0;
    const maxLength = this._command.arg.maxLength ?? 0;

    /**
     * Throw an error if there are not enough arguments.
     */
    if (this._args.length < minLength) {
      if (this._throwError) {
        throw new Error('Not enough arguments was specified!');
      }

      return false;
    }

    /**
     * Throw an error if there are too many arguments.
     */
    if (this._args.length > maxLength) {
      if (this._throwError) {
        throw new Error('Too many arguments!');
      }

      return false;
    }

    return true;
  }
}