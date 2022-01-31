import { Argument } from '../Classes';

/**
 * A command flag.
 */
export interface IFlag {
  /**
   * The flag name.
   */
  name: string;

  /**
   * The flag shortened name.
   */
  shortName: string;

  /**
   * The flag description.
   */
  description: string;

  /**
   * The flag argument. 
   */
  arg: Argument | null;
}
