export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a username according to project requirements:
 * - 4 to 20 characters
 * - Letters, numbers, and underscores only
 * - No spaces
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { valid: false, error: "Username is required." };
  }
  const trimmed = username.trim();
  if (trimmed.length < 4 || trimmed.length > 20) {
    return { valid: false, error: "Username must be between 4 and 20 characters." };
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(trimmed)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, and underscores (no spaces).",
    };
  }
  return { valid: true };
}

/**
 * Validates standard email structure.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: "Email address is required." };
  }
  const trimmed = email.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  return { valid: true };
}

/**
 * Validates Indian 10-digit mobile number (optionally with +91 or 0 prefix).
 * Returns normalized +91XXXXXXXXXX string if valid.
 */
export function validateIndianMobile(phone: string): { valid: boolean; normalized?: string; error?: string } {
  if (!phone) {
    return { valid: false, error: "Mobile number is required." };
  }
  // Remove spaces, hyphens, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Match standard Indian 10-digit numbers starting with 6, 7, 8, or 9
  // (allowing optional +91, 91, or 0 prefixes)
  const regex = /^(?:\+?91|0)?([6-9]\d{9})$/;
  const match = cleaned.match(regex);

  if (!match) {
    return {
      valid: false,
      error: "Please enter a valid 10-digit Indian mobile number (e.g. +91 9876543210).",
    };
  }

  const tenDigit = match[1];
  return { valid: true, normalized: `+91 ${tenDigit}` };
}

/**
 * Password complexity requirements:
 * - Minimum 10 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 10) {
    return { valid: false, error: "Password must be at least 10 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number (0-9)." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one special character (!@#$%^&*...).",
    };
  }
  return { valid: true };
}

