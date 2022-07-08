import { OptionParser } from './OptionParser';
import { OptionType } from '../Types';
import { splitByDoubleQuotes } from '../Utils';

import {
  CommandData,
  CommandTree,
} from '../Classes';

import {
  ICommand,
  ICommandParserConfig,
  IFlag,
} from '../Interfaces';

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
   * @param config The dictionary with commands or command parser options.
   * @constructor
   */
  constructor(config?: Map<string, ICommand> | ICommandParserConfig) {
    if (config instanceof Map) {
      this._commands = config ?? new Map<string, ICommand>();

      return;
    }

    this._prefix = config?.commandPrefix ?? this._prefix;
    this._throwError = config?.throwError ?? this._throwError;
    this._allowTooManyArgs = config?.allowTooManyArgs ?? this._allowTooManyArgs;
    this._caseSensitive = config?.caseSensitive ?? this._caseSensitive;

    this._shortFlagPrefix = config?.shortFlagPrefix ?? this._shortFlagPrefix;
    this._fullFlagPrefix = config?.fullFlagPrefix ?? this._fullFlagPrefix;
    this._flagSuffix = config?.flagSuffix ?? this._flagSuffix;

    this._commands = config?.commandList instanceof Map
      ? config.commandList
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
     * Remove prefix before parsing this command line.
     */
    input = this._removePrefix(input);

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
      const command = data.tree.last as ICommand;

      /**
       * Wrap args with double quotes if they have spaces.
       * This is done because nested parsers was written as independent modules.
       * Flag & argument parsers will split string by double quotes by themselves.
       * Args that was quoted from the beginning must contain their spaces.
       * Additional splitting of an already split line will remove those spaces. 
       */
      const target = args.map((a) => a.includes(' ') ? `"${a}"` : a).join(' ');

      command.options = this._getOptionParser(command).parse(target);
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
    if (!parent?.size) return;

    /**
     * Check if the first argument is a command.
     */
    const first = args?.[0]?.toLowerCase() ?? '';
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
   * Creates a new instance of the option parser for the current command.
   * @param command Current command object.
   * @return The option parser for the current command.
   */
  private _getOptionParser(command: ICommand): OptionParser {
    return new OptionParser({
      shortPrefix: this._shortFlagPrefix,
      fullPrefix: this._fullFlagPrefix,
      suffix: this._flagSuffix,
      throwError: this._throwError,
      flags: command.getOptionsOfType(OptionType.Flag) as IFlag[],
      args: command.getOptionsOfType(OptionType.Argument),
    });
  }

  /**
   * Tries to find a command from the commands list by name or alias.
   * @param input Command name or alias.
   * @param commands The list of commands at the current level.
   * @return The found command or null.
   */
  private _getCommandByNameOrAlias(input: string, commands: Map<string, ICommand>): ICommand | null {
    for (const command of commands.values()) {
      if (command.name === input || command.aliases.includes(input)) {
        const cloned = command.clone();

        /**
         * Reset current command options state.
         */
        cloned.options.forEach((o) => o.setValue(null));

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
    const flags = this._caseSensitive ? '' : 'i';

    return new RegExp(expression, flags).test(input);
  }
}
