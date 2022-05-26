/**
 * A type of objects that can be cloned.
 */
export interface ICloneable {
  /**
   * Creates a deep copy of the ICloneable object.
   */
  clone(): this;
}
