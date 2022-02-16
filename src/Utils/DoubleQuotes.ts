/**
 * Splits command line into arguments by preprocessing double quotes. 
 * @param input Command line.
 * @returns The list of args.
 */
export function splitByDoubleQuotes(input: string): string[] {
  /**
   * Combine double quotes into one arg and split all args by space.
   * Let's take a look at the examples:
   *  1) Double quotes will not be included if they doesn't have a pair or backslash.   
   *     String: "123  \"
   *     Result: ['123', '\"']
   * 
   *  2) Any backslashed double quote will became a part of an argument or create it's own argument.
   *     String: \"123  \"
   *     Result: ['\"123', '\"']
   * 
   *  3) Backslashed double quotes will not form a pair.
   *     String: \"123  \"   "
   *     Result: ['\"123', '\"']
   * 
   *  4) Backslashed double quotes also will be ignored while being in actual double quotes pair.
   *     String: "123  \"   "
   *     Result: ['"123  \"   "']
   * 
   *  5) Empty double quotes will return nothing.
   *     String: ""
   *     Result: []
   * 
   *  6) Allows any characters before double quotes until previous one is backslash.
   *     String: \\\\"  \\g\"  f\"  gf\"fdg  g"gfgdfg
   *     Result: ['\\\\"', '\\g\"', 'f\"', 'gf\"', 'fdg', 'g', 'gfgdfg']
   */
  const doubleQuotesMatcher = /[^\s]+(?:\\)+"|(?:\\)"[^"\s]*|[^"\s]+|"(?:\\"|[^"])*(?:[^\\"]")/gm;

  /**
   * Remove double quotes and backslashes.
   * If there is no backslash before the double quotes, remove the quotes themselves.
   * If there is a backslash before double quotes, remove only the backslash.
   */
  const args = input.match(doubleQuotesMatcher) ?? [];

  return args.map((arg) => arg.replace(/(?<!\\)"/gm, '').replace(/\\/g, ''));
}

/**
 * Removes double quotes from command line except backslashed double quotes.
 * @param input Command line
 * @returns Command line without double quotes.
 */
export function removeDoubleQuotes(input: string): string {
  return splitByDoubleQuotes(input).join(' ');
}
