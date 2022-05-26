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

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const original = this as this & IHasArgument;
    const cloned = result as this & IHasArgument;

    if (original.arg) {
      cloned.arg = original.arg.clone();
    }

    return result;
  }

  equals(other: IFlag): boolean {
    return this.name === other.name && this.shortName === other.shortName;
  }
}
