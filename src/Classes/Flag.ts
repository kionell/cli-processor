import {
  IFlag,
  IHasArgument,
} from '../Interfaces';

/**
 * A command flag.
 */
export class Flag implements IFlag {
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
   * The full prefix of this flag.
   * Flag parser options will overwrite this.
   */
  prefix = '--';

  /**
   * The short prefix of this flag.
   * Flag parser options will overwrite this.
   */
  shortPrefix = '-';

  /**
   * The suffix of this flag.
   * Flag parser options will overwrite this.
   */
  suffix = '';

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
    return this.prefix + this.name + this.suffix;
  }

  clone(): this {
    const TypedFlag = this.constructor as new (params: Partial<IFlag>) => this;

    const result = new TypedFlag({
      name: this.name,
      shortName: this.shortName,
      description: this.description,
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
