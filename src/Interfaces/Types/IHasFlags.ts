import { IFlag } from '../IFlag';

/**
 * Instance that has flags.
 */
export interface IHasFlags {
  /**
   * Flags of this instance.
   */
  flags: Map<string, IFlag>;
}
