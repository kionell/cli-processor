import { IArgument } from './IArgument';

import {
  ICloneable,
  IStringable,
  IComparable,
} from './Types';

/**
 * A command flag.
 */
export interface IFlag extends ICloneable, IStringable, IComparable {
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
   * The full prefix of this flag that will overwrite parser options.
   */
  prefix: string;

  /**
   * The short prefix of this flag that will overwrite parser options.
   */
  shortPrefix: string;

  /**
   * The suffix of this flag.
   * Flag parser options will overwrite this.
   */
  suffix: string;

  /**
   * The flag argument. 
   */
  arg: IArgument | null;
}
