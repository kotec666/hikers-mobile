enum ERRORS {
  BAD_REQUEST = "BAD_REQUEST",
  MISMATCH = "MISMATCH",
  UNAUTHORIZED = "UNAUTHORIZED",
  ALREADY_CREATED = "ALREADY_CREATED",
  NOT_EXIST = "NOT_EXIST",
  INVALID_EMAIL = "INVALID_EMAIL",
  UNCONFIRMED = "UNCONFIRMED",
  PRISMA_VALIDATE_ERROR = "PRISMA_VALIDATE_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INVALID_LENGTH = "INVALID_LENGTH",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  FIELD_EMPTY = "FIELD_EMPTY",
  ALREADY_USING = "ALREADY_USING",
  SERVICE_UNKNOWN = "SERVICE_UNKNOWN",
  EMPTY = "EMPTY",
  INVALID_DATE = "INVALID_DATE",
  UNIQUE_CONSTANT = "UNIQUE_CONSTANT",
  INVALID = "INVALID",
  ONLY_IMAGES_ALLOWED = "ONLY_IMAGES_ALLOWED",
  FORBIDDEN = "FORBIDDEN",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  TOO_LARGE = "TOO_LARGE",
}

type ErrorFields = {
  [key in ERRORS]: { field: string; message: string };
};

/* prettier-ignore */
/**
 *
 *  variant for personal fields
 *
 * */

const errorFields: ErrorFields = {
    [ERRORS.BAD_REQUEST]: { field: 'password', message: 'ServerErrors.bad_request' },
    [ERRORS.MISMATCH]: { field: 'password', message: 'ServerErrors.mismatch' },
    [ERRORS.UNAUTHORIZED]: {
        field: 'password',
        message: 'ServerErrors.unauthorized',
    },
    [ERRORS.ALREADY_CREATED]: {
        field: 'phone',
        message: 'ServerErrors.already_created',
    },
    [ERRORS.NOT_EXIST]: { field: 'phone', message: 'ServerErrors.not_exist' },
    [ERRORS.INVALID_EMAIL]: {
        field: 'email',
        message: 'ServerErrors.invalid_email',
    },
    [ERRORS.UNCONFIRMED]: {
        field: 'phone',
        message: 'ServerErrors.unconfirmed',
    },
    [ERRORS.PRISMA_VALIDATE_ERROR]: {
        field: 'field_name',
        message: 'ServerErrors.prisma_validate_error',
    },
    [ERRORS.NOT_FOUND]: {
        field: 'field_name',
        message: 'ServerErrors.not_found',
    },
    [ERRORS.INVALID_LENGTH]: {
        field: 'field_name',
        message: 'ServerErrors.invalid_length',
    },
    [ERRORS.UNKNOWN_ERROR]: {
        field: 'field_name',
        message: 'ServerErrors.unknown_error',
    },
    [ERRORS.FIELD_EMPTY]: {
        field: 'file',
        message: 'ServerErrors.field_empty',
    },
    [ERRORS.ALREADY_USING]: {
        field: 'email',
        message: 'ServerErrors.already_using',
    },
    [ERRORS.SERVICE_UNKNOWN]: {
        field: 'email',
        message: 'ServerErrors.service_unknown',
    },
    [ERRORS.EMPTY]: { field: 'field_name', message: 'ServerErrors.empty' },
    [ERRORS.INVALID_DATE]: {
        field: 'field_name',
        message: 'ServerErrors.invalid_date',
    },
    [ERRORS.UNIQUE_CONSTANT]: {
        field: 'field_name',
        message: 'ServerErrors.unique_constant',
    },
    [ERRORS.INVALID]: { field: 'field_name', message: 'ServerErrors.invalid' },
    [ERRORS.ONLY_IMAGES_ALLOWED]: {
        field: 'field_name',
        message: 'ServerErrors.only_images_allowed',
    },
    [ERRORS.FORBIDDEN]: {
        field: 'field_name',
        message: 'ServerErrors.forbidden',
    },
    [ERRORS.TOO_MANY_REQUESTS]: {
        field: 'field_name',
        message: 'ServerErrors.too_many_requests',
    },
    [ERRORS.TOO_LARGE]: {
        field: 'field_name',
        message: 'ServerErrors.too_large',
    },
}
/* prettier-ignore */

/* prettier-ignore */
/**
 *
 *  new variant with unification errors
 *
 * */

type PersonalErrorFields = {
	[key: string]: {
		[key in ERRORS]?: string;
	};
};

const personalErrorFields: PersonalErrorFields = {
  email: {
    [ERRORS.ALREADY_USING]: "Этот email уже используется",
    [ERRORS.NOT_FOUND]: "Такой email не найден",
    [ERRORS.UNIQUE_CONSTANT]: "Этот email уже зарегистрирован",
    [ERRORS.INVALID_EMAIL]: "Неправильный формат email",
  },
};
/* prettier-ignore */

// type ErrorFields = {
// 	[key: string]: { field: string; message: string }
// }

type ErrorObjectArr = {
	message: {
		property: string
		original: {
			classValidatorLikeError: string
		}
		message: string[]
	}[]
	error: string
	statusCode: number
}

type ErrorObject = {
  message: string;
  statusCode: number;
};

export const getFieldsErrors = (
  errorObject: ErrorObject | ErrorObjectArr
): { [key: string]: string | boolean } => {
  const errors: { [key: string]: string | boolean } = {};

  if (Array.isArray(errorObject.message)) {
    errorObject.message.forEach((error) => {
      const errorKey = Object.keys(errorFields).find(
        (key) => ERRORS[key as keyof typeof ERRORS] === error.message[0]
      );

      if (errorKey) {
        // errors[errorFields[errorKey]?.field] - для задания имён полей на клиенте
        // ниже поле ошибки берется с бэка
        // errors[error.property] = errorFields[errorKey].message

        // errors[error?.property] = personalErrorFields?.[error?.property]?.[errorKey] ts

        const fieldName = error?.property as string;
        errors[fieldName] =
          personalErrorFields?.[fieldName]?.[errorKey as keyof typeof ERRORS] ||
          true;
      }
    });

    const translatedErrors: { [key: string]: string | boolean } = {};

    for (const key in errors) {
      const errorValue = errors[key];
      translatedErrors[key] = errorValue;
    }

    return translatedErrors;
    // return errors
  } else {
    // return {
    // 	[errorFields[errorObject.message]?.field]:
    // 		errorFields[errorObject.message]?.message,
    // }

    // toast.error(
    // 	React.createElement(ToastMsg, {
    // 		message: errorFields[errorObject.message]?.message,
    // 	}),
    // 	{ icon: false },
    // )

    const errorMessage =
      errorFields[errorObject.message as keyof ErrorFields]?.message;

    return {
      global: true,
      message: errorMessage,
    };
  }
};

// const errorObject = {
// 	message: "NOT_EXIST",
// 	statusCode: 504,
// }
//
// const errorObject = {
// 	message: [
// 		{
// 			property: "email",
// 			original: {
// 				classValidatorLikeError: "class validator like error",
// 			},
// 			message: ["ALREADY_USING"],
// 		},
// 		{
// 			property: "code",
// 			original: {
// 				classValidatorLikeError: "class validator like error",
// 			},
// 			message: ["BAD_CODE"],
// 		},
// 	],
// 	error: "Bad Request",
// 	statusCode: 400,
// }

// const errors = getFieldsErrors(errorObject);
// console.log(JSON.stringify(getFieldsErrors(errorObject)));
// console.log(errors.code);
