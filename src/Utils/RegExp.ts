import { IFlag } from '../Interfaces';

/**
 * Replaces regexp special characters with text.
 * @param text Original string.
 * @returns The string with escaped special characters.
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

interface IFlagOptions {
  shortPrefix?: string;
  fullPrefix?: string;
  suffix?: string;
  separator?: string;
  caseSensitive?: boolean;
}

/**
 * Converts an array of flags to the map of 
 * regular expressions that are used to match this flags.
 * @param flags The array of flags.
 * @param options Custom flag short prefix, full prefix & suffix. 
 * This is used when flag doesn't have it's own value.
 * @returns Map with flag as a key and regular expressions as a value.
 */
export function convertFlagsToRegExp(flags: IFlag[], options?: IFlagOptions): Map<IFlag, RegExp[]> {
  const regexMap = new Map<IFlag, RegExp[]>();

  for (const flag of flags) {
    regexMap.set(flag, convertFlagToRegExp(flag, options));
  }

  return regexMap;
}

/**
 * Converts a flag to the regular expressions that are used to match this flags.
 * @param flag The flag.
 * @param options Custom flag short prefix, full prefix, suffix and separator. 
 * This is used when flag doesn't have it's own value.
 * @returns Short and full regular expression for this flag.
 */
export function convertFlagToRegExp(flag: IFlag, options?: IFlagOptions): RegExp[] {

  const shortPrefix = flag.shortPrefix ?? options?.shortPrefix ?? '';
  const shortPrefixes = [shortPrefix, ...flag.shortPrefixAliases];
  const shortNames = [flag.shortName, ...flag.shortAliases];

  const fullPrefix = flag.prefix ?? options?.fullPrefix ?? '';
  const fullPrefixes = [fullPrefix, ...flag.prefixAliases];
  const fullNames = [flag.name, ...flag.aliases];

  const suffix = flag.suffix ?? options?.suffix ?? '';
  const suffixes = [suffix, ...flag.suffixAliases];

  const separator = flag.separator ?? options?.separator ?? '';
  const separators = [separator, ...flag.separatorAliases].map((s) => s.trim());

  const shortRegexString = '^' +
    convertArrayToRegExpGroup(shortPrefixes) +
    convertArrayToRegExpGroup(shortNames) +
    convertArrayToRegExpGroup(suffixes) +
    convertArrayToRegExpGroup(separators, true);

  const fullRegexString = '^' +
    convertArrayToRegExpGroup(fullPrefixes) +
    convertArrayToRegExpGroup(fullNames) +
    convertArrayToRegExpGroup(suffixes) +
    convertArrayToRegExpGroup(separators, true);

  return [
    new RegExp(shortRegexString, options?.caseSensitive ? '' : 'i'),
    new RegExp(fullRegexString, options?.caseSensitive ? '' : 'i'),
  ];
}

/**
 * Converts an array of strings to a stringified regex group.
 * @param arr The array of strings.
 * @param end Is this group at the end of a line?
 * @returns Stringified regex group.
 */
export function convertArrayToRegExpGroup(arr: string[], end = false): string {
  const filteredArgs = end ? arr : arr.filter((x) => x);

  if (filteredArgs.length === 0) return '';

  const group = filteredArgs.map((arg) => {
    return end && arg === '' ? '$' : escapeRegExp(arg);
  });

  const suffix = end || !arr.includes('') ? '' : '?';

  return '(' + group.join('|') + ')' + suffix;
}
