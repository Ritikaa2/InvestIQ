export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export const passwordRules = {
  required: 'Password is required',
  validate: (value) =>
    (value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)) ||
    PASSWORD_POLICY_MESSAGE,
};

export const newPasswordRules = {
  ...passwordRules,
  required: 'New password is required',
};

