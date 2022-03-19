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
   * The flag argument. 
   */
  arg: IArgument | null;
}
