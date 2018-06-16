/**
 * - remove case
 * - replace diacritics.
 * - remove trailing and leading spaces
 * @example
 * stringEquals('a'); // returns a
 * @example
 * stringEquals('FRÈRE'); // returns frere
 *
 * @param {string} s a string
 * @return {string} the normalized string
 */
export const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();