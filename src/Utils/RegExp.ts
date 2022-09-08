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
}

export function convertFlagsToRegExp(flags: IFlag[], options?: IFlagOptions): Map<IFlag, RegExp> {
  const regexMap = new Map<IFlag, RegExp>();

  for (const flag of flags) {
    regexMap.set(flag, convertFlagToRegExp(flag, options));
  }

  return regexMap;
}

export function convertFlagToRegExp(flag: IFlag, options?: IFlagOptions): RegExp {

  const shortPrefix = flag.shortPrefix ?? options?.shortPrefix ?? '';
  const shortPrefixes = [shortPrefix, ...flag.shortPrefixAliases];
  const shortNames = [flag.shortName, ...flag.shortAliases];

  const fullPrefix = flag.prefix ?? options?.fullPrefix ?? '';
  const fullPrefixes = [fullPrefix, ...flag.prefixAliases];
  const fullNames = [flag.name, ...flag.aliases];

  const suffix = flag.suffix ?? options?.suffix ?? '';
  const suffixes = [suffix, ...flag.suffixAliases];

  const shortRegexString = '^' +
    convertArrayToRegExpGroup(shortPrefixes) +
    convertArrayToRegExpGroup(shortNames) +
    convertArrayToRegExpGroup(suffixes);

  const fullRegexString = '^' +
    convertArrayToRegExpGroup(fullPrefixes) +
    convertArrayToRegExpGroup(fullNames) +
    convertArrayToRegExpGroup(suffixes);

  return new RegExp(`(${shortRegexString}|${fullRegexString})`);
}

export function convertArrayToRegExpGroup(arr: string[]): string {
  const nonEmptyArgs = arr.filter((x) => x);

  if (nonEmptyArgs.length === 0) return '';

  const group = nonEmptyArgs.map(escapeRegExp).join('|');
  const suffix = arr.includes('') ? '?' : '';

  return '(' + group + ')' + suffix;
}
