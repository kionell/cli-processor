import {
  Command,
  CommandData,
  CommandTree,
} from '../Classes';

import { FlagParser } from './FlagParser';
import { ArgumentParser } from './ArgumentParser';
import { ICommand, ICommandParserOptions } from '../Interfaces';
import { splitByDoubleQuotes } from '../Utils';

/**
 * A command parser.
 */
export class CommandParser {
  /**
   * The prefix to work with.
   */
  private _prefix = '';

  /** 
   * The prefix of a shortened flag.
   */
  private _shortFlagPrefix = '-';

  /**
   * The prefix of a full flag.
   */
  private _fullFlagPrefix = '--';

  /**
   * The suffix of a flag.
   */
  private _flagSuffix = '';

  /**
   * Whether to throw error or not. Throw errors by default.
   */
  private _throwError = true;

  /**
   * Should too many arguments be allowed or not?
   */
  private _allowTooManyArgs = false;

  /**
   * Are commands case sensitive? Use non-sensitive parsing by default.
   */
  private _caseSensitive = false;

  /**
   * A dictionary with all possible commands;
   */
  private _commands: Map<string, ICommand>;

  /**
   * Creates a new instance of a command parser.
   * @param options The dictionary with commands or command parser options.
   * @constructor
   */
  constructor(options?: Map<string, ICommand> | ICommandParserOptions) {
    if (options instanceof Map) {
      this._commands = options ?? new Map<string, ICommand>();

      return;
    }

    this._prefix = options?.commandPrefix ?? this._prefix;
    this._throwError = options?.throwError ?? this._throwError;
    this._allowTooManyArgs = options?.allowTooManyArgs ?? this._allowTooManyArgs;
    this._caseSensitive = options?.caseSensitive ?? this._caseSensitive;

    this._shortFlagPrefix = options?.shortFlagPrefix ?? this._shortFlagPrefix;
    this._fullFlagPrefix = options?.fullFlagPrefix ?? this._fullFlagPrefix;
    this._flagSuffix = options?.flagSuffix ?? this._flagSuffix;

    this._commands = options?.commandList instanceof Map
      ? options.commandList
      : new Map<string, ICommand>();
  }

  /**
   * Takes a string and converts it to command data.
   * @param input Command line.
   * @returns Parsed command data.
   */
  parse(input: string): CommandData {
    /**
     * Throw an error if string starts with any leading whitespace characters.
     * Leading spaces will not break anything, but will look ugly.
     */
    if (/^\s/.test(input) && this._throwError) {
      throw new Error('Leading whitespaces are not allowed!');
    }

    /**
     * Ignore empty commands or commands that don't start with a prefix.
     */
    if (input.length <= 0 || !this._hasPrefix(input)) {
      return new CommandData();
    }

    /**
     * We need to preprocess double quotes before parsing. 
     */
    const args = splitByDoubleQuotes(input);

    const data = this._getCommandData(args);

    data.raw = input;

    return data;
  }

  /**
   * Creates info about a command.
   * @param args The list of arguments.
   * @returns Parsed command data of the current command level.
   */
  private _getCommandData(args: string[]): CommandData {
    const data = new CommandData();

    /**
     * Build a command tree.
     */
    this._buildCommandTree(args, data.tree, this._commands);

    if (data.tree.levels > 0) {
      /**
       * Get last level of a tree.
       */
      const last = data.tree.last as ICommand;

      const flagParser = this._getFlagParser(last);
      const argParser = this._getArgParser(last);

      const target = args.join(' ');
      const targetWithNoFlags = flagParser.getCommandLineWithoutFlags(target);

      last.flags = flagParser.parse(target);
      last.arg = argParser.parse(targetWithNoFlags);
    }

    data.prefix = this._prefix;
    data.flagPrefix = this._fullFlagPrefix;

    return data;
  }

  /**
   * Recursively builds a subcommand tree.
   * @param args The list of arguments.
   * @param tree The command tree.
   * @param parent The list of commands at higher level.
   */
  private _buildCommandTree(args: string[], tree: CommandTree, parent?: Map<string, ICommand>): void {
    if (!parent) return;

    /**
     * Check if the first argument is a command.
     */
    const first = args[0].toLowerCase() ?? '';
    const command = this._getCommand(first, parent);

    if (!command) return;

    tree.add(command);

    /**
     * Remove first argument and mutate array.
     */
    args.shift();

    /**
     * Check for the subcommands.
     */
    this._buildCommandTree(args, tree, command.subcommands);
  }

  /**
   * Tries to get a command by first argument of the list.
   * @param first The first argument of the args list.
   * @param commands The list of commands at the current level.
   * @throws If command not found. 
   * @returns The found command or null.
   */
  private _getCommand(first: string, commands: Map<string, ICommand>): ICommand | null {
    if (!first) {
      if (this._throwError) {
        throw new Error('No command/subcommand was specified!');
      }

      return null;
    }

    /**
     * Get basic command info.
     */
    const command = this._getCommandByNameOrAlias(first, commands);

    if (command === null && this._throwError) {
      throw new Error('Wrong command/subcommand!');
    }

    return command;
  }

  /**
   * Creates a new instance of the flag parser for the command.
   * @param command Current command object.
   * @return The flag parser of the current command.
   */
  private _getFlagParser(command: ICommand): FlagParser {
    const options = {
      shortPrefix: this._shortFlagPrefix,
      fullPrefix: this._fullFlagPrefix,
      suffix: this._flagSuffix,
      throwError: this._throwError,
      command,
    };

    return new FlagParser(options);
  }

  /**
   * Creates a new instance of the argument parser for the command.
   * @param command Current command object.
   * @return The argument parser of the current command.
   */
  private _getArgParser(command: ICommand): ArgumentParser {
    const options = {
      throwError: this._throwError,
      allowTooManyArgs: this._allowTooManyArgs,
      command,
    };

    return new ArgumentParser(options);
  }

  /**
   * Tries to find a command from the commands list by name or alias.
   * @param input Command name or alias.
   * @param commands The list of commands at the current level.
   * @return The found command or null.
   */
  private _getCommandByNameOrAlias(input: string, commands: Map<string, ICommand>): ICommand | null {
    input = this._removePrefix(input);

    for (const command of commands.values()) {
      if (command.name === input || command.aliases.includes(input)) {
        const cloned = command.clone() as Command;

        /**
         * Reset current command argument.
         */
        if (cloned.arg) {
          cloned.arg.length = 0;
        }

        return cloned;
      }
    }

    return null;
  }

  private _removePrefix(input: string): string {
    return this._hasPrefix(input) ? input.substring(this._prefix.length) : input;
  }

  private _hasPrefix(input: string): boolean {
    const expression = `^${this._prefix}[^${this._prefix}]`;
    const flags = this._caseSensitive ? 'g' : '';

    return new RegExp(expression, flags).test(input);
  }
}
