/**
 * A type of objects that can be compared with each other.
 */
export interface IComparable {
  /**
   * Checks if two commands are equal.
   */
  equals(other: IComparable): boolean;
}
