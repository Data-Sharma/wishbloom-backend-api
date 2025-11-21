const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex =
  /^\+?[1-9]\d{1,14}$/;

export const isValidEmail = (value: string): boolean => emailRegex.test(value);

export const isValidPhone = (value: string): boolean => phoneRegex.test(value);

export const sanitizeString = (value: string): string => value.trim();

