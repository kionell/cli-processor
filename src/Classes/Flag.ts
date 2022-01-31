import { IFlag, ICloneable, IComparable, IStringable } from '../Interfaces';
import { Argument } from './Argument';

/**
 * A command flag.
 */
export class Flag implements IFlag, ICloneable, IComparable, IStringable {
  /**
   * The flag name.
   */
  name = '';

  /**
   * The flag shortened name.
   */
  shortName = '';

  /**
   * The flag description.
   */
  description = '';

  /**
   * The flag argument. 
   */
  arg: Argument | null = null;

  /**
   * Creates a new instance of a flag.
   * @param params The flag params.
   * @constructor
   */
  constructor(params: Partial<IFlag> = {}) {
    Object.assign(this, params);
  }

  /**
   * A string representation of the flag.
   */
  toString(): string {
    return [this.name, this.arg].filter((x) => x).join(' ');
  }

  clone(): Flag {
    return new Flag({
      name: this.name,
      shortName: this.shortName,
      description: this.description,
      arg: this.arg?.clone() ?? null,
    });
  }

  equals(other: Flag): boolean {
    if (this.name !== other.name) return false;
    if (this.shortName !== other.shortName) return false;

    if (this.arg !== null && other.arg !== null) {
      if (!this.arg.equals(other.arg)) return false;
    }

    if (this.arg !== other.arg) return false;

    return true;
  }
}
