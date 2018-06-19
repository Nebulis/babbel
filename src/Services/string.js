const defaultOptions = {
  ignoreTo: true,
};

/**
 * - remove case
 * - replace diacritics.
 * - remove trailing and leading spaces
 * - remove leading to (for english words, if options.ignoreTo)
 * @example
 * stringEquals('a'); // returns a
 * @example
 * stringEquals('FRÈRE'); // returns frere
 * @example
 * stringEquals('to jump'); // returns jump
 *
 * @param {string} s a string
 * @param {object} options
 * @return {string} the normalized string
 */
export const normalize = (s, options = defaultOptions) => {
  let str = s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if(options.ignoreTo) {
    str = str.replace('to ', '');
  }
  return str;
};