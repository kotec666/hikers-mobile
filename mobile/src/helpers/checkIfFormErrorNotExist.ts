interface FormErrors {
  [key: string]: {
    message?: string;
  };
}

interface ServerErrors {
  [key: string]: string | undefined | boolean;
}

/**
 * Checks if there are no errors for a specific field in both form and server errors.
 *
 * @param errors - The form validation errors.
 * @param dataErrors - The server-side validation errors.
 * @param field - The field name to check for errors.
 * @returns True if no errors exist for the specified field, otherwise false.
 */
export const checkIfFormErrorNotExist = (
  errors: FormErrors,
  dataErrors: ServerErrors,
  field: string,
): boolean => {
  const formErrorMessage = errors[field]?.message
  const serverErrorMessage = dataErrors?.[field]

  return !formErrorMessage && !serverErrorMessage
}