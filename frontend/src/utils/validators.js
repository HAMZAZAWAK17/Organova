/**
 * OWASP Rules 1 & 2 – Frontend Input Validation
 * All inputs validated on frontend AND backend (defense in depth).
 */

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least one number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character');
    return errors;
}

export function validateName(name) {
    if (!name || name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 100) return 'Name must be at most 100 characters';
    return null;
}

export function validateTaskTitle(title) {
    if (!title || title.trim().length === 0) return 'Title is required';
    if (title.trim().length > 255) return 'Title must be at most 255 characters';
    return null;
}

export function sanitizeText(text) {
    // Strip HTML tags from user input before display (XSS prevention)
    return String(text).replace(/<[^>]*>/g, '').trim();
}
