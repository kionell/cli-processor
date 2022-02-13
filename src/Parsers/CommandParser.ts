import {
  Command,
  CommandData,
  CommandTree,
  Argument,
  Flag,
} from '../Classes';

import { ICommand, ICommandParserOptions } from '../Interfaces';

import { ArgumentParser } from './ArgumentParser';
import { FlagParser } from './FlagParser';

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
   * Whether to throw error or not.
   */
  private _throwError = true;

  /**
   * Are commands case sensitive?
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

    /**
     * Use exclamation mark as a default prefix. 
     */
    this._prefix = options?.commandPrefix ?? this._prefix;

    /**
     * Throw errors by default.
     */
    this._throwError = options?.throwError ?? this._throwError;

    /**
     * Use non-sensitive parsing by default.
     */
    this._caseSensitive = options?.caseSensitive ?? this._caseSensitive;

    this._shortFlagPrefix = options?.shortFlagPrefix ?? this._shortFlagPrefix;
    this._fullFlagPrefix = options?.fullFlagPrefix ?? this._fullFlagPrefix;

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
     * Combine double quotes into one arg and split all args by space.
     * Let's take a look at the examples:
     *  1) Double quotes will not be included if they doesn't have a pair or backslash.   
     *     String: "123  \"
     *     Result: ['123', '\"']
     * 
     *  2) Any backslashed double quote will became a part of an argument or create it's own argument.
     *     String: \"123  \"
     *     Result: ['\"123', '\"']
     * 
     *  3) Backslashed double quotes will not form a pair.
     *     String: \"123  \"   "
     *     Result: ['\"123', '\"']
     * 
     *  4) Backslashed double quotes also will be ignored while being in actual double quotes pair.
     *     String: "123  \"   "
     *     Result: ['"123  \"   "']
     * 
     *  5) Empty double quotes will return nothing.
     *     String: ""
     *     Result: []
     * 
     *  6) Allows any characters before double quotes until previous one is backslash.
     *     String: \\\\"  \\g\"  f\"  gf\"fdg  g"gfgdfg
     *     Result: ['\\\\"', '\\g\"', 'f\"', 'gf\"', 'fdg', 'g', 'gfgdfg']
     */
    let args = input.match(/[^\s]+(?:\\)+"|(?:\\)"[^"\s]*|[^"\s]+|"(?:\\"|[^"])*(?:[^\\"]")/gm) ?? [];

    /**
     * Remove double quotes and backslashes.
     * If there is no backslash before the double quotes, remove the quotes themselves.
     * If there is a backslash before double quotes, remove only the backslash.
     */
    args = args.map((arg) => arg.replace(/(?<!\\)"/gm, '').replace(/\\/g, ''));

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
      const last = data.tree.last as Command;

      /**
       * Parse flags and args and save them to the command data.
       * We need to mutate args after flag parsing!
       */
      last.flags = this._getFlags(args, last);
      last.arg = this._getArg(args.filter((x) => x), last);
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
  private _getCommand(first: string, commands: Map<string, ICommand>): Command | null {
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
   * Parses command flags for the current level.
   * @param args the list of arguments.
   * @param command Current command object.
   * @return Parsed command flags of the current command level.
   */
  private _getFlags(args: string[], command: Command): Map<string, Flag> {
    const options = {
      shortPrefix: this._shortFlagPrefix,
      fullPrefix: this._fullFlagPrefix,
      throwError: this._throwError,
      command,
      args,
    };

    return new FlagParser(options).parse();
  }

  /**
   * Parses command arguments for the current command level.
   * @param args the list of arguments.
   * @param command Current command object.
   * @return Parsed command arguments of the current command level.
   */
  private _getArg(args: string[], command: Command): Argument | null {
    const options = {
      throwError: this._throwError,
      args,
      command,
    };

    return new ArgumentParser(options).parse();
  }

  /**
   * Tries to find a command from the commands list by name or alias.
   * @param input Command name or alias.
   * @param commands The list of commands at the current level.
   * @return The found command or null.
   */
  private _getCommandByNameOrAlias(input: string, commands: Map<string, ICommand>): Command | null {
    input = this._removePrefix(input);

    for (const command of commands.values()) {
      if (command.name === input || command.aliases.includes(input)) {
        const original = command as Command;
        const cloned = original.clone();

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
