import { ICommand } from '../ICommand';

/**
 * Instance that has flags.
 */
export interface IHasSubcommands {
  /**
   * Subcommands of this instance.
   */
  subcommands: Map<string, ICommand>;
}
