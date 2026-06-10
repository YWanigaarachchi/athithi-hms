const { NIC_PATTERNS, PASSPORT_PATTERN } = require('../constants/sriLanka');

/**
 * Validates a Sri Lankan NIC or Passport number.
 *
 * NIC formats:
 *   OLD: 9 digits + V or X  (e.g., 123456789V)
 *   NEW: 12 numeric digits   (e.g., 199512345678)
 * Passport: 6–12 alphanumeric chars
 *
 * @param {string} number  - ID number string
 * @param {'nic-old'|'nic-new'|'passport'} type
 * @returns {{ valid: boolean, message: string }}
 */
function validateNIC(number, type) {
  if (!number || !type) {
    return { valid: false, message: 'ID number and type are required.' };
  }

  const trimmed = number.trim().toUpperCase();

  switch (type) {
    case 'nic-old': {
      if (!NIC_PATTERNS.OLD.test(trimmed)) {
        return {
          valid: false,
          message: 'Invalid old-format NIC. Expected 9 digits followed by V or X (e.g., 123456789V).',
        };
      }
      // Extract birthYear from old NIC (digits 1-2 = last 2 digits of birth year)
      const yearPart = parseInt(trimmed.slice(0, 2), 10);
      const birthYear = yearPart >= 0 && yearPart <= 24 ? 2000 + yearPart : 1900 + yearPart;
      return { valid: true, message: `Valid old-format NIC. Estimated birth year: ${birthYear}.` };
    }

    case 'nic-new': {
      if (!NIC_PATTERNS.NEW.test(trimmed)) {
        return {
          valid: false,
          message: 'Invalid new-format NIC. Expected 12 numeric digits (e.g., 199512345678).',
        };
      }
      // New NIC: first 4 digits = birth year, next 3 = day of year
      const birthYear = parseInt(trimmed.slice(0, 4), 10);
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
        return { valid: false, message: `NIC birth year ${birthYear} seems invalid.` };
      }
      return { valid: true, message: `Valid new-format NIC. Birth year: ${birthYear}.` };
    }

    case 'passport': {
      if (!PASSPORT_PATTERN.test(trimmed)) {
        return {
          valid: false,
          message: 'Invalid passport number. Expected 6–12 alphanumeric characters.',
        };
      }
      return { valid: true, message: 'Valid passport number.' };
    }

    default:
      return { valid: false, message: `Unknown ID type: ${type}` };
  }
}

module.exports = { validateNIC };
