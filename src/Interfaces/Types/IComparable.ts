/**
 * A type of objects that can be compared with each other.
 */
export interface IComparable {
  /**
   * Returns if two IComparable objects are equal.
   * @param other Other IComparable object.
   */
  equals(other: IComparable): boolean;
}
