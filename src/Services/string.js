/**
 * - remove case
 * - replace diacritics.
 * - remove trailing and leading spaces
 * - remove leading to (for english words)
 * @example
 * stringEquals('a'); // returns a
 * @example
 * stringEquals('FRÈRE'); // returns frere
 * @example
 * stringEquals('to jump'); // returns jump
 *
 * @param {string} s a string
 * @return {string} the normalized string
 */
export const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace('to ', '').trim();