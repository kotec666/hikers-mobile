import { getNoun } from "@/helpers/getNoun";

export interface IErrorMessages {
  minLength: string;
  maxLength: string;
  required: string;
  email: string;
  isNumber: string;
  notNumber: string;
  optionalMin: (count: number) => string;
  optionalMax: (count: number) => string;
  fileConstraints: (string: string) => string;
  customMessage: (string: string) => string;
}

export const useErrorMessage = (
  minCount: number = 1,
  maxCount: number = 100
) => {
  const symbolWord = {
    one: "символ",
    two: "символа",
    five: "символов",
  };
  const getParameterNoun = (count: number) => {
    return getNoun(+count, symbolWord.one, symbolWord.two, symbolWord.five);
  };

  const ErrorMessages: IErrorMessages = {
    minLength: `Минимальная длина ${getParameterNoun(minCount)}`,
    maxLength: `Максимальная длина ${getParameterNoun(maxCount)}`,
    required: "Обязательное поле",
    email: "Неверный формат",
    isNumber: "Поле может содержать только числа",
    notNumber: "Поле не может содержать числа",
    optionalMin: (count: number) => {
      return `Минимальная длина ` + getParameterNoun(count);
    },
    optionalMax: (count: number) => {
      return `Максимальная длина ` + getParameterNoun(count);
    },
    fileConstraints: (string: string) => {
      return `Только ` + string + ` файлы доступны`;
    },
    customMessage: (string: string) => {
      return `${string}`;
    },
  };
  return { ErrorMessages };
};
