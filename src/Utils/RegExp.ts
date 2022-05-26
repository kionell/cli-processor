/**
 * Replaces regexp special characters with text.
 * @param text Original string.
 * @returns The string with escaped special characters.
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
