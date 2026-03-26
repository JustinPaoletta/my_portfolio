export const CONTACT_FIELD_ORDER = ['name', 'email', 'message'] as const;

export type ContactField = (typeof CONTACT_FIELD_ORDER)[number];

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ContactValidationResult =
  | {
      valid: true;
      data: ContactFormData;
    }
  | {
      valid: false;
      error: string;
      fieldErrors: ContactFieldErrors;
    };

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateContactFormData(
  data: unknown
): ContactValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: 'Invalid request body',
      fieldErrors: {},
    };
  }

  const record = data as Record<string, unknown>;
  const name = asString(record.name).trim();
  const email = asString(record.email).trim().toLowerCase();
  const message = asString(record.message).trim();
  const fieldErrors: ContactFieldErrors = {};

  if (name.length < 2) {
    fieldErrors.name = 'Enter a name with at least 2 characters.';
  }

  if (email.length === 0) {
    fieldErrors.email = 'Enter an email address.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fieldErrors.email = 'Enter a valid email address.';
    }
  }

  if (message.length < 10) {
    fieldErrors.message = 'Enter a message with at least 10 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      valid: false,
      error: 'Please correct the highlighted fields and try again.',
      fieldErrors,
    };
  }

  return {
    valid: true,
    data: {
      name: name.slice(0, 100),
      email: email.slice(0, 254),
      message: message.slice(0, 5000),
    },
  };
}
