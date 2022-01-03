# cli-processor
[![CodeFactor](https://img.shields.io/codefactor/grade/github/kionell/cli-processor)](https://www.codefactor.io/repository/github/kionell/cli-processor)
[![License](https://img.shields.io/github/license/kionell/cli-processor)](https://github.com/kionell/cli-processor/blob/master/LICENSE)
[![Package](https://img.shields.io/npm/v/cli-processor)](https://www.npmjs.com/package/cli-processor)

This package is a basic command line parser that can be used to create any CLI.

## Installation

Add a new dependency to your project via npm:

```bash
npm install cli-processor
```

### Requirements

Since this project uses ES Modules, it is recommended to use Node.js 12.22.0 or newer.

## How does it work

Instance of command parser requires a list of compatible commands to process command line.
Every command can have argument, flags and subcommands. Commands, as well as subcommands, must have execute function.
To process command line, parser will build command tree. Each entry in this tree will represent following subcommand.
The main execute function, argument and flags will be used from the last entry in command tree.

## Examples

Bellow you can find a few examples that will show you how to use this package.

### Creating simple help command

```js
import { Command, Argument } from 'cli-processor';

export default new Command({
  name: 'help',
  aliases: [
    'h', 'info'
  ],
  title: 'Help command',
  description: 'Gives you information about a command or a program',
  arg: new Argument({
    title: 'Command name',
    description: 'The command for which you need to get help',
    isRequired: false,
    values: [], // Default argument words.
    minLength: 1, // The number of words needed to be considered as this argument.
    maxLength: Infinity // The max number of words possible to be considered as this argument.
  }),
  execute: () => {
    // Do your stuff with command...
  }
});
```

### Creating prefix command

```js
import { Command, Argument, Flag } from 'cli-processor';

const command = new Command({
  name: 'prefix',
  title: 'Prefix command',
  description: 'Manages all prefixes',
  flags: new Set([
    new Flag({
      name: 'help',
      shortName: 'h',
      title: 'Help flag',
      description: 'Gives information about prefix command',
      arg: null
    })
  ]),
  subcommands: new Map(),
  execute: () => {
    // Do your stuff with command...
  }
});

command.subcommands.set('add', new Command({
  name: 'add',
  aliases: [
    'a'
  ],
  title: 'Prefix add subcommand',
  description: 'Adds a new prefix',
  arg: new Argument({
    title: 'Prefix',
    description: 'A new prefix to be added',
    isRequired: false,
    minLength: 1
  }),
  flags: new Set([
    new Flag({
      name: 'help',
      shortName: 'h',
      title: 'Help flag',
      description: 'Gives information about prefix add subcommand',
    })
  ]),
  execute: () => {
    // Do your stuff with command...
  }
}));

command.subcommands.set('remove', new Command({
  name: 'remove',
  aliases: [
    'r', 'delete'
  ],
  title: 'Prefix remove subcommand',
  description: 'Removes a prefix',
  arg: new Argument({
    title: 'Prefix',
    description: 'A prefix that will be deleted',
    isRequired: false,
    minLength: 1,
  }),
  flags: new Set([
    new Flag({
      name: 'help',
      shortName: 'h',
      title: 'Help flag',
      description: 'Gives information about prefix remove subcommand',
    })
  ]),
  execute: () => {
    // Do your stuff with command...
  }
}));

command.subcommands.set('reset', new Command({
  name: 'reset',
  title: 'Prefix reset subcommand',
  description: 'Resets all prefixes',
  flags: new Set([
    new Flag({
      name: 'help',
      shortName: 'h',
      title: 'Help flag',
      description: 'Gives information about prefix reset subcommand',
    })
  ]),
  execute: () => {
    // Do your stuff with command...
  }
}));

export default command;
```

### Parsing command line

```js
import { CommandParser } from 'cli-processor';
import { HelpCommand, PrefixCommand } from './commands';

const parser = new CommandParser({
  commandPrefix: '!',
  shortFlagPrefix: '-',
  fullFlagPrefix: '--',
  throwError: false,
  caseSensitive: false,
  commandList: new Map()
    .set('help', HelpCommand)
    .set('prefix', PrefixCommand)
});

/**
 * Will return command data with 2 entries in command tree.
 * 1 entry - prefix command.
 * 2 entry - prefix add subcommand.
 * Prefix add argument - 123.
 */
const data1 = parser.parse('!prefix add 123');

/**
 * Will return command data with help command only and two arguments.
 */
const data2 = parser.parse('!h prefix delete');

/**
 * Will throw error because of wrong subcommand if throwError option is enabled.
 * Otherwise, will return command data for prefix command only and help flag.
 */
const data3 = parser.parse('!prefix --help');

/**
 * Will return empty command data with no info.
 */
const data4 = parser.parse('');
```

## Command parser options

|       Name      |                              Description                             |          Type         | Optional | Default value |
|:---------------:|:--------------------------------------------------------------------:|:---------------------:|:--------:|:-------------:|
| commandPrefix   | A command prefix that will be considered by this parser.             |         string        |    Yes   |       ''      |
| shortFlagPrefix | A prefix of a shortened flag that will be considered by this parser. |         string        |    Yes   |      '-'      |
| fullFlagPrefix  | A prefix of a full flag that will be considered by this parser.      |         string        |    Yes   |      '--'     |
| commandList     | A dictionary with all existing commands.                             | Map<string, ICommand> |    Yes   |     Map()     |
| throwError      | Whether to throw error while parsing or not.                         |        boolean        |    Yes   |      true     |
| caseSensitive   | Are commands case sensitive or not?                                  |        boolean        |    Yes   |     false     |

## Documentation

Auto-generated documentation is available [here](https://kionell.github.io/cli-processor/).

## Contributing

This project is being developed personally by me on pure enthusiasm. If you want to help with development or fix a problem, then feel free to create a new pull request. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License - see the [LICENSE](https://choosealicense.com/licenses/mit/) for details.